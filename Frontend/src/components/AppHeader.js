import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CButton,
  CContainer,
  CFormInput,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilLightbulb, cilMenu, cilSearch } from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'

const AppHeader = () => {
  const headerRef = useRef()
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  useEffect(() => {
    const handleScroll = () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    }

    document.addEventListener('scroll', handleScroll)
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

  const floatingAssistantStyles = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    borderRadius: '999px',
    boxShadow: '0 16px 40px rgba(99, 102, 241, 0.35)',
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
    zIndex: 1031,
  }

  return (
    <>
      <CHeader
        position="sticky"
        className="mb-4 p-0 border-0"
        ref={headerRef}
        style={{
          backgroundColor: '#0B1220',
          color: '#E5E7EB',
          fontFamily: "Inter, 'SF Pro Display', system-ui, -apple-system, sans-serif",
        }}
      >
        <CContainer className="px-4" fluid>
          <div className="d-flex align-items-center gap-3 py-3 flex-wrap">
            <CHeaderToggler
              onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
              className="text-white bg-transparent border-0"
            >
              <CIcon icon={cilMenu} size="lg" />
            </CHeaderToggler>

            <div className="d-flex align-items-center gap-3 flex-grow-1">
              <div className="d-none d-md-flex flex-column text-white">
                <small className="text-uppercase fw-semibold text-white-50">HabitFlow</small>
                <span className="fs-5 fw-bold">Your habits, streamlined</span>
              </div>

              <CInputGroup
                className="flex-grow-1 rounded-pill overflow-hidden shadow"
                style={{ backgroundColor: '#111827', minWidth: '260px' }}
              >
                <CInputGroupText className="bg-transparent border-0 ps-4 text-white-50">
                  <CIcon icon={cilSearch} />
                </CInputGroupText>
                <CFormInput
                  type="search"
                  placeholder="Search habits, plans, or community"
                  className="border-0 bg-transparent text-white py-2"
                  style={{ boxShadow: 'none' }}
                />
              </CInputGroup>
            </div>

            <CHeaderNav className="ms-auto d-flex align-items-center gap-2">
              <CButton
                color="secondary"
                variant="ghost"
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '42px',
                  height: '42px',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <CIcon icon={cilBell} size="lg" className="text-white" />
              </CButton>

              <CButton
                color="primary"
                className="d-flex align-items-center gap-2 rounded-pill px-3"
                style={{
                  backgroundColor: '#6366F1',
                  borderColor: '#6366F1',
                  boxShadow: '0 12px 30px rgba(99, 102, 241, 0.35)',
                }}
              >
                <CIcon icon={cilLightbulb} />
                <span className="fw-semibold">AI Assistant</span>
              </CButton>

              <AppHeaderDropdown />
            </CHeaderNav>
          </div>
        </CContainer>
        <CContainer className="px-4 pb-3" fluid>
          <AppBreadcrumb />
        </CContainer>
      </CHeader>

      <CButton
        color="primary"
        className="d-flex align-items-center gap-2 fw-semibold"
        style={floatingAssistantStyles}
      >
        <CIcon icon={cilLightbulb} /> Ask Flow AI
      </CButton>
    </>
  )
}

export default AppHeader
