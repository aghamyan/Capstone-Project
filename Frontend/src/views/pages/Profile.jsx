import React, { useState } from "react";
import AvatarUpload from "../../components/AvatarUpload";

export default function Profile({ onAvatarChange }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});

  const handleAvatarUpdate = (newAvatarPath) => {
    const updatedUser = { ...user, avatar: newAvatarPath };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    if (onAvatarChange) onAvatarChange(newAvatarPath);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Profile</h2>
      <img
        src={user.avatar ? `http://localhost:5001${user.avatar}` : "/uploads/default-avatar.png"}
        alt="Avatar"
        width={120}
        style={{ borderRadius: "50%", marginBottom: "1rem" }}
      />
      <AvatarUpload userId={user.id} onUploaded={handleAvatarUpdate} />
    </div>
  );
}
