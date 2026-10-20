import React, { useState, useEffect } from "react";
import API from "../api/api";
import { resolveMediaUrl } from "../utils/fileLinks";

export default function AdminPropertyImageModal({ isOpen, onClose, property, onSaved }) {
  if (!isOpen || !property) return null;

  const rawImages = Array.isArray(property.images) ? property.images : [];
  const initialImages = rawImages
    .map((img) => (typeof img === "object" ? img?.imageUrl || img?.url : img))
    .filter(Boolean);

  const [images, setImages] = useState(initialImages);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const raw = Array.isArray(property.images) ? property.images : [];
    const normalized = raw
      .map((img) => (typeof img === "object" ? img?.imageUrl || img?.url : img))
      .filter(Boolean);
    setImages(normalized);
    setNewFiles([]);
    setNewPreviews([]);
    setError("");
    setSuccess("");
  }, [property]);

  // Clean up object URLs on unmount or change
  useEffect(() => {
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newPreviews]);

  const handleRemoveExisting = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetCoverExisting = (indexToCover) => {
    setImages((prev) => {
      const selected = prev[indexToCover];
      const remaining = prev.filter((_, idx) => idx !== indexToCover);
      return [selected, ...remaining];
    });
  };

  const processFiles = (incomingFiles) => {
    setError("");
    const files = Array.from(incomingFiles || []);
    if (!files.length) return;

    const totalCount = images.length + newFiles.length + files.length;
    if (totalCount > 15) {
      setError("Maximum 15 photos allowed per property");
      return;
    }

    const validFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validFiles.length !== files.length) {
      setError("Only image files (JPG, PNG, WEBP, etc.) from your device are accepted");
    }

    if (validFiles.length === 0) return;

    const previews = validFiles.map((f) => URL.createObjectURL(f));
    setNewFiles((prev) => [...prev, ...validFiles]);
    setNewPreviews((prev) => [...prev, ...previews]);
  };

  const handleFileChange = (e) => {
    processFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer && e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveNew = (indexToRemove) => {
    if (newPreviews[indexToRemove]) {
      URL.revokeObjectURL(newPreviews[indexToRemove]);
    }
    setNewFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setNewPreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    const totalCount = images.length + newFiles.length;
    if (totalCount === 0) {
      setError("A property must have at least one image.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("remainingImages", JSON.stringify(images));
      newFiles.forEach((file) => {
        formData.append("images", file);
      });

      const res = await API.patch(`/properties/${property._id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedProp = res.data?.property || { ...property, images: res.data?.images || images };
      setSuccess("Property photos updated successfully!");

      if (onSaved) {
        onSaved(updatedProp);
      }

      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      console.error("Failed to update property images:", err);
      setError(err?.response?.data?.error || err.message || "Failed to update property images");
    } finally {
      setSaving(false);
    }
  };

  const totalPhotos = images.length + newFiles.length;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "800px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#f8fafc",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  background: "#0ea5e9",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                }}
              >
                Admin Image Editor
              </span>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                {totalPhotos} of 15 photos
              </span>
            </div>
            <h3 style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
              {property.title}
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
              {property.location || property.county || "Kenya"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#e2e8f0",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#475569",
              fontSize: "16px",
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div
            style={{
              margin: "16px 24px 0",
              padding: "10px 14px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              margin: "16px 24px 0",
              padding: "10px 14px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#15803d",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            ✓ {success}
          </div>
        )}

        {/* Body Content */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {/* Pick Pictures from Device Card */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              marginBottom: "20px",
              background: isDragging ? "#e0f2fe" : "#f8fafc",
              border: isDragging ? "2px dashed #0284c7" : "2px dashed #cbd5e1",
              borderRadius: "14px",
              padding: "24px 20px",
              textAlign: "center",
              transition: "all 0.2s ease-in-out",
            }}
          >
            <input
              id="admin-property-file-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <label
              htmlFor="admin-property-file-input"
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: isDragging ? "#bae6fd" : "#e0f2fe",
                  color: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(2, 132, 199, 0.15)",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>

              <div>
                <span
                  style={{
                    display: "inline-block",
                    padding: "9px 22px",
                    background: "#0284c7",
                    color: "#ffffff",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 700,
                    boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)",
                    marginBottom: "6px",
                  }}
                >
                  Choose Pictures from Device
                </span>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                  Click to browse photos from your phone, laptop, or computer gallery (JPG, PNG, WEBP)
                </p>
                {newFiles.length > 0 && (
                  <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#16a34a", fontWeight: 700 }}>
                    ✓ {newFiles.length} new {newFiles.length === 1 ? "picture" : "pictures"} picked from device ready to save
                  </p>
                )}
              </div>
            </label>
          </div>

          {/* Photos Grid Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#1e293b" }}>
              Active Photos ({totalPhotos})
            </span>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              The first photo serves as the main cover picture
            </span>
          </div>

          {/* Photos Grid */}
          {totalPhotos === 0 ? (
            <div
              style={{
                padding: "36px",
                textAlign: "center",
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px dashed #cbd5e1",
                color: "#64748b",
              }}
            >
              No photos attached to this property. Please upload at least one image.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "14px",
              }}
            >
              {/* Existing Images */}
              {images.map((imgUrl, idx) => (
                <div
                  key={`existing-${idx}`}
                  style={{
                    position: "relative",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: idx === 0 ? "2.5px solid #0ea5e9" : "1px solid #e2e8f0",
                    background: "#0f172a",
                    aspectRatio: "4/3",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  }}
                >
                  <img
                    src={resolveMediaUrl(imgUrl)}
                    alt={`Property photo ${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80";
                    }}
                  />

                  {/* Cover badge */}
                  {idx === 0 ? (
                    <div
                      style={{
                        position: "absolute",
                        top: "6px",
                        left: "6px",
                        background: "#0ea5e9",
                        color: "white",
                        fontSize: "10px",
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        textTransform: "uppercase",
                      }}
                    >
                      Cover
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetCoverExisting(idx)}
                      style={{
                        position: "absolute",
                        top: "6px",
                        left: "6px",
                        background: "rgba(15, 23, 42, 0.75)",
                        color: "#f8fafc",
                        border: "none",
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "3px 6px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      title="Make this the primary cover image"
                    >
                      Set Cover
                    </button>
                  )}

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveExisting(idx)}
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      background: "rgba(220, 38, 38, 0.9)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                    title="Delete photo"
                  >
                    ✕
                  </button>

                  <div
                    style={{
                      position: "absolute",
                      bottom: "4px",
                      right: "6px",
                      background: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      fontSize: "10px",
                      padding: "1px 5px",
                      borderRadius: "4px",
                    }}
                  >
                    #{idx + 1}
                  </div>
                </div>
              ))}

              {/* Newly Added Files Preview */}
              {newPreviews.map((previewUrl, idx) => (
                <div
                  key={`new-${idx}`}
                  style={{
                    position: "relative",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "2px dashed #22c55e",
                    background: "#0f172a",
                    aspectRatio: "4/3",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  }}
                >
                  <img
                    src={previewUrl}
                    alt={`New upload ${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      top: "6px",
                      left: "6px",
                      background: "#22c55e",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    From Device
                  </div>

                  {/* Delete newly added photo */}
                  <button
                    type="button"
                    onClick={() => handleRemoveNew(idx)}
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      background: "rgba(220, 38, 38, 0.9)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                    title="Remove this new photo"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#f8fafc",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              padding: "10px 18px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || totalPhotos === 0}
            style={{
              padding: "10px 24px",
              background: "#0284c7",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#ffffff",
              cursor: saving || totalPhotos === 0 ? "not-allowed" : "pointer",
              boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)",
              opacity: saving || totalPhotos === 0 ? 0.7 : 1,
            }}
          >
            {saving ? "Saving Changes..." : `Save Photos (${totalPhotos})`}
          </button>
        </div>
      </div>
    </div>
  );
}
