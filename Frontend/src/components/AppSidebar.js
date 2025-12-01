import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'

import { logo } from 'src/assets/brand/logo'
import { sygnet } from 'src/assets/brand/sygnet'

// sidebar nav config
import navigation from '../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  return (
    <CSidebar
      className="modern-sidebar shadow-lg"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      style={{
        width: '256px',
        backgroundColor: '#1F2937',
        color: '#E5E7EB',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        fontFamily: "Inter, 'SF Pro Display', system-ui, -apple-system, sans-serif",
      }}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom border-secondary-subtle py-3 px-4">
        <CSidebarBrand to="/" className="d-flex align-items-center gap-2">
          <CIcon customClassName="sidebar-brand-full" icon={logo} height={32} />
          <div className="d-flex flex-column text-white">
            <span className="fw-bold">HabitFlow</span>
            <small className="text-white-50">SaaS Dashboard 2025</small>
          </div>
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none text-white"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <div className="px-3 py-3">
        <AppSidebarNav items={navigation} />
      </div>
      <CSidebarFooter className="border-top border-secondary-subtle d-none d-lg-flex px-3 py-3">
        <CSidebarToggler
          className="rounded-pill w-100 bg-transparent text-white"
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
