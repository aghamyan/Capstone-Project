import React from "react"
import CIcon from "@coreui/icons-react"
import { CNavItem, CNavTitle } from "@coreui/react"
import { cilCalendar, cilGroup, cilList, cilSpeedometer, cilUser } from "@coreui/icons"

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Planner',
    to: '/planner',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },

  {
    component: CNavTitle,
    name: 'Habit Tools',
  },
  {
    component: CNavItem,
    name: 'Habits',
    to: '/habits',
    icon: <CIcon icon={cilList} customClassName="nav-icon" />,
  },

  {
    component: CNavTitle,
    name: 'Community',
  },
  {
    component: CNavItem,
    name: 'Community',
    to: '/community',
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
  },

  {
    component: CNavTitle,
    name: 'Profile',
  },
  {
    component: CNavItem,
    name: 'Profile',
    to: '/profile',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
]

export default _nav
