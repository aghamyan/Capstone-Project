import React from "react"
import { CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CFormTextarea, CProgressBar, CRow } from "@coreui/react"
import { cilMediaPlay, cilNotes } from "@coreui/icons"
import CIcon from "@coreui/icons-react"

export const FocusModeSection = ({ sessions }) => (
  <div className="mb-4">
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
      <div>
        <h4 className="mb-1">Focus Mode</h4>
        <p className="text-body-secondary mb-0">Pomodoro timer, distraction log, and session summaries linked to your schedule.</p>
      </div>
      <CButton color="danger" size="sm">
        <CIcon icon={cilMediaPlay} className="me-2" /> Start Pomodoro
      </CButton>
    </div>

    <CRow className="g-3">
      <CCol lg={8}>
        <CCard className="shadow-sm h-100">
          <CCardHeader className="fw-semibold">Session notes</CCardHeader>
          <CCardBody className="d-flex flex-column gap-3">
            <CFormTextarea placeholder="Capture distractions, mood, and output" rows={4} />
            <CButton color="primary">Link to schedule block</CButton>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol lg={4}>
        <CCard className="shadow-sm h-100">
          <CCardHeader className="fw-semibold">Recent sessions</CCardHeader>
          <CCardBody className="d-flex flex-column gap-3">
            {sessions.slice(0, 3).map((session) => (
              <div key={session.id} className="p-2 border rounded">
                <div className="fw-semibold">{session.session_date}</div>
                <div className="text-body-secondary small">{session.duration_minutes} mins · {session.mood || "steady"}</div>
              </div>
            ))}
            {!sessions.length && <p className="mb-0 text-body-secondary">No focus sessions yet.</p>}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
)
