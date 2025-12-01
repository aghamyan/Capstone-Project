import React, { useMemo } from "react"
import { CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CFormInput, CFormSelect, CRow } from "@coreui/react"

const templates = [
  { name: "Deep Work", duration: 120, color: "primary" },
  { name: "Focus 50", duration: 50, color: "info" },
  { name: "Workout", duration: 60, color: "danger" },
  { name: "Study Session", duration: 90, color: "warning" },
  { name: "Morning Routine", duration: 45, color: "success" },
  { name: "Evening Shutdown", duration: 30, color: "secondary" },
]

export const AddScheduleSection = ({ schedules }) => {
  const defaultDuration = useMemo(() => {
    if (!schedules?.length) return 45
    const durations = schedules
      .map((s) => (s.starttime && s.endtime ? s.endtime.split(":")[0] - s.starttime.split(":")[0] : 1))
      .filter(Boolean)
    return Math.round(durations.reduce((acc, d) => acc + d, 0) / durations.length) * 60
  }, [schedules])

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
        <div>
          <h4 className="mb-1">Create new time blocks</h4>
          <p className="text-body-secondary mb-0">Templates, priorities, tags, and live preview to keep scheduling quick.</p>
        </div>
        <CBadge color="info">Suggested duration: {defaultDuration} mins</CBadge>
      </div>

      <CRow className="g-3">
        <CCol lg={8}>
          <CCard className="shadow-sm h-100">
            <CCardHeader className="fw-semibold">Time block details</CCardHeader>
            <CCardBody className="d-flex flex-column gap-3">
              <CRow className="g-3">
                <CCol md={6}>
                  <CFormInput label="Title" placeholder="e.g. Deep Work Sprint" />
                </CCol>
                <CCol md={3}>
                  <CFormSelect label="Priority" options={["LOW", "MEDIUM", "HIGH"]} />
                </CCol>
                <CCol md={3}>
                  <CFormSelect label="Color tag" options={["Primary", "Success", "Info", "Warning", "Danger"]} />
                </CCol>
              </CRow>
              <CRow className="g-3">
                <CCol md={4}>
                  <CFormInput type="date" label="Date" />
                </CCol>
                <CCol md={4}>
                  <CFormInput type="time" label="Start" />
                </CCol>
                <CCol md={4}>
                  <CFormInput type="time" label="End" />
                </CCol>
              </CRow>
              <CButton color="primary">Save time block</CButton>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={4}>
          <CCard className="shadow-sm h-100">
            <CCardHeader className="fw-semibold">Templates</CCardHeader>
            <CCardBody className="d-flex flex-column gap-2">
              {templates.map((template) => (
                <div key={template.name} className="d-flex justify-content-between align-items-center p-2 rounded border">
                  <div>
                    <div className="fw-semibold">{template.name}</div>
                    <small className="text-body-secondary">{template.duration} mins</small>
                  </div>
                  <CBadge color={template.color}>{template.color}</CBadge>
                </div>
              ))}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}
