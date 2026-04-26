import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";
import MapView from "../components/MapView";

/* ══════════════════════════════════════════════════════════════════
   Property Detail Modal 
══════════════════════════════════════════════════════════════════ */
function PropertyModal({ property: p, onClose, onWhatsApp, isFav, onToggleFav }) {
  if (!p) return null;

  // FIXED: Use first image from images array (Cloudinary)
  const mainImage = p.images && p.images.length > 0 ? p.images[0] : p.image;

  return (
    <div style={modal.overlay} onClick={onClose}>
      <div style={modal.box} onClick={(e) => e.stopPropagation()}>
        <button style={modal.closeBtn} onClick={onClose}>✕</button>

        {mainImage && (
          <img src={mainImage} alt={p.title} style={modal.image} />
        )}

        <div style={modal.body}>
          <div style={modal.topRow}>
            <h2 style={modal.title}>{p.title}</h2>
            <button
              style={{ ...modal.favBtn, color: isFav ? "#f43f5e" : "#64748b" }}
              onClick={() => onToggleFav(p._id)}
              title={isFav ? "Remove from favourites" : "Save to favourites"}
            >
              {isFav ? "♥" : "♡"}
            </button>
          </div>

          <p style={modal.location}>📍 {p.county}{p.area ? ` · ${p.area}` : ""}</p>

          <div style={modal.priceRow}>
            <div>
              <div style={modal.priceLabel}>Monthly Rent</div>
              <div style={modal.price}>Ksh {Number(p.price).toLocaleString()}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={modal.priceLabel}>Deposit</div>
              <div style={modal.deposit}>Ksh {Number(p.deposit).toLocaleString()}</div>
            </div>
          </div>

          <div style={modal.metaGrid}>
            {p.type      && <span className="lst-meta-pill">🏗 {p.type}</span>}
            {p.bedrooms  && <span className="lst-meta-pill">🛏 {p.bedrooms} Bed{p.bedrooms > 1 ? "s" : ""}</span>}
            {p.bathrooms && <span className="lst-meta-pill">🚿 {p.bathrooms} Bath</span>}
          </div>

          {p.amenities?.length > 0 && (
            <div style={modal.section}>
              <div style={modal.sectionLabel}>Amenities</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {p.amenities.map((a) => (
                  <span key={a} className="lst-meta-pill" style={{ color: "#34d399" }}>✓ {a}</span>
                ))}
              </div>
            </div>
          )}

          {p.description && (
            <div style={modal.section}>
              <div style={modal.sectionLabel}>Description</div>
              <p style={modal.desc}>{p.description}</p>
            </div>
          )}

          <div style={modal.section}>
            <div style={modal.sectionLabel}>Contact</div>
            <p style={{ color: "#e2e8f0", margin: "4px 0 12px", fontWeight: 700 }}>📞 {p.phone}</p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="lst-whatsapp-btn" onClick={() => onWhatsApp(p.phone, p.title)}>
              💬 Chat on WhatsApp
            </button>
            <button className="lst-share-btn" onClick={() => shareProperty(p)}>
              🔗 Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function shareProperty(p) {
  const text = `🏠 ${p.title} — Ksh ${Number(p.price).toLocaleString()}/mo\n📍 ${p.county}${p.area ? ", " + p.area : ""}\n\nFound on Axx Spaces`;
  if (navigator.share) {
    navigator.share({ title: p.title, text, url: window.location.href }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text + "\n" + window.location.href).then(() => {
      alert("Link copied to clipboard! 📋");
    });
  }
}

export default function Listings() {
  const [properties, setProperties]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedProperty, setSelected] = useState(null);
  const [favourites, setFavourites]     = useState(() => {
    try { return JSON.parse(localStorage.getItem("axx_favourites") || "[]"); }
    catch { return []; }
  });
  const [inlineFilters, setInlineFilters] = useState({
    search: "", minPrice: "", maxPrice: "", sortBy: "newest",
  });
  const [showFavsOnly, setShowFavsOnly] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, [location.search]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/properties/approved${location.search}`);
      setProperties(res.data);
    } catch (err) {
      console.log("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (phone, title) => {
    if (!phone) { alert("No phone number available"); return; }
    const cleanPhone = phone.replace(/\s+/g, "");
    const message = `Hello, I am interested in your property: ${title}`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const toggleFavourite = useCallback((id) => {
    setFavourites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("axx_favourites", JSON.stringify(next));
      return next;
    });
  }, []);

  const filtered = properties
    .filter((p) => {
      if (showFavsOnly && !favourites.includes(p._id)) return false;
      if (inlineFilters.search) {
        const q = inlineFilters.search.toLowerCase();
        if (
          !p.title?.toLowerCase().includes(q) &&
          !p.area?.toLowerCase().includes(q) &&
          !p.county?.toLowerCase().includes(q) &&
          !p.type?.toLowerCase().includes(q)
        ) return false;
      }
      if (inlineFilters.minPrice && p.price < Number(inlineFilters.minPrice)) return false;
      if (inlineFilters.maxPrice && p.price > Number(inlineFilters.maxPrice)) return false;
      return true;
    })
    .sort((a, b) => {
      if (inlineFilters.sortBy === "price_asc")  return a.price - b.price;
      if (inlineFilters.sortBy === "price_desc") return b.price - a.price;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const getSimilar = (p) =>
    properties
      .filter((x) => x._id !== p._id && (x.county === p.county || x.type === p.type))
      .slice(0, 3);

  const params = new URLSearchParams(location.search);
  const activeFilters = [];
  if (params.get("county"))   activeFilters.push({ key: "county",   label: `📍 ${params.get("county")}` });
  if (params.get("area"))     activeFilters.push({ key: "area",     label: `🏘 ${params.get("area")}` });
  if (params.get("type"))     activeFilters.push({ key: "type",     label: `🏗 ${params.get("type")}` });
  if (params.get("price"))    activeFilters.push({ key: "price",    label: `💵 Max Ksh ${params.get("price")}` });
  if (params.get("bedrooms")) activeFilters.push({ key: "bedrooms", label: `🛏 ${params.get("bedrooms")} Beds` });

  const removeFilter = (key) => {
    params.delete(key);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelected(null)}
          onWhatsApp={openWhatsApp}
          isFav={favourites.includes(selectedProperty._id)}
          onToggleFav={toggleFavourite}
        />
      )}

      <div style={styles.header}>
        <button className="lst-back" onClick={() => navigate("/")}>← Back</button>
        <div>
          <h1 style={styles.pageTitle}>🏠 Available Listings</h1>
          <p style={styles.pageSubtitle}>
            {loading
              ? "Searching properties…"
              : `${filtered.length} of ${properties.length} propert${properties.length === 1 ? "y" : "ies"}`}
          </p>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div style={styles.filterRow}>
          <span style={styles.filterLabel}>Filters:</span>
          {activeFilters.map((f) => (
            <button key={f.key} className="lst-filter-chip" onClick={() => removeFilter(f.key)}>
              {f.label} <span style={{ marginLeft: 4, opacity: 0.7 }}>✕</span>
            </button>
          ))}
          <button className="lst-clear" onClick={() => navigate("/listings")}>Clear all</button>
        </div>
      )}

      <div style={styles.searchBar}>
        <input
          className="lst-search-input"
          placeholder="🔍  Search title, area, county, type…"
          value={inlineFilters.search}
          onChange={(e) => setInlineFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <input
          className="lst-price-input"
          placeholder="Min Ksh"
          type="number"
          value={inlineFilters.minPrice}
          onChange={(e) => setInlineFilters((f) => ({ ...f, minPrice: e.target.value }))}
        />
        <input
          className="lst-price-input"
          placeholder="Max Ksh"
          type="number"
          value={inlineFilters.maxPrice}
          onChange={(e) => setInlineFilters((f) => ({ ...f, maxPrice: e.target.value }))}
        />
        <select
          className="lst-sort-select"
          value={inlineFilters.sortBy}
          onChange={(e) => setInlineFilters((f) => ({ ...f, sortBy: e.target.value }))}
        >
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
        <button
          className={`lst-fav-toggle${showFavsOnly ? " active" : ""}`}
          onClick={() => setShowFavsOnly((v) => !v)}
          title="Show saved only"
        >
          {showFavsOnly ? "♥ Saved" : "♡ Saved"} ({favourites.length})
        </button>
      </div>

      <div style={styles.mapWrap}>
        <MapView properties={properties} />
      </div>

      {loading ? (
        <div style={styles.emptyState}>
          <div className="lst-spinner" />
          <p style={{ color: "#64748b", marginTop: 16 }}>Loading properties…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔍</div>
          <h3 style={styles.emptyTitle}>No properties found</h3>
          <p style={styles.emptyText}>Try adjusting your filters or browse all listings</p>
          <button
            className="lst-btn"
            onClick={() => {
              navigate("/listings");
              setInlineFilters({ search: "", minPrice: "", maxPrice: "", sortBy: "newest" });
              setShowFavsOnly(false);
            }}
          >
            View All Listings
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((p, idx) => (
            <div key={p._id} className="lst-card" style={{ animationDelay: `${idx * 60}ms` }}>

              {/* FIXED: Support for images array from Cloudinary */}
              {(p.images && p.images.length > 0) || p.image ? (
                <div style={styles.imageWrap}>
                  <img
                    src={p.images && p.images.length > 0 ? p.images[0] : p.image}
                    alt={p.title}
                    style={{ ...styles.image, cursor: "pointer" }}
                    onClick={() => setSelected(p)}
                  />
                  <div style={styles.typeBadge}>{p.type}</div>

                  <button
                    className="lst-heart-btn"
                    onClick={(e) => { e.stopPropagation(); toggleFavourite(p._id); }}
                    title={favourites.includes(p._id) ? "Remove favourite" : "Save property"}
                  >
                    {favourites.includes(p._id) ? "♥" : "♡"}
                  </button>
                </div>
              ) : (
                <div style={styles.imagePlaceholder} onClick={() => setSelected(p)}>
                  <span style={{ fontSize: 36 }}>🏠</span>
                </div>
              )}

              <div style={styles.cardBody}>
                <h3 style={{ ...styles.cardTitle, cursor: "pointer" }} onClick={() => setSelected(p)}>
                  {p.title}
                </h3>
                <p style={styles.cardLocation}>📍 {p.county}{p.area ? ` · ${p.area}` : ""}</p>

                <div style={styles.priceRow}>
                  <div>
                    <div style={styles.priceLabel}>Monthly</div>
                    <div style={styles.price}>Ksh {Number(p.price).toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={styles.priceLabel}>Deposit</div>
                    <div style={styles.deposit}>Ksh {Number(p.deposit).toLocaleString()}</div>
                  </div>
                </div>

                <div style={styles.metaRow}>
                  {p.bedrooms && <span className="lst-meta-pill">🛏 {p.bedrooms} Bed{p.bedrooms > 1 ? "s" : ""}</span>}
                  {p.type     && <span className="lst-meta-pill">{p.type}</span>}
                </div>

                {p.amenities?.length > 0 && (
                  <p style={styles.amenities}>🏡 {p.amenities.join("  ·  ")}</p>
                )}

                {p.description && (
                  <p style={styles.description}>{p.description}</p>
                )}

                <div style={styles.phoneRow}>
                  <span style={styles.phoneIcon}>📞</span>
                  <span style={styles.phone}>{p.phone}</span>
                </div>

                <div style={styles.actionRow}>
                  <button
                    onClick={() => openWhatsApp(p.phone, p.title)}
                    style={styles.whatsappBtn}
                    className="lst-whatsapp"
                  >
                    💬 WhatsApp
                  </button>

                  <button
                    className="lst-share-card-btn"
                    onClick={() => shareProperty(p)}
                    title="Share this property"
                  >
                    🔗
                  </button>

                  <button className="lst-view-btn" onClick={() => setSelected(p)}>
                    View
                  </button>
                </div>

                {getSimilar(p).length > 0 && (
                  <div style={styles.similarWrap}>
                    <div style={styles.similarLabel}>Similar</div>
                    <div style={styles.similarRow}>
                      {getSimilar(p).map((s) => (
                        <button
                          key={s._id}
                          className="lst-similar-chip"
                          onClick={() => setSelected(s)}
                        >
                          {s.title.length > 22 ? s.title.slice(0, 22) + "…" : s.title}
                          <span style={{ color: "#60a5fa", marginLeft: 4 }}>
                            Ksh {Number(s.price).toLocaleString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* All your original styles and css remain unchanged */
const styles = { /* your full styles object */ };

const modal = { /* your full modal styles */ };

const css = ` /* your full css string */ `;