import React from "react"
import { CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CProgressBar, CRow } from "@coreui/react"
import { cilLightbulb, cilLoop1 } from "@coreui/icons"
import CIcon from "@coreui/icons-react"

const modes = ["Productivity", "Wellness", "Balanced", "Light Week"]

export const SmartSchedulingSection = ({ aiData }) => (
  <div className="mb-4">
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
      <div>
        <h4 className="mb-1">AI assistant to optimize your week</h4>
        <p className="text-body-secondary mb-0">Suggestions, optimizers, conflict resolver, and pattern recognition.</p>
      </div>
      <div className="d-flex gap-2 flex-wrap">
        {modes.map((mode) => (
          <CButton key={mode} color="primary" variant={aiData?.mode === mode.toLowerCase() ? "" : "outline"} size="sm">
            {mode}
          </CButton>
        ))}
      </div>
    </div>

    <CRow className="g-3">
      <CCol lg={8}>
        <CCard className="shadow-sm h-100">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <span className="fw-semibold">AI Suggestions</span>
            <CButton color="success" size="sm">
              <CIcon icon={cilLightbulb} className="me-2" /> Optimize Week
            </CButton>
          </CCardHeader>
          <CCardBody className="d-flex flex-column gap-3">
            {aiData?.suggestions?.map((suggestion) => (
              <div key={suggestion.id} className="d-flex align-items-center justify-content-between p-2 rounded border">
                <div>
                  <div className="fw-semibold">{suggestion.title}</div>
                  <div className="text-body-secondary small">
                    {suggestion.suggested_start} → {suggestion.suggested_end}
                  </div>
                </div>
                <CBadge color="info">{suggestion.duration_minutes} mins</CBadge>
              </div>
            ))}
            {!aiData?.suggestions?.length && (
              <p className="mb-0 text-body-secondary">No AI suggestions yet. Try Optimize Week to get ideas.</p>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      <CCol lg={4}>
        <CCard className="shadow-sm h-100">
          <CCardHeader className="fw-semibold">Pattern recognition</CCardHeader>
          <CCardBody className="d-flex flex-column gap-3">
            <div>
              <div className="text-body-secondary small">Most productive hours</div>
              <CProgressBar value={82} color="primary" className="mt-1" />
            </div>
            <div>
              <div className="text-body-secondary small">Weak hours</div>
              <CProgressBar value={30} color="warning" className="mt-1" />
            </div>
            <div>
              <div className="text-body-secondary small">Largest free window</div>
              <div className="fw-semibold">{aiData?.freeWindows?.[0]?.day || "TBD"}</div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <CIcon icon={cilLoop1} /> Conflict resolver ready
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
)
