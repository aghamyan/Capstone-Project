import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE } from "../../utils/apiConfig"
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CProgress,
  CProgressBar,
  CRow,
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilHeart, cilLockLocked, cilUser, cilEnvelopeClosed } from "@coreui/icons"

const Register = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [message, setMessage] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [aiQuestion, setAiQuestion] = useState(null)
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [aiField, setAiField] = useState(null)
  const [aiAnswers, setAiAnswers] = useState([])
  const [aiInput, setAiInput] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiDone, setAiDone] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [aiCompletionNote, setAiCompletionNote] = useState("")
  const fallbackQuestions = useMemo(
    () => [
      {
        field: "primaryGoal",
        question: "What are you hoping to improve most right now — sport, lifestyle, or productivity?",
        suggestions: ["Sport routine", "Lifestyle balance", "Productivity boost"],
      },
      {
        field: "focusArea",
        question: "Which area should we focus on first?",
        suggestions: ["Energy", "Focus", "Recovery", "Mindfulness"],
      },
      {
        field: "dailyCommitment",
        question: "How much time can you commit each day?",
        suggestions: ["5 minutes", "15 minutes", "30 minutes", "Flexible"],
      },
      {
        field: "experienceLevel",
        question: "How experienced are you with building habits?",
        suggestions: ["Just starting", "Finding my rhythm", "Leveling up", "Habit pro"],
      },
      {
        field: "supportPreference",
        question: "What style of support helps you stick with habits?",
        suggestions: ["Gentle nudges", "Focused reminders", "Deep insights", "Celebrate wins"],
      },
      {
        field: "motivation",
        question: "What’s motivating you to start now?",
        suggestions: ["Feel stronger", "Reduce stress", "Improve focus", "Healthier routine"],
      },
    ],
    []
  )
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  })

  const steps = useMemo(
    () => [
      {
        title: "Create your account",
        description: "Start with the essentials so we can welcome you back each day.",
      },
      {
        title: "Verify your email",
        description: "Enter the 6-digit code we just sent to confirm it’s really you.",
      },
    ],
    []
  )

  const progressValue = Math.round(((step + 1) / steps.length) * 100)
  const isLastStep = step === steps.length - 1

  const getFallbackQuestion = (answers = aiAnswers) => {
    const answered = new Set((answers || []).map((item) => item.field).filter(Boolean))
    const next = fallbackQuestions.find((item) => !answered.has(item.field))
    return next
      ? { done: false, field: next.field, question: next.question, suggestions: next.suggestions }
      : {
          done: true,
          field: null,
          question: "Thanks! We’ve got what we need. Ready to finish signup?",
          suggestions: [],
        }
  }

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validateStep = () => {
    if (step === 0) {
      if (!form.name.trim() || !form.email.trim() || !form.password) {
        setMessage({ type: "danger", text: "Please add your name, email, and a password to continue." })
        return false
      }
    }

    setMessage(null)
    return true
  }

  useEffect(() => {
    if (step === 1 && !aiQuestion && !aiDone && !aiLoading && !aiError) {
      loadNextQuestion(aiAnswers)
    }
  }, [aiAnswers, aiDone, aiError, aiLoading, aiQuestion, step])

  const requestVerificationCode = async () => {
    try {
      setSendingCode(true)
      setMessage(null)
      const response = await fetch(`${API_BASE}/users/register/request-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 503 && data?.code === "EMAIL_CONFIG_MISSING") {
          console.warn("Email configuration missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.")
          throw new Error(
            "Email verification is temporarily unavailable. Please try again later or contact support."
          )
        }

        throw new Error(data?.error || "We couldn’t send the verification code.")
      }

      setCodeSent(true)
      setMessage({ type: "success", text: "Verification code sent to your email." })
      setStep((prev) => Math.min(prev + 1, steps.length - 1))
    } catch (err) {
      console.error("Verification request error:", err)
      setMessage({ type: "danger", text: err.message || "Unable to send verification code." })
    } finally {
      setSendingCode(false)
    }
  }

  const handleNext = async () => {
    if (!validateStep()) return

    if (step === steps.length - 2) {
      await requestVerificationCode()
      return
    }

    setStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handleBack = () => {
    setMessage(null)
    setStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (step !== steps.length - 1) {
      handleNext()
      return
    }

    if (!verificationCode.trim()) {
      setMessage({ type: "warning", text: "Please enter the verification code from your email." })
      return
    }

    try {
      setSubmitting(true)
      setMessage(null)
      const response = await fetch(`${API_BASE}/users/register/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          code: verificationCode.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Verification failed")
      }

      setMessage({
        type: "success",
        text: "Welcome aboard! Your plan is ready—let’s log in and get started.",
      })
      setTimeout(() => navigate("/login"), 1800)
    } catch (err) {
      console.error("Register error:", err)
      setMessage({ type: "danger", text: err.message || "Could not verify the code." })
    } finally {
      setSubmitting(false)
    }
  }

  const renderStepContent = () => {
    if (step === 0) {
      return (
        <>
          <CInputGroup className="mb-3">
            <CInputGroupText>
              <CIcon icon={cilUser} />
            </CInputGroupText>
            <CFormInput
              name="name"
              placeholder="Your name"
              autoComplete="name"
              value={form.name}
              onChange={handleFieldChange}
              required
            />
          </CInputGroup>
          <CInputGroup className="mb-3">
            <CInputGroupText>
              <CIcon icon={cilEnvelopeClosed} />
            </CInputGroupText>
            <CFormInput
              name="email"
              type="email"
              placeholder="Email address"
              autoComplete="email"
              value={form.email}
              onChange={handleFieldChange}
              required
            />
          </CInputGroup>
          <CInputGroup className="mb-1">
            <CInputGroupText>
              <CIcon icon={cilLockLocked} />
            </CInputGroupText>
            <CFormInput
              name="password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleFieldChange}
              required
            />
          </CInputGroup>
          <div className="small text-body-secondary mt-1">
            Use at least 8 characters with a mix of letters and numbers.
          </div>
        </>
      )
    }

    return (
      <div className="d-flex flex-column gap-3">
        <div className="p-3 bg-light rounded border">
          <div className="d-flex align-items-center gap-2 mb-1">
            <CIcon icon={cilEnvelopeClosed} className="text-primary" />
            <h5 className="mb-0">Check your inbox</h5>
          </div>
          <p className="mb-2">We’ve sent a 6-digit code to {form.email || "your email"}. Enter it below to finish.</p>
          <CButton
            color="link"
            className="px-0"
            type="button"
            onClick={requestVerificationCode}
            disabled={sendingCode || submitting}
          >
            {sendingCode ? "Sending another code..." : "Didn’t get it? Resend code"}
          </CButton>
        </div>

        <CInputGroup className="mb-2">
          <CInputGroupText>
            <CIcon icon={cilLockLocked} />
          </CInputGroupText>
          <CFormInput
            name="verificationCode"
            type="text"
            placeholder="Enter 6-digit code"
            autoComplete="one-time-code"
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value)}
            maxLength={6}
            required
          />
        </CInputGroup>
        <div className="small text-body-secondary">Check your spam folder if you don’t see the code.</div>
        {codeSent && (
          <CAlert color="info" className="mt-2">
            Code sent! It expires in 15 minutes.
          </CAlert>
        )}
      </div>
    )
  }

  return (
    <div className="min-vh-100 d-flex flex-row align-items-center bg-light">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol lg={7} xl={6}>
            <CCard className="p-4 shadow-sm border-0">
              <CCardBody>
                <CForm onSubmit={handleSubmit}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h3 className="mb-1">{steps[step].title}</h3>
                      <p className="text-medium-emphasis mb-0">{steps[step].description}</p>
                    </div>
                    <div className="text-end small text-medium-emphasis">
                      Step {step + 1} of {steps.length}
                    </div>
                  </div>
                  <CProgress className="mb-4" height={6}>
                    <CProgressBar value={progressValue} color="primary" />
                  </CProgress>

                  {renderStepContent()}

                  {message && (
                    <CAlert color={message.type} className="mt-4">
                      {message.text}
                    </CAlert>
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <CButton
                      color="secondary"
                      variant="outline"
                      type="button"
                      disabled={step === 0}
                      onClick={handleBack}
                    >
                      Back
                    </CButton>
                    {isLastStep ? (
                      <CButton color="success" type="submit" disabled={submitting}>
                        <CIcon icon={cilHeart} className="me-2" />
                        {submitting ? "Verifying..." : "Start my journey"}
                      </CButton>
                    ) : (
                      <CButton color="primary" type="button" onClick={handleNext} disabled={sendingCode}>
                        {sendingCode && step === steps.length - 2 ? "Sending code..." : "Continue"}
                      </CButton>
                    )}
                  </div>

                  <div className="text-center mt-3">
                    <CButton color="link" className="px-0" onClick={() => navigate("/login")} disabled={submitting}>
                      Already have an account? Log in
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
