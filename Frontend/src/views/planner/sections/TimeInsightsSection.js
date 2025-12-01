import React from "react"
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CProgress, CRow } from "@coreui/react"

export const TimeInsightsSection = ({ insights }) => (
  <div className="mb-4">
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
      <div>
        <h4 className="mb-1">Time Insights</h4>
        <p className="text-body-secondary mb-0">Scheduled vs completed hours, heatmaps, workload, and overbooking alerts.</p>
      </div>
      <CBadge color={insights?.overbookedDays ? "warning" : "success"}>
        {insights?.overbookedDays ? `${insights.overbookedDays} overbooked days` : "Healthy load"}
      </CBadge>
    </div>

    <CRow className="g-3">
      <CCol lg={4}>
        <CCard className="shadow-sm h-100">
          <CCardHeader className="fw-semibold">Totals</CCardHeader>
          <CCardBody>
            <div className="d-flex justify-content-between mb-2">
              <span>Scheduled vs completed</span>
              <span className="fw-semibold">{insights?.totals?.completed || 0} mins</span>
            </div>
            <CProgress value={Math.min(100, insights?.totals?.completed / 10 || 0)} className="mb-3" />
            <div className="small text-body-secondary">Missed: {insights?.totals?.missed || 0} · Cancelled: {insights?.totals?.cancelled || 0}</div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol lg={4}>
        <CCard className="shadow-sm h-100">
          <CCardHeader className="fw-semibold">Most used habits</CCardHeader>
          <CCardBody className="d-flex flex-column gap-2">
            {Object.entries(insights?.habitCounts || {}).map(([key, value]) => (
              <div key={key} className="d-flex justify-content-between align-items-center">
                <span>{key === "custom" ? "Custom blocks" : `Habit ${key}`}</span>
                <CBadge color="info">{value}</CBadge>
              </div>
            ))}
            {!insights?.habitCounts && <p className="mb-0 text-body-secondary">No data yet.</p>}
          </CCardBody>
        </CCard>
      </CCol>
      <CCol lg={4}>
        <CCard className="shadow-sm h-100">
          <CCardHeader className="fw-semibold">Hourly heatmap</CCardHeader>
          <CCardBody className="d-flex flex-column gap-2">
            {insights?.heatmap?.slice(0, 4).map((entry) => (
              <div key={entry.date} className="d-flex justify-content-between align-items-center">
                <span>{entry.date}</span>
                <CBadge color={entry.duration > 60 ? "success" : "secondary"}>{entry.duration} mins</CBadge>
              </div>
            ))}
            {!insights?.heatmap?.length && <p className="mb-0 text-body-secondary">Complete a focus session to unlock insights.</p>}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
)
