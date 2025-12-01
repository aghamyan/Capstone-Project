import React from "react"
import { CAlert, CBadge, CContainer, CSpinner } from "@coreui/react"
import { usePlannerData } from "../../hooks/usePlannerData"
import { MyScheduleSection } from "../planner/sections/MyScheduleSection"
import { AddScheduleSection } from "../planner/sections/AddScheduleSection"
import { SmartSchedulingSection } from "../planner/sections/SmartSchedulingSection"
import { RoutineBuilderSection } from "../planner/sections/RoutineBuilderSection"
import { FocusModeSection } from "../planner/sections/FocusModeSection"
import { TimeInsightsSection } from "../planner/sections/TimeInsightsSection"
import { WeeklyReviewSection } from "../planner/sections/WeeklyReviewSection"
import { SyncSection } from "../planner/sections/SyncSection"

const Planner = () => {
  const user = JSON.parse(localStorage.getItem("user"))
  const userId = user?.id
  const { loading, error, scheduleStats, calendarOverview, aiData, insights, sessions, draftReview, reviews, schedules } =
    usePlannerData(userId)

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  if (error) {
    return <CAlert color="danger">{error}</CAlert>
  }

  return (
    <CContainer fluid className="pt-3 pb-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Planner</h2>
          <p className="text-body-secondary mb-0">Modern, simple, efficient planning across seven sections plus improved sync.</p>
        </div>
        <CBadge color="primary" className="px-3 py-2">Unified scheduling</CBadge>
      </div>

      <MyScheduleSection stats={scheduleStats} calendarOverview={calendarOverview} />
      <AddScheduleSection schedules={schedules} />
      <SmartSchedulingSection aiData={aiData} />
      <RoutineBuilderSection />
      <FocusModeSection sessions={sessions} />
      <TimeInsightsSection insights={insights} />
      <WeeklyReviewSection draftReview={draftReview} reviews={reviews} />
      <SyncSection calendarOverview={calendarOverview} />
    </CContainer>
  )
}

export default Planner
