import React from "react"
import { CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CListGroup, CListGroupItem, CRow } from "@coreui/react"
import { cilPlaylistAdd } from "@coreui/icons"
import CIcon from "@coreui/icons-react"

const sampleSteps = [
  { title: "Warm-up & review", estimate: 10, habit: "Stretch" },
  { title: "Deep work block", estimate: 50, habit: "Deep Work" },
  { title: "Reflect & log", estimate: 10, habit: "Journal" },
]

export const RoutineBuilderSection = () => (
  <div className="mb-4">
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
      <div>
        <h4 className="mb-1">Create multi-step routines</h4>
        <p className="text-body-secondary mb-0">Drag-and-drop style steps, habit links, and expansion into your schedule.</p>
      </div>
      <CButton color="primary" size="sm">
        <CIcon icon={cilPlaylistAdd} className="me-2" /> New routine
      </CButton>
    </div>

    <CRow className="g-3">
      <CCol lg={6}>
        <CCard className="shadow-sm h-100">
          <CCardHeader className="fw-semibold">Steps</CCardHeader>
          <CCardBody>
            <CListGroup>
              {sampleSteps.map((step, index) => (
                <CListGroupItem key={step.title} className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold">{index + 1}. {step.title}</div>
                    <div className="text-body-secondary small">{step.habit}</div>
                  </div>
                  <CBadge color="secondary">{step.estimate} mins</CBadge>
                </CListGroupItem>
              ))}
            </CListGroup>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol lg={6}>
        <CCard className="shadow-sm h-100">
          <CCardHeader className="fw-semibold">Expand to Schedule</CCardHeader>
          <CCardBody className="d-flex flex-column gap-3">
            <p className="mb-0 text-body-secondary">Pick days to place this routine. StepHabit will auto-create the blocks.</p>
            <div className="d-flex flex-wrap gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <CBadge key={day} color="light" textColor="dark" className="p-2 border">
                  {day}
                </CBadge>
              ))}
            </div>
            <CButton color="success">Expand now</CButton>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
)
