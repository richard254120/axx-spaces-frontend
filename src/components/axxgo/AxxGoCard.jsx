import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES, formatPrice, formatTimeAgo } from "../../data/axxgoData";
import {
  IconHome,
  IconBed,
  IconBriefcase,
  IconTag,
  IconCamera,
  IconMapPin,
} from "./AxxGoIcons";

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

export default function AxxGoCard({ listing }) {
  const [imgError, setImgError] = useState(false);

  if (!listing) return null;

  const categoryMeta = CATEGORIES.find((c) => c.id === listing.category) || {
    label: listing.category,
    color: "#94a3b8",
    badgeBg: "rgba(148, 163, 184, 0.15)",
    badgeBorder: "rgba(148, 163, 184, 0.4)",
  };

  const primaryPhoto =
    listing.photos && listing.photos.length > 0 && !imgError
      ? listing.photos[0]
      : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop&q=80";

  const isSoldOrRented = listing.status === "sold" || listing.status === "rented";
  const isUnavailable = listing.status === "unavailable";

  return (
    <Link
      to={`/axxgo/listing/${listing._id}`}
      style={{
        display: "flex",
        flexDirection: "column",
        background: "#1e293b",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #334155",
        textDecoration: "none",
        color: "inherit",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        height: "100%",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 24px -8px rgba(0, 0, 0, 0.5)";
        e.currentTarget.style.borderColor = "#475569";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "#334155";
      }}
    >
      {/* ── Photo Thumbnail ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "68%", // Aspect ratio ~3:2
          background: "#0f1729",
          overflow: "hidden",
        }}
      >
        <img
          src={primaryPhoto}
          alt={listing.title}
          loading="lazy"
          onError={() => setImgError(true)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: isSoldOrRented || isUnavailable ? "grayscale(80%) brightness(0.7)" : "none",
            transition: "transform 0.3s ease",
          }}
        />

        {/* Category Pill */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            background: categoryMeta.badgeBg,
            backdropFilter: "blur(8px)",
            border: `1px solid ${categoryMeta.badgeBorder}`,
            color: categoryMeta.color,
            fontSize: "11px",
            fontWeight: "700",
            padding: "4px 8px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            zIndex: 2,
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          {renderCategoryIcon(listing.category, 12, categoryMeta.color)}
          <span>{categoryMeta.label}</span>
        </div>

        {/* Photo count indicator */}
        {listing.photos && listing.photos.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: "8px",
              right: "8px",
              background: "rgba(15, 23, 41, 0.8)",
              color: "#f1f5f9",
              fontSize: "11px",
              fontWeight: "600",
              padding: "2px 7px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              zIndex: 2,
            }}
          >
            <IconCamera size={11} color="#cbd5e1" />
            <span>{listing.photos.length}</span>
          </div>
        )}

        {/* Overlay Badges for Sold / Rented */}
        {isSoldOrRented && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(15, 23, 41, 0.55)",
              zIndex: 3,
            }}
          >
            <span
              style={{
                background: "#dc2626",
                color: "white",
                fontWeight: "800",
                fontSize: "12px",
                textTransform: "uppercase",
                padding: "5px 12px",
                borderRadius: "6px",
                letterSpacing: "1px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
              }}
            >
              {listing.status === "sold" ? "Sold" : "Rented"}
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div
        style={{
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        <div>
          {/* Price */}
          <div
            style={{
              fontSize: "17px",
              fontWeight: "800",
              color: "#38bdf8",
              marginBottom: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{formatPrice(listing.price, listing.priceType, listing.pricePeriod)}</span>
            {listing.priceType === "negotiable" && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "700",
                  color: "#10b981",
                  background: "rgba(16, 185, 129, 0.15)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                }}
              >
                Negotiable
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#f8fafc",
              lineHeight: 1.35,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {listing.title}
          </h3>

          {/* Specific category snippet tag */}
          {listing.category === "Rentals" && listing.categoryFields?.bedrooms && (
            <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#94a3b8" }}>
              {listing.categoryFields.bedrooms} Bedroom{listing.categoryFields.bedrooms > 1 ? "s" : ""}
              {listing.categoryFields.propertyType ? ` • ${listing.categoryFields.propertyType}` : ""}
            </p>
          )}
          {listing.category === "Accommodation" && listing.categoryFields?.accommodationType && (
            <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#94a3b8" }}>
              {listing.categoryFields.accommodationType}
            </p>
          )}
          {listing.category === "Quick Sales" && listing.categoryFields?.itemCondition && (
            <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#94a3b8" }}>
              Condition: {listing.categoryFields.itemCondition}
            </p>
          )}
          {listing.category === "AxxBiashara" && listing.categoryFields?.businessName && (
            <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#f59e0b", fontWeight: "500" }}>
              {listing.categoryFields.businessName}
            </p>
          )}
        </div>

        {/* ── Footer: Location and Time ── */}
        <div
          style={{
            marginTop: "12px",
            paddingTop: "10px",
            borderTop: "1px solid #334155",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#94a3b8",
          }}
        >
          {/* Location */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "65%",
            }}
          >
            <IconMapPin size={12} color="#ef4444" />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              {listing.location?.area ? `${listing.location.area}, ` : ""}
              {listing.location?.county || "Kenya"}
            </span>
          </div>

          {/* Time posted */}
          <span style={{ fontSize: "11px", color: "#64748b", flexShrink: 0 }}>
            {formatTimeAgo(listing.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
