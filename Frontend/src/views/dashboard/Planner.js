import React, { useState } from "react"
import { CBadge, CNav, CNavItem, CNavLink, CTabContent, CTabPane } from "@coreui/react"

import CalendarSync from "../sync/CalendarSync"
import MyRoutine from "../pages/MyRoutine"
import SmartScheduler from "./SmartScheduler"
import Schedules from "./Schedules"

const Planner = () => {
  const [activeTab, setActiveTab] = useState("schedule")

  const handleSyncClick = () => setActiveTab("sync")

  return (
    <div className="pt-3 pb-5 position-relative">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h2 className="fw-bold mb-1">Planner</h2>
          <p className="text-body-secondary mb-0">
            One unified place for your schedule, smart suggestions, and calendar sync.
          </p>
        </div>
        <CBadge color="primary" className="px-3 py-2 d-flex align-items-center gap-2">
          <span role="img" aria-label="planner">
            📅
          </span>
          Unified scheduling
        </CBadge>
      </div>

      <CNav variant="tabs" role="tablist" className="mb-3">
        <CNavItem>
          <CNavLink active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")}>
            My Schedule
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeTab === "add"} onClick={() => setActiveTab("add")}>
            Add Schedule
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeTab === "smart"} onClick={() => setActiveTab("smart")}>
            Smart Scheduling
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeTab === "sync"} onClick={() => setActiveTab("sync")}>
            Sync
          </CNavLink>
        </CNavItem>
      </CNav>

      <CTabContent>
        <CTabPane visible={activeTab === "schedule"}>
          <MyRoutine onSyncClick={handleSyncClick} />
        </CTabPane>
        <CTabPane visible={activeTab === "add"}>
          <div className="mt-3">
            <Schedules />
          </div>
        </CTabPane>
        <CTabPane visible={activeTab === "smart"}>
          <div className="mt-3">
            <SmartScheduler />
          </div>
        </CTabPane>
        <CTabPane visible={activeTab === "sync"}>
          <div className="mt-3">
            <CalendarSync />
          </div>
        </CTabPane>
      </CTabContent>
    </div>
  )
}

export default Planner
