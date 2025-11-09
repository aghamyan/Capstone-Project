import React, { useState } from "react";
import axios from "axios";

export default function AvatarUpload({ userId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Choose an image first");
    if (!userId) return alert("User ID not found. Please login again.");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axios.post(
        `http://localhost:5001/api/avatar/${userId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) onUploaded(res.data.imagePath);
      else alert("Upload failed");
    } catch (err) {
      console.error(err);
      alert("Upload error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
