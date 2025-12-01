import React from "react"
import { CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CListGroup, CListGroupItem, CRow } from "@coreui/react"
import { cilCloudCheck } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import CalendarSync from "../../sync/CalendarSync"

export const SyncSection = ({ calendarOverview }) => {
  const upcomingImports = calendarOverview?.events?.slice(0, 4) || []
  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
        <div>
          <h4 className="mb-1">Calendar Sync</h4>
          <p className="text-body-secondary mb-0">Preview imported events, monitor sync health, and control channels.</p>
        </div>
        <CBadge color="success" className="d-flex align-items-center gap-2">
          <CIcon icon={cilCloudCheck} /> Sync healthy
        </CBadge>
      </div>

      <CRow className="g-3">
        <CCol lg={7}>
          <CCard className="shadow-sm h-100">
            <CCardHeader className="fw-semibold">Sync center</CCardHeader>
            <CCardBody>
              <CalendarSync />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={5}>
          <CCard className="shadow-sm h-100">
            <CCardHeader className="fw-semibold">Upcoming imported events</CCardHeader>
            <CCardBody>
              <CListGroup>
                {upcomingImports.map((event) => (
                  <CListGroupItem key={event.id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">{event.title}</div>
                      <div className="text-body-secondary small">{new Date(event.start_time).toLocaleString()}</div>
                    </div>
                    <CBadge color="info">{event.source}</CBadge>
                  </CListGroupItem>
                ))}
                {!upcomingImports.length && <p className="mb-0 text-body-secondary p-2">No imports yet.</p>}
              </CListGroup>
            </CCardBody>
          </CCard>
          <div className="mt-3 d-flex gap-2">
            <CButton color="primary" variant="outline" size="sm">Habits → calendar</CButton>
            <CButton color="primary" variant="outline" size="sm">Calendar → StepHabit</CButton>
            <CButton color="primary" size="sm">Both</CButton>
          </div>
        </CCol>
      </CRow>
    </div>
  )
}
