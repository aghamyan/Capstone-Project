import React from "react"
import { CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CFormTextarea, CRow } from "@coreui/react"
import { cilLoopCircular } from "@coreui/icons"
import CIcon from "@coreui/icons-react"

export const WeeklyReviewSection = ({ draftReview, reviews }) => (
  <div className="mb-4">
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
      <div>
        <h4 className="mb-1">Weekly Review</h4>
        <p className="text-body-secondary mb-0">Reflect, learn, and auto-generate next week’s plan in draft mode.</p>
      </div>
      <CBadge color="primary">Draft ready</CBadge>
    </div>

    <CRow className="g-3">
      <CCol lg={6}>
        <CCard className="shadow-sm h-100">
          <CCardHeader className="fw-semibold">Reflection prompts</CCardHeader>
          <CCardBody className="d-flex flex-column gap-3">
            {(draftReview?.prompts || []).map((prompt) => (
              <CFormTextarea key={prompt} label={prompt} rows={2} />
            ))}
            {!draftReview?.prompts?.length && <p className="mb-0 text-body-secondary">Prompts will appear after your first week.</p>}
            <CButton color="success">Save reflection</CButton>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol lg={6}>
        <CCard className="shadow-sm h-100">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <span className="fw-semibold">Suggested improvements</span>
            <CButton color="secondary" size="sm">
              <CIcon icon={cilLoopCircular} className="me-2" /> Generate next week
            </CButton>
          </CCardHeader>
          <CCardBody className="d-flex flex-column gap-2">
            {draftReview?.suggestions && (
              <>
                <div className="p-2 border rounded">Focus: {draftReview.suggestions.focus}</div>
                <div className="p-2 border rounded">Wellness: {draftReview.suggestions.wellBeing}</div>
                <div className="p-2 border rounded">Automation: {draftReview.suggestions.automation}</div>
              </>
            )}
            <div className="small text-body-secondary mt-2">Previous reviews</div>
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="d-flex justify-content-between align-items-center border rounded p-2">
                <span>{review.week_start}</span>
                <CBadge color="info">Saved</CBadge>
              </div>
            ))}
            {!reviews.length && <p className="mb-0 text-body-secondary">No saved reviews yet.</p>}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
)
