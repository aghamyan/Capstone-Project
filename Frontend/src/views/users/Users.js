import React from "react"
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilEnvelopeClosed, cilPhone, cilUser } from "@coreui/icons"

const users = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Product Manager",
    email: "alex.johnson@example.com",
    phone: "+1 (415) 123-4567",
    status: "active",
  },
  {
    id: 2,
    name: "Priya Singh",
    role: "Data Scientist",
    email: "priya.singh@example.com",
    phone: "+44 20 7946 0011",
    status: "away",
  },
  {
    id: 3,
    name: "Diego Rivera",
    role: "Frontend Engineer",
    email: "diego.rivera@example.com",
    phone: "+34 91 123 8900",
    status: "active",
  },
  {
    id: 4,
    name: "Sara Müller",
    role: "UX Researcher",
    email: "sara.mueller@example.com",
    phone: "+49 30 1234 999",
    status: "offline",
  },
  {
    id: 5,
    name: "Jamal Carter",
    role: "Customer Success",
    email: "jamal.carter@example.com",
    phone: "+1 (917) 555-2345",
    status: "active",
  },
]

const statusColor = {
  active: "success",
  away: "warning",
  offline: "secondary",
}

const Users = () => {
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="fw-semibold">User Directory</CCardHeader>
          <CCardBody>
            <p className="text-body-secondary mb-4">
              Browse the latest team members, check their status, and reach out directly from the
              directory.
            </p>
            <CTable align="middle" responsive hover>
              <CTableHead className="text-uppercase text-body-secondary small">
                <CTableRow>
                  <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Role</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Contact</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                  <CTableHeaderCell scope="col" className="text-end">
                    Actions
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {users.map((user) => (
                  <CTableRow key={user.id}>
                    <CTableHeaderCell scope="row" className="fw-semibold">
                      <CIcon icon={cilUser} className="me-2 text-primary" />
                      {user.name}
                    </CTableHeaderCell>
                    <CTableDataCell>{user.role}</CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex flex-column">
                        <span className="d-flex align-items-center gap-2">
                          <CIcon icon={cilEnvelopeClosed} className="text-body-secondary" />
                          <a href={`mailto:${user.email}`} className="text-decoration-none">
                            {user.email}
                          </a>
                        </span>
                        <span className="d-flex align-items-center gap-2">
                          <CIcon icon={cilPhone} className="text-body-secondary" />
                          <a href={`tel:${user.phone}`} className="text-decoration-none">
                            {user.phone}
                          </a>
                        </span>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={statusColor[user.status]} className="text-capitalize">
                        {user.status}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton color="primary" variant="ghost" size="sm" className="me-2">
                        View profile
                      </CButton>
                      <CButton color="success" variant="ghost" size="sm">
                        Message
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Users
