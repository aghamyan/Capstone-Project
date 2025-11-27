import React from "react"
import CIcon from "@coreui/icons-react"
import { CNavItem } from "@coreui/react"
import { cilCalendar, cilChatBubble, cilList, cilSettings, cilSpeedometer, cilStar } from "@coreui/icons"

const _nav = [
  {
    component: CNavItem,
    name: "Dashboard",
    to: "/dashboard",
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Planner",
    to: "/schedules",
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Habits",
    to: "/habit-library",
    icon: <CIcon icon={cilList} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Challenges",
    to: "/dailychallenge",
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "AI Coach",
    to: "/ai-coach",
    icon: <CIcon icon={cilChatBubble} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Settings",
    to: "/settings",
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
]

export default _nav
