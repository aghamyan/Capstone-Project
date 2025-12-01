import React from "react"
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
} from "@coreui/react"
import { cilBolt, cilCalendar, cilCaretRight, cilClock, cilLoopCircular } from "@coreui/icons"
import CIcon from "@coreui/icons-react"

const ScheduleHighlights = ({ stats }) => (
  <CRow className="g-3 mb-3">
    <CCol lg={3} sm={6}>
      <CCard className="h-100 shadow-sm">
        <CCardBody>
          <div className="text-uppercase text-body-secondary small mb-1">Total focus hours</div>
          <h3 className="fw-bolder mb-0">{stats.summary.totalFocusHours}h</h3>
        </CCardBody>
      </CCard>
    </CCol>
    <CCol lg={3} sm={6}>
      <CCard className="h-100 shadow-sm">
        <CCardBody>
          <div className="text-uppercase text-body-secondary small mb-1">Busy days</div>
          <h3 className="fw-bolder mb-0">{stats.summary.busyDays}</h3>
        </CCardBody>
      </CCard>
    </CCol>
    <CCol lg={3} sm={6}>
      <CCard className="h-100 shadow-sm">
        <CCardBody>
          <div className="text-uppercase text-body-secondary small mb-1">Best day</div>
          <h3 className="fw-bolder mb-0">{stats.summary.bestDay?.day || "TBD"}</h3>
          <small className="text-body-secondary">
            {stats.summary.bestDay ? `${Math.round(stats.summary.bestDay.minutes / 60)}h planned` : "coming soon"}
          </small>
        </CCardBody>
      </CCard>
    </CCol>
    <CCol lg={3} sm={6}>
      <CCard className="h-100 shadow-sm">
        <CCardBody>
          <div className="text-uppercase text-body-secondary small mb-1">Next free window</div>
          <h3 className="fw-bolder mb-0">{stats.freeWindows?.[0]?.start || "—"}</h3>
          <small className="text-body-secondary">{stats.freeWindows?.[0]?.day || "auto-detected"}</small>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
)

const ScheduleConflicts = ({ conflicts }) => (
  <CCard className="shadow-sm h-100">
    <CCardHeader className="d-flex justify-content-between align-items-center">
      <span className="fw-semibold">Conflicts</span>
      <CBadge color={conflicts.length ? "danger" : "success"}>
        {conflicts.length ? `${conflicts.length} overlaps` : "Clean"}
      </CBadge>
    </CCardHeader>
    <CCardBody>
      {conflicts.length === 0 && <p className="mb-0 text-body-secondary">No overlaps detected for today.</p>}
      {conflicts.map((conflict, idx) => (
        <div key={`${conflict.first.id}-${idx}`} className="d-flex align-items-start gap-3 mb-3">
          <CIcon icon={cilCaretRight} className="text-danger" />
          <div>
            <strong>{conflict.first.custom_title || conflict.first.notes || "Time block"}</strong>
            <div className="text-body-secondary small">
              {conflict.first.starttime} - {conflict.first.endtime} vs {conflict.second.starttime} - {conflict.second.endtime}
            </div>
          </div>
        </div>
      ))}
    </CCardBody>
  </CCard>
)

const FreeWindows = ({ freeWindows }) => (
  <CCard className="shadow-sm h-100">
    <CCardHeader className="d-flex justify-content-between align-items-center">
      <span className="fw-semibold">Upcoming free windows</span>
      <CBadge color="info">AI assisted</CBadge>
    </CCardHeader>
    <CCardBody className="d-flex flex-column gap-3">
      {freeWindows.slice(0, 4).map((slot) => (
        <div key={`${slot.day}-${slot.start}`} className="d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-semibold">{slot.day}</div>
            <div className="text-body-secondary small">
              {slot.start} - {slot.end} ({Math.round(slot.duration / 60)}h)
            </div>
          </div>
          <CButton color="primary" size="sm" variant="outline">
            Fill
          </CButton>
        </div>
      ))}
      {freeWindows.length === 0 && <span className="text-body-secondary">No free space this week—try the optimizer.</span>}
    </CCardBody>
  </CCard>
)

export const MyScheduleSection = ({ stats, calendarOverview }) => {
  const nextEvent = calendarOverview?.events?.[0]
  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
        <div>
          <h4 className="mb-1">Daily & Weekly Overview</h4>
          <p className="text-body-secondary mb-0">Today at a glance with conflicts, focus hours, and free windows.</p>
        </div>
        <div className="d-flex gap-2">
          <CButton color="primary" variant="outline" size="sm">
            <CIcon icon={cilCalendar} className="me-2" /> Weekly calendar
          </CButton>
          <CButton color="primary" size="sm">
            <CIcon icon={cilClock} className="me-2" /> Daily timeline
          </CButton>
        </div>
      </div>

      <ScheduleHighlights stats={stats} />

      <CRow className="g-3">
        <CCol lg={8}>
          <CCard className="shadow-sm h-100">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Today at a Glance</span>
              <CBadge color="secondary" className="d-flex align-items-center gap-2">
                <CIcon icon={cilBolt} /> {stats.todayBlocks.length} habits planned
              </CBadge>
            </CCardHeader>
            <CCardBody className="d-flex flex-column gap-3">
              {stats.todayBlocks.map((block) => (
                <div key={block.id} className="d-flex flex-column flex-sm-row gap-2 align-items-sm-center">
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{block.custom_title || block.notes || block.habit?.title || "Focus block"}</div>
                    <div className="text-body-secondary small">
                      {block.starttime} - {block.endtime || block.starttime} · {block.priority || "BALANCED"}
                    </div>
                  </div>
                  <CBadge color="info" className="text-uppercase">{block.repeat || "single"}</CBadge>
                </div>
              ))}
              {stats.todayBlocks.length === 0 && (
                <p className="mb-0 text-body-secondary">No habits scheduled today. Use quick actions to fill the day.</p>
              )}

              {nextEvent && (
                <div className="p-3 rounded bg-light border small">
                  <div className="fw-semibold">Next event from sync</div>
                  <div className="text-body-secondary">
                    {nextEvent.title} · {new Date(nextEvent.start_time).toLocaleString()}
                  </div>
                </div>
              )}

              <div className="d-flex flex-wrap gap-2">
                <CButton color="primary" size="sm">
                  <CIcon icon={cilClock} className="me-2" /> Add Time Block
                </CButton>
                <CButton color="secondary" variant="outline" size="sm">
                  <CIcon icon={cilLoopCircular} className="me-2" /> Reschedule All
                </CButton>
                <CButton color="success" size="sm">
                  AI Optimize Today
                </CButton>
                <CButton color="info" variant="outline" size="sm">
                  Jump to Next Free Window
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={4}>
          <ScheduleConflicts conflicts={stats.conflicts} />
          <div className="mt-3">
            <FreeWindows freeWindows={stats.freeWindows} />
          </div>
        </CCol>
      </CRow>
    </div>
  )
}
