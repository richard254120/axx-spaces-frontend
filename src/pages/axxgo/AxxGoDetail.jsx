import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../api/api";
import AxxGoSafetyBanner from "../../components/axxgo/AxxGoSafetyBanner";
import AxxGoReportModal from "../../components/axxgo/AxxGoReportModal";
import { CATEGORIES, formatPrice, formatTimeAgo } from "../../data/axxgoData";
import {
  IconSearch,
  IconMapPin,
  IconUser,
  IconPhone,
  IconWhatsApp,
  IconShare,
  IconFlag,
  IconAlertTriangle,
  IconHome,
  IconBed,
  IconBriefcase,
  IconTag,
} from "../../components/axxgo/AxxGoIcons";

function renderCategoryIcon(category, size = 13, color = "currentColor") {
  switch (category) {
    case "Rentals":
      return <IconHome size={size} color={color} />;
    case "Accommodation":
      return <IconBed size={size} color={color} />;
    case "AxxBiashara":
      return <IconBriefcase size={size} color={color} />;
    case "Quick Sales":
      return <IconTag size={size} color={color} />;
    default:
      return <IconTag size={size} color={color} />;
  }
}

export default function AxxGoDetail() {
  const { id } = useParams();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAutoHidden, setIsAutoHidden] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchListing() {
      setLoading(true);
      setError(null);
      try {
        const res = await API.get(`/axxgo/listings/${id}`);
        if (res.data.success && isMounted) {
          setListing(res.data.listing);
        }
      } catch (err) {
        if (!isMounted) return;
        if (err.response?.status === 410) {
          setError("This listing has been hidden due to community reports or policy violations.");
        } else if (err.response?.status === 404) {
          setError("Listing not found or has expired.");
        } else {
          setError("Failed to load listing details. Please check your internet connection.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (id) fetchListing();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          background: "#0f1729",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            border: "3px solid rgba(220, 38, 38, 0.2)",
            borderTopColor: "#dc2626",
            animation: "spin 0.8s linear infinite",
            marginBottom: "16px",
          }}
        />
        <p>Loading listing...</p>
        <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div style={{ background: "#0f1729", minHeight: "100vh", padding: "60px 16px", color: "#f8fafc" }}>
        <div
          style={{
            maxWidth: "500px",
            margin: "0 auto",
            background: "#1e293b",
            border: "1px solid #ef4444",
            borderRadius: "14px",
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
            <IconAlertTriangle size={48} color="#ef4444" />
          </div>
          <h2 style={{ margin: "0 0 10px", fontSize: "20px", color: "#fca5a5" }}>Listing Unavailable</h2>
          <p style={{ margin: "0 0 24px", color: "#cbd5e1", fontSize: "14px", lineHeight: 1.5 }}>
            {error || "The listing you are looking for is no longer available."}
          </p>
          <Link
            to="/axxgo"
            style={{
              background: "#dc2626",
              color: "white",
              textDecoration: "none",
              padding: "10px 22px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "14px",
              display: "inline-block",
            }}
          >
            Browse Other Listings
          </Link>
        </div>
      </div>
    );
  }

  const categoryMeta = CATEGORIES.find((c) => c.id === listing.category) || {
    label: listing.category,
    icon: "📦",
    color: "#38bdf8",
  };

  const photos = listing.photos && listing.photos.length > 0 ? listing.photos : [];
  const currentPhoto = photos[activePhotoIndex] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800";

  // Contact actions
  const posterPhone = listing.poster?.phone || "";
  const whatsappNum = (listing.poster?.whatsapp || posterPhone).replace(/[^0-9]/g, "");
  const prefilledWhatsappMsg = encodeURIComponent(
    `Hello ${listing.poster?.name || ""}, I saw your listing on AxxGo: "${listing.title}" (KES ${listing.price}). Is it still available?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNum}?text=${prefilledWhatsappMsg}`;

  // Share action
  const handleShare = async () => {
    const shareData = {
      title: `${listing.title} on AxxGo`,
      text: `${listing.title} - KES ${listing.price} on AxxGo Kenya:`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== "AbortError") copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div style={{ background: "#0f1729", minHeight: "100vh", color: "#f8fafc", paddingBottom: "100px" }}>
      {/* ── Breadcrumb ── */}
      <div style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "12px 16px" }}>
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            color: "#94a3b8",
            flexWrap: "wrap",
          }}
        >
          <Link to="/" style={{ color: "#94a3b8", textDecoration: "none" }}>
            Home
          </Link>
          <span>/</span>
          <Link to="/axxgo" style={{ color: "#94a3b8", textDecoration: "none" }}>
            AxxGo
          </Link>
          <span>/</span>
          <Link
            to={`/axxgo?category=${encodeURIComponent(listing.category)}`}
            style={{ color: categoryMeta.color, textDecoration: "none", fontWeight: "600" }}
          >
            {categoryMeta.label}
          </Link>
          <span>/</span>
          <span style={{ color: "#cbd5e1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "250px" }}>
            {listing.title}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "20px auto 0", padding: "0 16px" }}>
        {/* Safety Warning Banner */}
        <AxxGoSafetyBanner />

        {isAutoHidden && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid #ef4444",
              borderRadius: "8px",
              padding: "14px",
              margin: "16px 0",
              color: "#fca5a5",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <IconAlertTriangle size={16} color="#ef4444" />
            <span>This listing was auto-hidden from public browse after receiving multiple reports.</span>
          </div>
        )}

        {/* ── Main 2-Column Responsive Layout ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "28px",
            alignItems: "start",
            marginTop: "16px",
          }}
        >
          {/* ── LEFT COLUMN: PHOTO GALLERY ── */}
          <div>
            {/* Primary Image */}
            <div
              style={{
                position: "relative",
                width: "100%",
                paddingTop: "70%",
                background: "#0f1729",
                borderRadius: "14px",
                overflow: "hidden",
                border: "1px solid #334155",
                cursor: "pointer",
              }}
              onClick={() => setIsLightboxOpen(true)}
            >
              <img
                src={currentPhoto}
                alt={listing.title}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  background: "#090d16",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "10px",
                  right: "10px",
                  background: "rgba(15, 23, 41, 0.8)",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <IconSearch size={12} color="#e2e8f0" />
                <span>Click to expand</span>
                <span>•</span>
                <span>
                  {activePhotoIndex + 1}/{photos.length}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {photos.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "12px",
                  overflowX: "auto",
                  paddingBottom: "6px",
                  scrollbarWidth: "thin",
                }}
              >
                {photos.map((src, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: idx === activePhotoIndex ? "2px solid #ef4444" : "1px solid #334155",
                      padding: 0,
                      background: "#0f1729",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <img src={src} alt={`Thumbnail ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}

            {/* ── Description Box ── */}
            <div
              style={{
                marginTop: "24px",
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "14px",
                padding: "22px",
              }}
            >
              <h3 style={{ margin: "0 0 14px", fontSize: "16px", fontWeight: "700", borderBottom: "1px solid #334155", paddingBottom: "10px" }}>
                Description
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  lineHeight: 1.7,
                  color: "#cbd5e1",
                  whiteSpace: "pre-line",
                  wordBreak: "break-word",
                }}
              >
                {listing.description}
              </p>
            </div>
          </div>

          {/* ── RIGHT COLUMN: DETAILS, SPECS & CONTACT ── */}
          <div>
            <div
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "14px",
                padding: "24px",
                marginBottom: "20px",
              }}
            >
              {/* Category & Status Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span
                  style={{
                    background: categoryMeta.badgeBg || "rgba(59, 130, 246, 0.15)",
                    border: `1px solid ${categoryMeta.badgeBorder || "rgba(59, 130, 246, 0.4)"}`,
                    color: categoryMeta.color,
                    fontSize: "12px",
                    fontWeight: "700",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {renderCategoryIcon(listing.category, 13, categoryMeta.color)}
                  <span>{categoryMeta.label}</span>
                </span>

                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Posted {formatTimeAgo(listing.createdAt)}
                </span>
              </div>

              {/* Title */}
              <h1 style={{ margin: "0 0 14px", fontSize: "clamp(20px, 3vw, 24px)", fontWeight: "800", lineHeight: 1.35, color: "#f8fafc" }}>
                {listing.title}
              </h1>

              {/* Price */}
              <div
                style={{
                  background: "#0f1729",
                  padding: "16px",
                  borderRadius: "10px",
                  border: "1px solid #334155",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontSize: "24px", fontWeight: "900", color: "#38bdf8" }}>
                  {formatPrice(listing.price, listing.priceType, listing.pricePeriod)}
                </div>
                {listing.priceType === "negotiable" && (
                  <span
                    style={{
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "#10b981",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "3px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    Negotiable
                  </span>
                )}
              </div>

              {/* Location Card */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#cbd5e1", marginBottom: "20px" }}>
                <IconMapPin size={18} color="#ef4444" />
                <span>
                  <strong>{listing.location?.area}</strong>, {listing.location?.county}
                </span>
              </div>

              {/* ── Category Specific Specs ── */}
              <div
                style={{
                  borderTop: "1px solid #334155",
                  paddingTop: "18px",
                  marginBottom: "24px",
                }}
              >
                <h4 style={{ margin: "0 0 12px", fontSize: "13px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Category Specifications
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px" }}>
                  {/* Rentals */}
                  {listing.category === "Rentals" && (
                    <>
                      {listing.categoryFields?.propertyType && (
                        <div>
                          <span style={{ color: "#94a3b8" }}>Type: </span>
                          <strong>{listing.categoryFields.propertyType}</strong>
                        </div>
                      )}
                      {listing.categoryFields?.bedrooms !== undefined && listing.categoryFields?.bedrooms !== null && (
                        <div>
                          <span style={{ color: "#94a3b8" }}>Bedrooms: </span>
                          <strong>{listing.categoryFields.bedrooms}</strong>
                        </div>
                      )}
                      {listing.categoryFields?.bathrooms !== undefined && listing.categoryFields?.bathrooms !== null && (
                        <div>
                          <span style={{ color: "#94a3b8" }}>Bathrooms: </span>
                          <strong>{listing.categoryFields.bathrooms}</strong>
                        </div>
                      )}
                      {listing.categoryFields?.deposit && (
                        <div>
                          <span style={{ color: "#94a3b8" }}>Deposit: </span>
                          <strong>KES {Number(listing.categoryFields.deposit).toLocaleString("en-KE")}</strong>
                        </div>
                      )}
                      {listing.categoryFields?.availabilityDate && (
                        <div style={{ gridColumn: "span 2" }}>
                          <span style={{ color: "#94a3b8" }}>Available: </span>
                          <strong>{listing.categoryFields.availabilityDate}</strong>
                        </div>
                      )}
                    </>
                  )}

                  {/* Accommodation */}
                  {listing.category === "Accommodation" && (
                    <>
                      {listing.categoryFields?.accommodationType && (
                        <div>
                          <span style={{ color: "#94a3b8" }}>Type: </span>
                          <strong>{listing.categoryFields.accommodationType}</strong>
                        </div>
                      )}
                      {listing.categoryFields?.capacity && (
                        <div>
                          <span style={{ color: "#94a3b8" }}>Capacity: </span>
                          <strong>{listing.categoryFields.capacity}</strong>
                        </div>
                      )}
                      {listing.categoryFields?.amenities && listing.categoryFields.amenities.length > 0 && (
                        <div style={{ gridColumn: "span 2", marginTop: "6px" }}>
                          <span style={{ color: "#94a3b8", display: "block", marginBottom: "6px" }}>Amenities:</span>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {listing.categoryFields.amenities.map((am, i) => (
                              <span
                                key={i}
                                style={{
                                  background: "#0f1729",
                                  border: "1px solid #334155",
                                  color: "#38bdf8",
                                  fontSize: "11px",
                                  padding: "3px 8px",
                                  borderRadius: "4px",
                                }}
                              >
                                ✓ {am}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* AxxBiashara */}
                  {listing.category === "AxxBiashara" && (
                    <>
                      {listing.categoryFields?.businessName && (
                        <div style={{ gridColumn: "span 2" }}>
                          <span style={{ color: "#94a3b8" }}>Business: </span>
                          <strong style={{ color: "#f59e0b" }}>{listing.categoryFields.businessName}</strong>
                        </div>
                      )}
                      {listing.categoryFields?.businessType && (
                        <div>
                          <span style={{ color: "#94a3b8" }}>Sector: </span>
                          <strong>{listing.categoryFields.businessType}</strong>
                        </div>
                      )}
                      {listing.categoryFields?.openingHours && (
                        <div>
                          <span style={{ color: "#94a3b8" }}>Hours: </span>
                          <strong>{listing.categoryFields.openingHours}</strong>
                        </div>
                      )}
                      {listing.categoryFields?.websiteLink && (
                        <div style={{ gridColumn: "span 2" }}>
                          <a
                            href={listing.categoryFields.websiteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#38bdf8", textDecoration: "underline" }}
                          >
                            Visit Business Website / Social Page →
                          </a>
                        </div>
                      )}
                    </>
                  )}

                  {/* Quick Sales */}
                  {listing.category === "Quick Sales" && (
                    <>
                      {listing.categoryFields?.itemCondition && (
                        <div>
                          <span style={{ color: "#94a3b8" }}>Condition: </span>
                          <strong style={{ color: "#10b981" }}>{listing.categoryFields.itemCondition}</strong>
                        </div>
                      )}
                      {listing.categoryFields?.brand && (
                        <div>
                          <span style={{ color: "#94a3b8" }}>Brand: </span>
                          <strong>{listing.categoryFields.brand}</strong>
                        </div>
                      )}
                      {listing.categoryFields?.reasonForSelling && (
                        <div style={{ gridColumn: "span 2" }}>
                          <span style={{ color: "#94a3b8" }}>Reason: </span>
                          <span>{listing.categoryFields.reasonForSelling}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* ── Contact Poster Card ── */}
              <div
                style={{
                  background: "#0f1729",
                  borderRadius: "12px",
                  padding: "18px",
                  border: "1px solid #334155",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background: "#334155",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#f8fafc",
                    }}
                  >
                    <IconUser size={20} color="#f8fafc" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>{listing.poster?.name || "Seller"}</h4>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>Direct Poster on AxxGo</p>
                  </div>
                </div>

                {/* Primary Action Buttons: Call, WhatsApp, Share */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {posterPhone && (
                    <a
                      href={`tel:${posterPhone}`}
                      style={{
                        background: "#dc2626",
                        color: "white",
                        textDecoration: "none",
                        fontWeight: "700",
                        fontSize: "15px",
                        padding: "12px 20px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        boxShadow: "0 4px 12px rgba(220, 38, 38, 0.4)",
                      }}
                    >
                      <IconPhone size={16} color="white" />
                      <span>Call {posterPhone}</span>
                    </a>
                  )}

                  {whatsappNum && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: "#10b981",
                        color: "white",
                        textDecoration: "none",
                        fontWeight: "700",
                        fontSize: "15px",
                        padding: "12px 20px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      <IconWhatsApp size={17} color="white" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={handleShare}
                    style={{
                      background: "transparent",
                      border: "1px solid #475569",
                      color: "#cbd5e1",
                      fontSize: "14px",
                      fontWeight: "600",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <IconShare size={15} color="#cbd5e1" />
                    <span>{copiedLink ? "Link Copied!" : "Share Listing"}</span>
                  </button>
                </div>
              </div>

              {/* Report button */}
              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#94a3b8",
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                >
                  <IconFlag size={13} color="#94a3b8" />
                  <span>Report this listing (Scam / Sold / Offensive)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lightbox Modal for Full-Size Photo Viewing ── */}
      {isLightboxOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.92)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              color: "white",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
          <img
            src={currentPhoto}
            alt={listing.title}
            style={{
              maxWidth: "92vw",
              maxHeight: "82vh",
              objectFit: "contain",
              borderRadius: "8px",
            }}
            onClick={(e) => e.stopPropagation()}
          />
          {photos.length > 1 && (
            <div style={{ marginTop: "14px", display: "flex", gap: "8px" }} onClick={(e) => e.stopPropagation()}>
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePhotoIndex(idx)}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    border: "none",
                    background: idx === activePhotoIndex ? "#ef4444" : "#64748b",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Report Modal ── */}
      <AxxGoReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        listingId={listing._id}
        listingTitle={listing.title}
        onReportSuccess={(autoHidden) => {
          if (autoHidden) setIsAutoHidden(true);
        }}
      />
    </div>
  );
}

