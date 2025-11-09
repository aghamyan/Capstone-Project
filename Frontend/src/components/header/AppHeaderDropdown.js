import React, { useState, useEffect } from "react";
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from "@coreui/react";
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import axios from "axios";

const AppHeaderDropdown = () => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || {}
  );
  const [avatarUrl, setAvatarUrl] = useState(
    user.avatar ? `http://localhost:5001${user.avatar}` : "/uploads/default-avatar.png"
  );

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem("user"));
    if (localUser) {
      setUser(localUser);
      setAvatarUrl(localUser.avatar ? `http://localhost:5001${localUser.avatar}` : "/uploads/default-avatar.png");
    }
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await axios.post(
        `http://localhost:5001/api/avatar/${user.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        const newAvatar = `http://localhost:5001${res.data.imagePath}`;
        setAvatarUrl(newAvatar);

        const updatedUser = { ...user, avatar: res.data.imagePath };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload error");
    }
  };

  return (
    <CDropdown variant="nav-item" className="d-flex align-items-center">
      {/* Avatar for upload */}
      <div style={{ position: "relative", cursor: "pointer", marginRight: "0.5rem" }}>
        <CAvatar
          src={avatarUrl}
          size="md"
          onClick={() => document.getElementById("avatarInput").click()}
        />
        <input
          type="file"
          id="avatarInput"
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {/* Dropdown arrow */}
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={true} />

      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Account</CDropdownHeader>
        <CDropdownItem href="/#/profile">
          <CIcon icon={cilUser} className="me-2" /> Profile
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilSettings} className="me-2" /> Settings
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem href="#">
          <CIcon icon={cilLockLocked} className="me-2" /> Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  );
};

export default AppHeaderDropdown;
