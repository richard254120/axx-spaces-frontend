import { useState, useEffect } from "react";
import ReviewsSection from "../components/ReviewsSection";
import RecentlyViewed, { trackView } from "../components/RecentlyViewed";
import ShareProperty from "../components/ShareProperty";
import MapView from "../components/MapView";
import MessagingSystem from "../components/MessagingSystem";
import ReviewRatingSystem from "../components/ReviewRatingSystem";
import BookingCalendar from "../components/BookingCalendar";
import { useAuth } from "../context/AuthContext";
import PhoneInput from "../components/PhoneInput";
import { kenyanUniversities, searchUniversities } from "../data/kenyanUniversities";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

const formatKenyaPhone = (phone) => {
  if (!phone) return "";
  let cleaned = phone.toString().replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
  if (cleaned.startsWith("254")) return cleaned;
  return "254" + cleaned;
};

export default function Listings() {
  const { user, token } = useAuth();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    minPrice: 0,
    maxPrice: 1000000,
    bedrooms: "",
    bathrooms: "",
    furnished: "",
    propertyType: "",
    amenities: "",
    petFriendly: "",
    availableFrom: "",
  });
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [savedSearches, setSavedSearches] = useState([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showUniversityHostels, setShowUniversityHostels] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [universitySearch, setUniversitySearch] = useState("");
  const [universityProperties, setUniversityProperties] = useState([]);
  const [universityLoading, setUniversityLoading] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`${API_BASE}/properties`);
        if (!response.ok) throw new Error("Failed to fetch properties");
        const data = await response.json();
        const processedProperties = data.map(prop => ({
          ...prop,
          availableUnits: Math.max(0, (prop.totalUnits || 1) - (prop.bookedUnits || 0))
        }));
        const availableProperties = processedProperties.filter((prop) => prop.availableUnits > 0);
        setProperties(processedProperties);
        setFilteredProperties(availableProperties);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
    const savedFavorites = localStorage.getItem("axxspace_favorites");
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    const savedSearchesData = localStorage.getItem("axxspace_saved_searches");
    if (savedSearchesData) setSavedSearches(JSON.parse(savedSearchesData));
  }, []);

  useEffect(() => {
    let filtered = properties.filter(p => p.availableUnits > 0);
    if (filters.location) filtered = filtered.filter((p) => (p.location + " " + (p.county || "")).toLowerCase().includes(filters.location.toLowerCase()));
    if (filters.bedrooms) filtered = filtered.filter((p) => p.bedrooms === parseInt(filters.bedrooms));
    if (filters.bathrooms) filtered = filtered.filter((p) => p.bathrooms === parseInt(filters.bathrooms));
    if (filters.furnished !== "") filtered = filtered.filter((p) => p.furnished === (filters.furnished === "true"));
    if (filters.propertyType) filtered = filtered.filter((p) => (p.propertyType || "").toLowerCase() === filters.propertyType.toLowerCase());
    if (filters.amenities) filtered = filtered.filter((p) => p.amenities?.some((a) => a.toLowerCase().includes(filters.amenities.toLowerCase())));
    if (filters.petFriendly !== "") filtered = filtered.filter((p) => p.petFriendly === (filters.petFriendly === "true"));
    if (filters.availableFrom) filtered = filtered.filter((p) => { if (!p.availableFrom) return true; return new Date(p.availableFrom) <= new Date(filters.availableFrom); });
    if (showFavoritesOnly) filtered = filtered.filter((p) => favorites.includes(p._id));
    filtered = filtered.filter((p) => p.price >= filters.minPrice && p.price <= filters.maxPrice);
    setFilteredProperties(filtered);
  }, [filters, properties, favorites, showFavoritesOnly]);

  useEffect(() => {
    if (!showUniversityHostels || !selectedUniversity?.id) {
      setUniversityProperties([]);
      return;
    }

    const fetchUniversityProperties = async () => {
      setUniversityLoading(true);
      try {
        const params = new URLSearchParams({
          universityId: String(selectedUniversity.id),
          available: "true",
          limit: "200",
        });
        const response = await fetch(`${API_BASE}/properties?${params}`);
        if (!response.ok) throw new Error("Failed to fetch university listings");
        const data = await response.json();
        const processed = data.map((prop) => ({
          ...prop,
          availableUnits: Math.max(0, (prop.totalUnits || 1) - (prop.bookedUnits || 0)),
        }));
        setUniversityProperties(processed.filter((p) => p.availableUnits > 0));
      } catch (err) {
        setError(err.message);
        setUniversityProperties([]);
      } finally {
        setUniversityLoading(false);
      }
    };

    fetchUniversityProperties();
  }, [showUniversityHostels, selectedUniversity]);

  const displayProperties =
    showUniversityHostels && selectedUniversity ? universityProperties : filteredProperties;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: name === "minPrice" || name === "maxPrice" ? parseFloat(value) || 0 : value }));
  };

  const openModal = (property) => { setSelectedProperty(property); setCurrentImageIndex(0); trackView(property); };
  const closeModal = () => { setSelectedProperty(null); setCurrentImageIndex(0); };
  const nextImage = () => { if (selectedProperty?.images?.length > 0) setCurrentImageIndex((prev) => (prev + 1) % selectedProperty.images.length); };
  const prevImage = () => { if (selectedProperty?.images?.length > 0) setCurrentImageIndex((prev) => (prev - 1 + selectedProperty.images.length) % selectedProperty.images.length); };

  const handleContactLandlord = (property) => {
    const phoneNumber = formatKenyaPhone(property.owner?.phone || property.phone || "");
    const landlordName = property.owner?.name || "Landlord";
    const message = `Hi ${landlordName}, I'm interested in your property "${property.title}" located in ${property.location}. Can you provide more details?`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleBookNow = (property) => {
    if (!user) { alert("Please log in to book this property"); return; }
    setPaymentAmount(property.price?.toString() || "");
    setPaymentPhone(user.phone || "");
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setPaymentError("");
    setPaymentSuccess("");
    try {
      const response = await fetch(`${API_BASE}/payment/book-property`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ propertyId: selectedProperty._id, phone: paymentPhone, amount: paymentAmount }),
      });
      const data = await response.json();
      if (response.ok) {
        setPaymentSuccess("✅ M-Pesa prompt sent! Check your phone to complete payment.");
        setTimeout(() => { setShowPaymentModal(false); setPaymentSuccess(""); }, 3000);
      } else {
        setPaymentError(data.error || "❌ Payment failed. Please try again.");
      }
    } catch (err) {
      setPaymentError("❌ Payment failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSendSMS = (property) => {
    const phoneNumber = formatKenyaPhone(property.owner?.phone || property.phone || "");
    const message = `Hello, I want to BOOK this property:\n${property.title}\n${property.county} - ${property.location}\nKES ${property.price?.toLocaleString()}/month\n${property.bedrooms} Bed | ${property.bathrooms} Bath\nAvailable: ${property.availableUnits} units\n\nPlease reply with availability and booking details. Thank you!`;
    window.open(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`, "_blank");
  };

  const toggleFavorite = (propertyId) => {
    const newFavorites = favorites.includes(propertyId) ? favorites.filter(id => id !== propertyId) : [...favorites, propertyId];
    setFavorites(newFavorites);
    localStorage.setItem("axxspace_favorites", JSON.stringify(newFavorites));
  };

  const saveCurrentSearch = () => {
    const hasActiveFilters = Object.values(filters).some(v => v !== "" && v !== 0 && v !== 1000000);
    if (!hasActiveFilters) { alert("Please apply some filters before saving a search"); return; }
    const searchName = prompt("Name this search (e.g., 'Nairobi 2-bedroom apartments'):");
    if (!searchName) return;
    const newSearch = { id: Date.now(), name: searchName, filters: { ...filters }, createdAt: new Date().toISOString() };
    const updatedSearches = [...savedSearches, newSearch];
    setSavedSearches(updatedSearches);
    localStorage.setItem("axxspace_saved_searches", JSON.stringify(updatedSearches));
    alert("✅ Search saved successfully!");
  };

  const applySavedSearch = (search) => { setFilters(search.filters); setShowSavedSearches(false); };
  const deleteSavedSearch = (searchId) => {
    const updatedSearches = savedSearches.filter(s => s.id !== searchId);
    setSavedSearches(updatedSearches);
    localStorage.setItem("axxspace_saved_searches", JSON.stringify(updatedSearches));
  };

  const leaseLabel = { monthly: "Monthly", "6months": "6 Months", yearly: "Yearly" };

  if (loading) {
    return (
      <div style={S.page}>
        <style>{css}</style>
        <div style={S.loadingWrap}>
          <div style={S.loadingSpinner} className="spinner" />
          <p style={S.loadingText}>Curating exceptional properties…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <style>{css}</style>

      {/* ── HERO HEADER ── */}
      <header style={S.hero}>
        <div style={S.heroOverlay} />
        <div style={S.heroInner}>
          <div style={S.heroBadge}>KENYA'S PREMIER RENTAL PLATFORM</div>
          <h1 style={S.heroTitle}>
            <span style={S.heroTitleLine1}>Discover Your</span>
            <span style={S.heroTitleLine2}>Perfect Home</span>
          </h1>
          <p style={S.heroSub}>Curated rentals across Kenya's finest locations</p>
          <div style={S.partnerNotice} className="partner-shimmer">
            <span style={S.partnerIcon}>🤝</span>
            <span>We are working with partners to bring a better experience soon</span>
          </div>

          {!user && (
            <div style={S.heroButtons}>
              <button className="btn-ghost" style={S.btnGhost} onClick={() => window.location.href = "/login"}>Sign In</button>
              <button className="btn-gold" style={S.btnGold} onClick={() => window.location.href = "/register"}>List Your Property</button>
            </div>
          )}
        </div>
        <div style={S.heroDecor1} />
        <div style={S.heroDecor2} />
      </header>

      <div style={S.mainBody}>

        {error && <div style={S.errorBar}>{error}</div>}

        {/* ── TABS SECTION ── */}
        <div style={S.tabsSection}>
          <button
            className="tab-btn"
            style={{ ...S.tabBtn, ...(!showUniversityHostels ? S.tabBtnActive : {}) }}
            onClick={() => setShowUniversityHostels(false)}
          >
            All Rentals
          </button>
          <button
            className="tab-btn"
            style={{ ...S.tabBtn, ...(showUniversityHostels ? S.tabBtnActive : {}) }}
            onClick={() => setShowUniversityHostels(true)}
          >
            🎓 University Hostels
          </button>
        </div>

        {/* ── SEARCH STRIP (only show when NOT in university hostels mode) ── */}
        {!showUniversityHostels && (
          <div style={S.searchStrip}>
            <div style={S.searchStripInner}>
              <div style={S.searchField}>
                <span style={S.searchIcon}>⌖</span>
                <input type="text" name="location" placeholder="Location or county…" value={filters.location} onChange={handleFilterChange} style={S.searchInput} className="search-inp" />
              </div>
              <div style={S.searchDivider} />
              <div style={S.searchField}>
                <span style={S.searchIcon}>⊞</span>
                <select name="propertyType" value={filters.propertyType} onChange={handleFilterChange} style={S.searchSelect} className="search-inp">
                  <option value="">Property Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="bedsitter">Bedsitter</option>
                  <option value="maisonette">Maisonette</option>
                  <option value="studio">Studio</option>
                  <option value="house">House</option>
                </select>
              </div>
              <div style={S.searchDivider} />
              <div style={S.searchField}>
                <span style={S.searchIcon}>🛏</span>
                <select name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange} style={S.searchSelect} className="search-inp">
                  <option value="">Bedrooms</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                </select>
              </div>
              <div style={S.searchDivider} />
              <button className="btn-gold" style={{ ...S.btnGold, padding: "0 28px", fontSize: "0.85rem", borderRadius: "6px" }} onClick={() => setFiltersOpen(v => !v)}>
                {filtersOpen ? "Close Filters" : "More Filters"}
              </button>
            </div>
          </div>
        )}

        {/* ── EXPANDED FILTERS (only show when NOT in university hostels mode) ── */}
        {!showUniversityHostels && filtersOpen && (
          <div style={S.filtersPanel} className="filters-panel">
            <div style={S.filtersGrid}>
              <div style={S.filterGroup}>
                <label style={S.filterLabel}>Bathrooms</label>
                <select name="bathrooms" value={filters.bathrooms} onChange={handleFilterChange} style={S.filterCtrl} className="filter-ctrl">
                  <option value="">Any</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3+</option>
                </select>
              </div>
              <div style={S.filterGroup}>
                <label style={S.filterLabel}>Furnished</label>
                <select name="furnished" value={filters.furnished} onChange={handleFilterChange} style={S.filterCtrl} className="filter-ctrl">
                  <option value="">Either</option>
                  <option value="true">Furnished</option>
                  <option value="false">Unfurnished</option>
                </select>
              </div>
              <div style={S.filterGroup}>
                <label style={S.filterLabel}>Pet Policy</label>
                <select name="petFriendly" value={filters.petFriendly} onChange={handleFilterChange} style={S.filterCtrl} className="filter-ctrl">
                  <option value="">Any</option>
                  <option value="true">Pet Friendly</option>
                  <option value="false">No Pets</option>
                </select>
              </div>
              <div style={S.filterGroup}>
                <label style={S.filterLabel}>Amenity</label>
                <input type="text" name="amenities" placeholder="WiFi, Parking…" value={filters.amenities} onChange={handleFilterChange} style={S.filterCtrl} className="filter-ctrl" />
              </div>
              <div style={S.filterGroup}>
                <label style={S.filterLabel}>Available From</label>
                <input type="date" name="availableFrom" value={filters.availableFrom} onChange={handleFilterChange} style={S.filterCtrl} className="filter-ctrl" />
              </div>
              <div style={S.filterGroup}>
                <label style={S.filterLabel}>Min Price (KES)</label>
                <input type="number" name="minPrice" placeholder="0" value={filters.minPrice} onChange={handleFilterChange} style={S.filterCtrl} className="filter-ctrl" />
              </div>
              <div style={S.filterGroup}>
                <label style={S.filterLabel}>Max Price (KES)</label>
                <input type="number" name="maxPrice" placeholder="1,000,000" value={filters.maxPrice} onChange={handleFilterChange} style={S.filterCtrl} className="filter-ctrl" />
              </div>
            </div>
          </div>
        )}

        {/* ── TOOLBAR (only show when NOT in university hostels mode) ── */}
        {!showUniversityHostels && (
          <div style={S.toolbar}>
            <p style={S.resultsText}>
              <span style={S.resultsNum}>{filteredProperties.length}</span>
              {filteredProperties.length === 1 ? " property found" : " properties found"}
              {favorites.length > 0 && <span style={S.toolbarBit}> · ♥ {favorites.length} saved</span>}
            </p>
            <div style={S.toolbarActions}>
              <button className="tool-btn" style={S.toolBtn} onClick={saveCurrentSearch}>🔖 Save Search</button>
              {savedSearches.length > 0 && (
                <button className="tool-btn" style={{ ...S.toolBtn, ...(showSavedSearches ? S.toolBtnActive : {}) }} onClick={() => setShowSavedSearches(!showSavedSearches)}>
                  Saved ({savedSearches.length})
                </button>
              )}
              {favorites.length > 0 && (
                <button className="tool-btn" style={{ ...S.toolBtn, ...(showFavoritesOnly ? S.toolBtnActive : {}) }} onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}>
                  {showFavoritesOnly ? "Show All" : "♥ Favourites"}
                </button>
              )}
              <button className="tool-btn" style={{ ...S.toolBtn, ...(showMap ? S.toolBtnActive : {}) }} onClick={() => setShowMap(v => !v)}>
                {showMap ? "Hide Map" : "🗺 Map View"}
              </button>
            </div>
          </div>
        )}

        {/* ── UNIVERSITY HOSTEL SECTION (only show when in university hostels mode) ── */}
        {showUniversityHostels && (
          <div style={S.universitySection}>
            {/* Show university selection when no university is selected */}
            {!selectedUniversity && (
              <>
                <div style={S.universityHeader}>
                  <div style={S.universityBadge}>🎓 STUDENT HOUSING</div>
                  <h2 style={S.universityTitle}>Find Hostels Near Your University</h2>
                  <p style={S.universitySub}>Browse universities across all 47 counties in Kenya and discover affordable hostels nearby</p>
                </div>

                <div style={S.universitySearchBox}>
                  <span style={S.searchIcon}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search your university (e.g., Nairobi, Kenyatta, JKUAT)..."
                    value={universitySearch}
                    onChange={(e) => setUniversitySearch(e.target.value)}
                    style={S.universitySearchInput}
                  />
                </div>

                <div style={S.universityGrid}>
                  {(universitySearch ? searchUniversities(universitySearch) : kenyanUniversities).map((university) => (
                    <div
                      key={university.id}
                      style={S.universityCard}
                      onClick={() => setSelectedUniversity(university)}
                    >
                      <div style={S.universityCardIcon}>🏛️</div>
                      <div style={S.universityCardName}>{university.name}</div>
                      <div style={S.universityCardLocation}>
                        <span>📍 {university.location}</span>
                        <span style={S.universityCardCounty}>{university.county} County</span>
                      </div>
                      <div style={S.universityCardCode}>{university.code}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Show selected university bar when a university is selected */}
            {selectedUniversity && (
              <div style={S.selectedUniversityBar}>
                <div style={S.selectedUniversityInfo}>
                  <span style={S.selectedUniversityLabel}>Showing hostels near:</span>
                  <span style={S.selectedUniversityName}>{selectedUniversity.name}</span>
                  <span style={S.selectedUniversityLocation}>📍 {selectedUniversity.location}, {selectedUniversity.county}</span>
                </div>
                <button
                  style={S.clearUniversityBtn}
                  onClick={() => {
                    setSelectedUniversity(null);
                    setUniversityProperties([]);
                  }}
                >
                  ← Back to Universities
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── SAVED SEARCHES (only show when NOT in university hostels mode) ── */}
        {!showUniversityHostels && showSavedSearches && savedSearches.length > 0 && (
          <div style={S.savedPanel}>
            <h3 style={S.savedTitle}>Saved Searches</h3>
            {savedSearches.map((s) => (
              <div key={s.id} style={S.savedRow}>
                <div>
                  <p style={S.savedName}>{s.name}</p>
                  <p style={S.savedDate}>{new Date(s.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={S.savedApply} onClick={() => applySavedSearch(s)}>Apply</button>
                  <button style={S.savedDelete} onClick={() => deleteSavedSearch(s.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MAP VIEW (only show when NOT in university hostels mode) ── */}
        {!showUniversityHostels && showMap && <div style={S.mapWrap}><MapView properties={filteredProperties} /></div>}

        {/* ── RECENTLY VIEWED (only show when NOT in university hostels mode) ── */}
        {!showUniversityHostels && <RecentlyViewed onSelect={openModal} />}

        {/* ── EMPTY STATE (only show when NOT in university hostels mode) ── */}
        {!showUniversityHostels && filteredProperties.length === 0 && (
          <div style={S.empty}>
            <div style={S.emptyIcon}>🔍</div>
            <p style={S.emptyTitle}>No properties match your search</p>
            <p style={S.emptySub}>Try adjusting your filters to broaden your results</p>
          </div>
        )}

        {showUniversityHostels && selectedUniversity && universityLoading && (
          <div style={S.empty}>
            <p style={S.emptyTitle}>Loading listings near {selectedUniversity.name}...</p>
          </div>
        )}

        {/* ── EMPTY STATE FOR UNIVERSITY HOSTELS (no hostels found) ── */}
        {showUniversityHostels && selectedUniversity && !universityLoading && displayProperties.length === 0 && (
          <div style={S.empty}>
            <div style={S.emptyIcon}>🏠</div>
            <p style={S.emptyTitle}>No hostels found near {selectedUniversity.name}</p>
            <p style={S.emptySub}>Landlords near this campus can list here. Check back soon or try another university.</p>
          </div>
        )}

        {/* ── PROPERTY GRID (show when NOT in university hostels mode, OR when university is selected) ── */}
        {(!showUniversityHostels || selectedUniversity) && displayProperties.length > 0 && (
          <div style={S.grid}>
            {displayProperties.map((property, i) => (
              <article key={property._id} style={S.card} className="prop-card" onClick={() => openModal(property)}>
                {/* Image */}
                <div style={S.cardImg}>
                  {property.images?.length > 0
                    ? <img src={property.images[0]} alt={property.title} style={S.cardImgEl} className="card-img-el" />
                    : <div style={S.cardImgFallback}>No Photo</div>
                  }
                  {/* Badges */}
                  <div style={{ ...S.availBadge, ...(property.availableUnits > 0 ? S.availBadgeGreen : S.availBadgeRed) }}>
                    {property.availableUnits > 0 ? `${property.availableUnits} Available` : "Fully Booked"}
                  </div>
                  {property.images?.length > 1 && (
                    <div style={S.photoBadge}>{property.images.length} Photos</div>
                  )}
                  {/* Favourite */}
                  <button style={S.favBtn} className="fav-btn" onClick={(e) => { e.stopPropagation(); toggleFavorite(property._id); }}>
                    {favorites.includes(property._id) ? "♥" : "♡"}
                  </button>
                  <div style={S.cardImgGrad} />
                </div>

                {/* Content */}
                <div style={S.cardBody}>
                  <div style={S.cardType}>{property.propertyType || "Rental"}</div>
                  <h2 style={S.cardTitle}>{property.title}</h2>
                  <p style={S.cardLocation}>📍 {property.county} · {property.location}</p>

                  <div style={S.cardSpecs}>
                    <span style={S.cardSpec}>{property.bedrooms} Bed</span>
                    <span style={S.specDot}>·</span>
                    <span style={S.cardSpec}>{property.bathrooms} Bath</span>
                    <span style={S.specDot}>·</span>
                    <span style={S.cardSpec}>{property.furnished ? "Furnished" : "Unfurnished"}</span>
                  </div>

                  {property.amenities?.length > 0 && (
                    <div style={S.cardAmenities}>
                      {property.amenities.slice(0, 3).map((a, idx) => (
                        <span key={idx} style={S.cardAmenityTag}>{a}</span>
                      ))}
                      {property.amenities.length > 3 && <span style={S.cardAmenityMore}>+{property.amenities.length - 3}</span>}
                    </div>
                  )}

                  <div style={S.cardFooter}>
                    <div>
                      <div style={S.cardPrice}>KES {property.price?.toLocaleString()}</div>
                      <div style={S.cardPriceSub}>per month</div>
                    </div>
                    <button
                      style={{ ...S.cardCta, ...(property.availableUnits === 0 ? S.cardCtaDisabled : {}) }}
                      className="card-cta"
                      onClick={(e) => { e.stopPropagation(); if (property.availableUnits > 0) handleContactLandlord(property); }}
                      disabled={property.availableUnits === 0}
                    >
                      Enquire
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════ MODAL ═══════════════════════════════ */}
      {selectedProperty && (
        <div style={S.modalBackdrop} onClick={closeModal}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <button style={S.modalClose} className="modal-close" onClick={closeModal}>✕</button>

            {/* Payment Modal */}
            {showPaymentModal && (
              <div style={S.payBackdrop}>
                <div style={S.payBox}>
                  <h3 style={S.payTitle}>M-Pesa Booking</h3>
                  <p style={S.paySub}>{selectedProperty.title} · KES {paymentAmount}</p>
                  {paymentSuccess && <div style={S.paySuccess}>{paymentSuccess}</div>}
                  {paymentError && <div style={S.payError}>{paymentError}</div>}
                  {!paymentSuccess && (
                    <form onSubmit={handlePaymentSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={S.payField}>
                        <label style={S.payLabel}>M-Pesa Phone</label>
                        <PhoneInput value={paymentPhone} onChange={(v) => setPaymentPhone(v)} style={S.payInput} required />
                      </div>
                      <div style={S.payField}>
                        <label style={S.payLabel}>Amount (KES)</label>
                        <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} style={S.payInput} required className="pay-inp" />
                      </div>
                      <button type="submit" style={S.paySubmit} disabled={paymentLoading}>{paymentLoading ? "Processing…" : "Pay with M-Pesa"}</button>
                      <button type="button" style={S.payCancel} onClick={() => setShowPaymentModal(false)}>Cancel</button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* Images */}
            <div style={S.modalGallery}>
              {selectedProperty.images?.length > 0 ? (
                <>
                  <img src={selectedProperty.images[currentImageIndex]} alt={selectedProperty.title} style={S.modalMainImg} />
                  {selectedProperty.images.length > 1 && (
                    <>
                      <button style={S.gallPrev} onClick={prevImage}>‹</button>
                      <button style={S.gallNext} onClick={nextImage}>›</button>
                      <div style={S.gallCounter}>{currentImageIndex + 1} / {selectedProperty.images.length}</div>
                    </>
                  )}
                  <div style={S.modalGallGrad} />
                </>
              ) : (
                <div style={S.modalNoImg}>No Images Available</div>
              )}
            </div>

            {selectedProperty.images?.length > 1 && (
              <div style={S.thumbRow}>
                {selectedProperty.images.map((img, idx) => (
                  <img key={idx} src={img} alt="" style={{ ...S.thumb, ...(idx === currentImageIndex ? S.thumbActive : {}) }} onClick={() => setCurrentImageIndex(idx)} />
                ))}
              </div>
            )}

            {/* Details */}
            <div style={S.modalDetails}>
              <div style={S.modalHeader}>
                <div>
                  <div style={S.modalType}>{selectedProperty.propertyType || "Rental"}</div>
                  <h2 style={S.modalTitle}>{selectedProperty.title}</h2>
                  <p style={S.modalLocation}>📍 {selectedProperty.county} · {selectedProperty.location}</p>
                </div>
                <div style={S.modalPriceBlock}>
                  <div style={S.modalPrice}>KES {selectedProperty.price?.toLocaleString()}</div>
                  <div style={S.modalPriceSub}>/month</div>
                </div>
              </div>

              {/* GPS Coordinates */}
              {selectedProperty.lat && selectedProperty.lng && (
                <div style={S.gpsBox}>
                  <div style={S.gpsCoords}>
                    <div style={S.gpsCoordItem}>
                      <span style={S.gpsLabel}>Latitude:</span>
                      <span style={S.gpsValue}>{selectedProperty.lat.toFixed(6)}</span>
                    </div>
                    <div style={S.gpsCoordItem}>
                      <span style={S.gpsLabel}>Longitude:</span>
                      <span style={S.gpsValue}>{selectedProperty.lng.toFixed(6)}</span>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${selectedProperty.lat},${selectedProperty.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    style={S.mapLink}
                  >
                    🗺️ Open in Google Maps
                  </a>
                </div>
              )}

              <div style={S.modalSpecsRow}>
                <div style={S.modalSpec}><span style={S.modalSpecNum}>{selectedProperty.bedrooms}</span><span style={S.modalSpecLbl}>Bedrooms</span></div>
                <div style={S.modalSpecDiv} />
                <div style={S.modalSpec}><span style={S.modalSpecNum}>{selectedProperty.bathrooms}</span><span style={S.modalSpecLbl}>Bathrooms</span></div>
                <div style={S.modalSpecDiv} />
                <div style={S.modalSpec}><span style={S.modalSpecNum}>{selectedProperty.availableUnits}</span><span style={S.modalSpecLbl}>Available</span></div>
                <div style={S.modalSpecDiv} />
                <div style={S.modalSpec}><span style={S.modalSpecNum}>{selectedProperty.furnished ? "Yes" : "No"}</span><span style={S.modalSpecLbl}>Furnished</span></div>
              </div>

              {/* Pricing boxes */}
              {(selectedProperty.deposit > 0 || selectedProperty.leaseType) && (
                <div style={S.pricingRow}>
                  {selectedProperty.deposit > 0 && (
                    <div style={S.pricingBox}>
                      <span style={S.pricingLbl}>Deposit</span>
                      <span style={S.pricingVal}>KES {selectedProperty.deposit?.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedProperty.leaseType && (
                    <div style={S.pricingBox}>
                      <span style={S.pricingLbl}>Lease Term</span>
                      <span style={S.pricingVal}>{leaseLabel[selectedProperty.leaseType] || selectedProperty.leaseType}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <p style={S.modalDesc}>{selectedProperty.description}</p>

              {/* Rules */}
              {selectedProperty.rules && (
                <div style={S.rulesBox}>
                  <h4 style={S.sectionHead}>House Rules</h4>
                  <p style={S.rulesText}>{selectedProperty.rules}</p>
                </div>
              )}

              {/* Amenities */}
              {selectedProperty.amenities?.length > 0 && (
                <div style={S.section}>
                  <h4 style={S.sectionHead}>Amenities</h4>
                  <div style={S.amenGrid}>
                    {selectedProperty.amenities.map((a, idx) => (
                      <span key={idx} style={S.amenChip}>✓ {a}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              <div style={S.section}>
                <h4 style={S.sectionHead}>Unit Availability</h4>
                <div style={S.unitGrid}>
                  <div style={S.unitBox}><p style={S.unitLbl}>Total Units</p><p style={S.unitNum}>{selectedProperty.totalUnits || 1}</p></div>
                  <div style={S.unitBox}><p style={S.unitLbl}>Booked</p><p style={S.unitNum}>{selectedProperty.bookedUnits || 0}</p></div>
                  <div style={{ ...S.unitBox, background: "rgba(180,150,80,0.12)", border: "1px solid rgba(180,150,80,0.3)" }}><p style={S.unitLbl}>Available</p><p style={{ ...S.unitNum, color: "#C9A84C" }}>{selectedProperty.availableUnits}</p></div>
                </div>
              </div>

              {/* Landlord */}
              <div style={S.contactCard}>
                <div style={S.contactCardLabel}>Listed by</div>
                <div style={S.contactCardName}>{selectedProperty.owner?.name || "—"}</div>
                <div style={S.contactCardPhone}>{selectedProperty.owner?.phone || "—"}</div>
              </div>

              {/* Agent */}
              {selectedProperty.assignedAgent && (
                <div style={{ ...S.contactCard, borderColor: "rgba(180,150,80,0.3)" }}>
                  <div style={S.contactCardLabel}>Property Agent</div>
                  <div style={S.contactCardName}>{selectedProperty.assignedAgent?.name || "—"}</div>
                  <div style={S.contactCardPhone}>{selectedProperty.assignedAgent?.phone || "—"}</div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                    <button style={S.agentWaBtn} onClick={() => { const ph = formatKenyaPhone(selectedProperty.assignedAgent?.phone || ""); const n = selectedProperty.assignedAgent?.name || "Agent"; window.open(`https://wa.me/${ph}?text=${encodeURIComponent(`Hi ${n}, I'm interested in "${selectedProperty.title}".`)}`, "_blank"); }}>WhatsApp Agent</button>
                    <button style={S.agentCallBtn} onClick={() => window.open(`tel:+254${selectedProperty.assignedAgent?.phone || ""}`)}>Call Agent</button>
                  </div>
                </div>
              )}

              <ShareProperty property={selectedProperty} />

              {/* CTA Buttons */}
              <div style={S.ctaGrid}>
                <button style={{ ...S.ctaBtn, ...S.ctaWa, ...(selectedProperty.availableUnits === 0 ? S.ctaDisabled : {}) }} onClick={() => handleContactLandlord(selectedProperty)} disabled={selectedProperty.availableUnits === 0}>WhatsApp</button>
                <button style={{ ...S.ctaBtn, ...S.ctaCall }} onClick={() => window.open(`tel:${selectedProperty.owner?.phone || selectedProperty.phone}`)}>📞 Call</button>
                <button style={{ ...S.ctaBtn, ...S.ctaSms }} onClick={() => handleSendSMS(selectedProperty)}>SMS</button>
                <button style={{ ...S.ctaBtn, ...S.ctaBook }} onClick={() => handleBookNow(selectedProperty)}>Book Now</button>
              </div>

              {/* Booking Calendar */}
              <div style={S.section}>
                <h4 style={S.sectionHead}>Check Availability</h4>
                <BookingCalendar propertyId={selectedProperty._id} availableUnits={selectedProperty.availableUnits} />
              </div>

              {/* Messaging */}
              {user && (
                <div style={S.section}>
                  <h4 style={S.sectionHead}>Message Landlord</h4>
                  <MessagingSystem recipientId={selectedProperty.owner?._id || selectedProperty.owner?.id} recipientName={selectedProperty.owner?.name || "Landlord"} recipientType="landlord" propertyId={selectedProperty._id} propertyTitle={selectedProperty.title} />
                </div>
              )}

              <ReviewsSection propertyId={selectedProperty._id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════
   DESIGN SYSTEM  — Luxury Real Estate
   Palette: Deep Navy · Champagne Gold · Ivory Cream
   Font: Cormorant Garamond (headings) + DM Sans (body)
════════════════════════════════════════════════ */
const C = {
  navy: "#0D1B2A",
  navyMid: "#162233",
  navyLight: "#1E3148",
  gold: "#C9A84C",
  goldLight: "#E2C47A",
  goldDim: "rgba(201,168,76,0.15)",
  cream: "#F5F0E8",
  creamDim: "#EDE6D6",
  white: "#FFFFFF",
  textMain: "#F0EAD8",
  textMid: "#B8AD96",
  textDim: "#7A7260",
  green: "#4CAF74",
  red: "#E05252",
  border: "rgba(201,168,76,0.18)",
  borderSoft: "rgba(255,255,255,0.08)",
};

const S = {
  /* Page */
  page: { minHeight: "100vh", background: C.navy, fontFamily: "'DM Sans', sans-serif", color: C.textMain },

  /* Loading */
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "20px" },
  loadingSpinner: { width: "48px", height: "48px", border: `3px solid ${C.goldDim}`, borderTop: `3px solid ${C.gold}`, borderRadius: "50%" },
  loadingText: { color: C.textMid, fontSize: "1rem", letterSpacing: "0.15em", textTransform: "uppercase" },

  /* Hero */
  hero: { position: "relative", background: `linear-gradient(135deg, #071018 0%, #0D1B2A 40%, #162233 70%, #0a1520 100%)`, padding: "80px 40px 100px", overflow: "hidden", textAlign: "center" },
  heroOverlay: { position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 70%)", pointerEvents: "none" },
  heroInner: { position: "relative", zIndex: 2, maxWidth: "800px", margin: "0 auto" },
  heroBadge: { display: "inline-block", border: `1px solid ${C.gold}`, color: C.gold, fontSize: "0.7rem", letterSpacing: "0.22em", padding: "6px 18px", borderRadius: "20px", marginBottom: "28px", textTransform: "uppercase" },
  heroTitle: { margin: 0, lineHeight: 1 },
  heroTitleLine1: { display: "block", fontFamily: "'Cormorant Garamond', 'Georgia', serif", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 300, color: C.textMain, letterSpacing: "0.04em" },
  heroTitleLine2: { display: "block", fontFamily: "'Cormorant Garamond', 'Georgia', serif", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 700, color: C.gold, letterSpacing: "0.04em", fontStyle: "italic" },
  heroSub: { color: C.textMid, fontSize: "1.05rem", marginTop: "16px", letterSpacing: "0.06em" },
  partnerNotice: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px", border: `1px solid ${C.border}`, borderRadius: "30px", padding: "8px 20px", marginTop: "20px", fontSize: "0.85rem", color: C.textMid, backdropFilter: "blur(8px)", letterSpacing: "0.02em" },
  partnerIcon: { color: C.gold, fontSize: "1rem" },
  heroButtons: { display: "flex", gap: "14px", justifyContent: "center", marginTop: "36px" },
  heroDecor1: { position: "absolute", width: "400px", height: "400px", border: `1px solid rgba(201,168,76,0.06)`, borderRadius: "50%", top: "-150px", right: "-100px", pointerEvents: "none" },
  heroDecor2: { position: "absolute", width: "300px", height: "300px", border: `1px solid rgba(201,168,76,0.06)`, borderRadius: "50%", bottom: "-100px", left: "-80px", pointerEvents: "none" },

  /* Shared Buttons */
  btnGold: { background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 100%)`, color: C.navy, border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", padding: "12px 28px", letterSpacing: "0.05em", fontFamily: "'DM Sans', sans-serif", transition: "all 0.25s ease" },
  btnGhost: { background: "transparent", color: C.textMain, border: `1px solid ${C.border}`, borderRadius: "6px", fontWeight: 500, cursor: "pointer", fontSize: "0.9rem", padding: "12px 28px", fontFamily: "'DM Sans', sans-serif", transition: "all 0.25s ease" },

  /* Main Body */
  mainBody: { maxWidth: "1280px", margin: "0 auto", padding: "0 28px 80px" },
  errorBar: { background: "rgba(224,82,82,0.12)", border: "1px solid rgba(224,82,82,0.3)", color: "#F28B8B", padding: "12px 18px", borderRadius: "8px", margin: "24px 0", textAlign: "center" },

  /* Tabs Section */
  tabsSection: { display: "flex", gap: "8px", marginBottom: "24px", borderBottom: `1px solid ${C.border}`, paddingBottom: "16px" },
  tabBtn: { padding: "10px 20px", background: "transparent", border: `1px solid ${C.border}`, color: C.textMid, borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" },
  tabBtnActive: { background: C.goldDim, borderColor: C.gold, color: C.gold },

  /* Search Strip */
  searchStrip: { background: C.navyMid, border: `1px solid ${C.border}`, borderRadius: "12px", margin: "-40px auto 36px", position: "relative", zIndex: 10, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" },
  searchStripInner: { display: "flex", alignItems: "center", padding: "6px 12px", flexWrap: "wrap", gap: "4px" },
  searchField: { display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "160px", padding: "10px 12px" },
  searchIcon: { color: C.gold, fontSize: "1.1rem", flexShrink: 0 },
  searchInput: { background: "transparent", border: "none", outline: "none", color: C.textMain, fontSize: "0.92rem", width: "100%", fontFamily: "'DM Sans', sans-serif" },
  searchSelect: { background: "transparent", border: "none", outline: "none", color: C.textMain, fontSize: "0.92rem", width: "100%", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" },
  searchDivider: { width: "1px", height: "32px", background: C.border, flexShrink: 0 },

  /* Expanded Filters */
  filtersPanel: { background: C.navyMid, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px", marginBottom: "28px" },
  filtersGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" },
  filterGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  filterLabel: { fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, fontWeight: 600 },
  filterCtrl: { background: C.navyLight, border: `1px solid ${C.border}`, borderRadius: "6px", color: C.textMain, padding: "9px 12px", fontSize: "0.9rem", outline: "none", fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s" },

  /* Toolbar */
  toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" },
  resultsText: { color: C.textMid, fontSize: "0.9rem", margin: 0 },
  resultsNum: { color: C.gold, fontWeight: 700, fontSize: "1.05rem" },
  toolbarBit: { color: C.textDim },
  toolbarActions: { display: "flex", gap: "8px", flexWrap: "wrap" },
  toolBtn: { padding: "8px 16px", background: "transparent", border: `1px solid ${C.border}`, color: C.textMid, borderRadius: "6px", cursor: "pointer", fontSize: "0.82rem", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.04em", transition: "all 0.2s" },
  toolBtnActive: { background: C.goldDim, borderColor: C.gold, color: C.gold },

  /* Saved Searches */
  savedPanel: { background: C.navyMid, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", marginBottom: "28px" },
  savedTitle: { color: C.textMain, fontSize: "0.95rem", fontWeight: 600, margin: "0 0 14px", letterSpacing: "0.05em" },
  savedRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: C.navyLight, borderRadius: "8px", marginBottom: "8px" },
  savedName: { color: C.textMain, margin: 0, fontSize: "0.9rem", fontWeight: 500 },
  savedDate: { color: C.textDim, margin: 0, fontSize: "0.78rem", marginTop: "3px" },
  savedApply: { padding: "6px 14px", background: C.goldDim, border: `1px solid ${C.gold}`, color: C.gold, borderRadius: "5px", cursor: "pointer", fontSize: "0.8rem", fontFamily: "'DM Sans', sans-serif" },
  savedDelete: { padding: "6px 14px", background: "rgba(224,82,82,0.1)", border: "1px solid rgba(224,82,82,0.3)", color: C.red, borderRadius: "5px", cursor: "pointer", fontSize: "0.8rem", fontFamily: "'DM Sans', sans-serif" },

  /* University Section */
  universitySection: { background: `linear-gradient(135deg, ${C.navyMid} 0%, ${C.navyLight} 50%, ${C.navyMid} 100%)`, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "32px 28px", marginBottom: "36px", position: "relative", overflow: "hidden" },
  universityHeader: { textAlign: "center", marginBottom: "28px", position: "relative", zIndex: 2 },
  universityBadge: { display: "inline-block", background: C.goldDim, border: `1px solid ${C.gold}`, color: C.gold, fontSize: "0.7rem", letterSpacing: "0.18em", padding: "6px 18px", borderRadius: "20px", marginBottom: "16px", textTransform: "uppercase", fontWeight: 700 },
  universityTitle: { fontFamily: "'Cormorant Garamond', 'Georgia', serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: C.textMain, margin: "0 0 10px", letterSpacing: "0.02em" },
  universitySub: { color: C.textMid, fontSize: "0.95rem", margin: 0, maxWidth: "500px", marginInline: "auto", lineHeight: 1.6 },
  universitySearchBox: { display: "flex", alignItems: "center", gap: "12px", background: C.navy, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "14px 18px", marginBottom: "28px", maxWidth: "600px", marginInline: "auto" },
  universitySearchInput: { background: "transparent", border: "none", outline: "none", color: C.textMain, fontSize: "1rem", width: "100%", fontFamily: "'DM Sans', sans-serif" },
  universityGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" },
  universityCard: { background: C.navy, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", cursor: "pointer", transition: "all 0.3s ease", position: "relative", overflow: "hidden" },
  universityCardActive: { background: C.goldDim, borderColor: C.gold, transform: "translateY(-4px)", boxShadow: "0 12px 40px rgba(201,168,76,0.2)" },
  universityCardIcon: { fontSize: "2rem", marginBottom: "12px" },
  universityCardName: { fontFamily: "'Cormorant Garamond', 'Georgia', serif", fontSize: "1.1rem", fontWeight: 700, color: C.textMain, marginBottom: "8px", lineHeight: 1.3 },
  universityCardLocation: { display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px" },
  universityCardCounty: { fontSize: "0.8rem", color: C.textDim, fontWeight: 500 },
  universityCardCode: { display: "inline-block", background: C.navyLight, border: `1px solid ${C.borderSoft}`, color: C.gold, padding: "4px 12px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em" },
  selectedUniversityBar: { display: "flex", alignItems: "center", justifyContent: "space-between", background: C.goldDim, border: `1px solid ${C.gold}`, borderRadius: "10px", padding: "16px 20px", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  selectedUniversityInfo: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" },
  selectedUniversityLabel: { color: C.textDim, fontSize: "0.85rem", fontWeight: 500 },
  selectedUniversityName: { color: C.gold, fontSize: "1rem", fontWeight: 700, fontFamily: "'Cormorant Garamond', 'Georgia', serif" },
  selectedUniversityLocation: { color: C.textMid, fontSize: "0.85rem" },
  clearUniversityBtn: { padding: "8px 16px", background: "transparent", border: `1px solid ${C.gold}`, color: C.gold, borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" },
  universityFooter: { textAlign: "center", marginTop: "20px" },
  toggleSectionBtn: { padding: "10px 20px", background: "transparent", border: `1px solid ${C.borderSoft}`, color: C.textDim, borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" },
  showUniversityBar: { textAlign: "center", marginBottom: "28px" },
  showUniversityBtn: { padding: "12px 24px", background: C.goldDim, border: `1px solid ${C.gold}`, color: C.gold, borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" },

  /* Map */
  mapWrap: { borderRadius: "12px", overflow: "hidden", marginBottom: "28px", border: `1px solid ${C.border}` },

  /* Empty */
  empty: { textAlign: "center", padding: "80px 20px", border: `1px dashed ${C.border}`, borderRadius: "12px" },
  emptyIcon: { fontSize: "2.5rem", marginBottom: "16px" },
  emptyTitle: { color: C.textMain, fontSize: "1.1rem", fontWeight: 600, margin: "0 0 8px" },
  emptySub: { color: C.textMid, fontSize: "0.9rem", margin: 0 },

  /* Property Grid */
  grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" },
  "@media (max-width: 768px)": { grid: { gap: "16px" } },
  "@media (max-width: 480px)": { grid: { gap: "12px" } },
  "@media (max-width: 380px)": { grid: { gap: "8px" } },
  card: { background: C.navyMid, border: `1px solid ${C.border}`, borderRadius: "14px", overflow: "hidden", cursor: "pointer", transition: "all 0.3s ease", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },

  cardImg: { position: "relative", aspectRatio: "1/1", overflow: "hidden", background: C.navyLight, flexShrink: 0 },
  cardImgEl: { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" },
  cardImgFallback: { display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: C.textDim, fontSize: "0.9rem" },
  cardImgGrad: { position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,27,42,0.7) 0%, transparent 50%)", pointerEvents: "none" },

  availBadge: { position: "absolute", top: "14px", left: "14px", padding: "5px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.04em" },
  availBadgeGreen: { background: "rgba(76,175,116,0.9)", color: "#fff" },
  availBadgeRed: { background: "rgba(224,82,82,0.9)", color: "#fff" },
  photoBadge: { position: "absolute", bottom: "12px", right: "12px", background: "rgba(13,27,42,0.75)", color: C.textMid, padding: "4px 10px", borderRadius: "5px", fontSize: "0.75rem", backdropFilter: "blur(6px)" },
  favBtn: { position: "absolute", top: "14px", right: "14px", background: "rgba(13,27,42,0.7)", border: "none", color: C.gold, width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", transition: "all 0.2s" },

  cardBody: { padding: "20px 22px 22px", display: "flex", flexDirection: "column", flex: 1 },
  cardType: { fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold, marginBottom: "6px", fontWeight: 600 },
  cardTitle: { color: C.textMain, fontSize: "1.05rem", fontWeight: 600, margin: "0 0 6px", lineHeight: 1.3, fontFamily: "'Cormorant Garamond', 'Georgia', serif" },
  cardLocation: { color: C.textMid, fontSize: "0.82rem", margin: "0 0 14px" },
  cardSpecs: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", flexWrap: "wrap" },
  cardSpec: { color: C.textMid, fontSize: "0.82rem" },
  specDot: { color: C.textDim, fontSize: "0.7rem" },
  cardAmenities: { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" },
  cardAmenityTag: { background: C.navyLight, border: `1px solid ${C.borderSoft}`, color: C.textMid, padding: "3px 9px", borderRadius: "4px", fontSize: "0.72rem" },
  cardAmenityMore: { background: C.goldDim, border: `1px solid ${C.gold}`, color: C.gold, padding: "3px 9px", borderRadius: "4px", fontSize: "0.72rem" },
  cardFooter: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "auto", paddingTop: "14px", borderTop: `1px solid ${C.borderSoft}` },
  cardPrice: { color: C.gold, fontSize: "1.2rem", fontWeight: 700, fontFamily: "'Cormorant Garamond', 'Georgia', serif" },
  cardPriceSub: { color: C.textDim, fontSize: "0.75rem", marginTop: "2px" },
  cardCta: { padding: "9px 20px", background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 100%)`, color: C.navy, border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", letterSpacing: "0.05em", fontFamily: "'DM Sans', sans-serif", transition: "all 0.25s" },
  cardCtaDisabled: { opacity: 0.4, cursor: "not-allowed" },

  /* Modal */
  modalBackdrop: { position: "fixed", inset: 0, background: "rgba(7,16,24,0.88)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px", backdropFilter: "blur(6px)" },
  modal: { background: C.navyMid, borderRadius: "16px", maxWidth: "660px", width: "100%", maxHeight: "92vh", overflowY: "auto", border: `1px solid ${C.border}`, position: "relative", boxShadow: "0 40px 100px rgba(0,0,0,0.6)" },
  modalClose: { position: "absolute", top: "14px", right: "14px", background: "rgba(13,27,42,0.8)", border: "none", color: C.textMid, width: "34px", height: "34px", borderRadius: "50%", cursor: "pointer", fontSize: "1rem", zIndex: 1001, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" },

  /* Gallery */
  modalGallery: { position: "relative", height: "320px", background: C.navy, overflow: "hidden", borderRadius: "16px 16px 0 0" },
  modalMainImg: { width: "100%", height: "100%", objectFit: "cover" },
  modalGallGrad: { position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,27,42,0.6) 0%, transparent 50%)", pointerEvents: "none" },
  modalNoImg: { display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: C.textDim },
  gallPrev: { position: "absolute", top: "50%", left: "14px", transform: "translateY(-50%)", background: "rgba(13,27,42,0.7)", border: "none", color: C.white, width: "42px", height: "42px", borderRadius: "50%", cursor: "pointer", fontSize: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" },
  gallNext: { position: "absolute", top: "50%", right: "14px", transform: "translateY(-50%)", background: "rgba(13,27,42,0.7)", border: "none", color: C.white, width: "42px", height: "42px", borderRadius: "50%", cursor: "pointer", fontSize: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" },
  gallCounter: { position: "absolute", bottom: "14px", left: "50%", transform: "translateX(-50%)", background: "rgba(13,27,42,0.7)", color: C.textMid, padding: "4px 14px", borderRadius: "12px", fontSize: "0.8rem", backdropFilter: "blur(4px)" },

  thumbRow: { display: "flex", gap: "8px", padding: "12px 16px", overflowX: "auto", background: C.navy },
  thumb: { width: "64px", height: "64px", objectFit: "cover", borderRadius: "6px", cursor: "pointer", opacity: 0.5, border: "2px solid transparent", flexShrink: 0, transition: "all 0.2s" },
  thumbActive: { opacity: 1, borderColor: C.gold },

  /* Modal Details */
  modalDetails: { padding: "28px" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "24px", flexWrap: "wrap" },
  modalType: { fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold, marginBottom: "6px", fontWeight: 600 },
  modalTitle: { fontFamily: "'Cormorant Garamond', 'Georgia', serif", fontSize: "1.7rem", fontWeight: 700, color: C.textMain, margin: "0 0 6px", lineHeight: 1.2 },
  modalLocation: { color: C.textMid, fontSize: "0.87rem", margin: 0 },
  modalPriceBlock: { textAlign: "right", flexShrink: 0 },
  modalPrice: { fontFamily: "'Cormorant Garamond', 'Georgia', serif", fontSize: "1.6rem", fontWeight: 700, color: C.gold },
  modalPriceSub: { color: C.textDim, fontSize: "0.8rem" },

  /* GPS Coordinates */
  gpsBox: { background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.25)", borderRadius: "10px", padding: "14px 18px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" },
  gpsCoords: { display: "flex", gap: "24px", alignItems: "center" },
  gpsCoordItem: { display: "flex", flexDirection: "column", gap: "3px" },
  gpsLabel: { fontSize: "0.68rem", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.08em" },
  gpsValue: { fontSize: "0.9rem", fontWeight: 600, color: C.textMain, fontFamily: "monospace" },
  mapLink: { background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", padding: "8px 16px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", textDecoration: "none", whiteSpace: "nowrap" },

  modalSpecsRow: { display: "flex", alignItems: "center", background: C.navyLight, borderRadius: "10px", padding: "18px 22px", marginBottom: "22px", flexWrap: "wrap", gap: "0" },
  modalSpec: { flex: 1, textAlign: "center", display: "flex", flexDirection: "column", gap: "4px", minWidth: "70px" },
  modalSpecNum: { fontFamily: "'Cormorant Garamond', 'Georgia', serif", fontSize: "1.4rem", fontWeight: 700, color: C.textMain },
  modalSpecLbl: { fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: C.textDim },
  modalSpecDiv: { width: "1px", height: "36px", background: C.border, flexShrink: 0 },

  pricingRow: { display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" },
  pricingBox: { flex: 1, background: C.navyLight, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "14px", textAlign: "center", minWidth: "100px" },
  pricingLbl: { display: "block", color: C.textDim, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" },
  pricingVal: { display: "block", color: C.gold, fontWeight: 700, fontFamily: "'Cormorant Garamond', 'Georgia', serif", fontSize: "1.05rem" },

  modalDesc: { color: C.textMid, lineHeight: 1.7, marginBottom: "22px", fontSize: "0.92rem" },

  section: { marginBottom: "22px" },
  sectionHead: { fontFamily: "'Cormorant Garamond', 'Georgia', serif", fontSize: "1rem", fontWeight: 600, color: C.gold, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px", borderBottom: `1px solid ${C.border}`, paddingBottom: "8px" },

  rulesBox: { background: C.navyLight, borderLeft: `3px solid ${C.gold}`, borderRadius: "0 8px 8px 0", padding: "14px 16px", marginBottom: "22px" },
  rulesText: { color: C.textMid, fontSize: "0.88rem", lineHeight: 1.6, margin: 0 },

  amenGrid: { display: "flex", flexWrap: "wrap", gap: "8px" },
  amenChip: { background: C.navyLight, border: `1px solid ${C.border}`, color: C.textMid, padding: "5px 12px", borderRadius: "5px", fontSize: "0.8rem" },

  unitGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" },
  unitBox: { background: C.navyLight, border: `1px solid ${C.borderSoft}`, borderRadius: "8px", padding: "14px", textAlign: "center" },
  unitLbl: { color: C.textDim, fontSize: "0.75rem", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.08em" },
  unitNum: { color: C.textMain, fontSize: "1.5rem", fontWeight: 700, margin: 0, fontFamily: "'Cormorant Garamond', 'Georgia', serif" },

  contactCard: { background: C.navyLight, border: `1px solid ${C.borderSoft}`, borderRadius: "10px", padding: "16px 18px", marginBottom: "16px" },
  contactCardLabel: { fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: C.textDim, marginBottom: "6px" },
  contactCardName: { color: C.textMain, fontSize: "1rem", fontWeight: 600, fontFamily: "'Cormorant Garamond', 'Georgia', serif" },
  contactCardPhone: { color: C.textMid, fontSize: "0.87rem", marginTop: "4px" },

  agentWaBtn: { flex: 1, padding: "10px 16px", background: "rgba(76,175,116,0.15)", border: "1px solid rgba(76,175,116,0.4)", color: C.green, borderRadius: "7px", cursor: "pointer", fontSize: "0.85rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 },
  agentCallBtn: { flex: 1, padding: "10px 16px", background: C.navyMid, border: `1px solid ${C.border}`, color: C.textMain, borderRadius: "7px", cursor: "pointer", fontSize: "0.85rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 },

  ctaGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", margin: "22px 0" },
  ctaBtn: { padding: "13px 16px", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif", transition: "all 0.25s" },
  ctaWa: { background: "linear-gradient(135deg, #22a55e 0%, #1a8b4e 100%)", color: C.white },
  ctaCall: { background: `linear-gradient(135deg, #2563EB 0%, #1E4DB7 100%)`, color: C.white },
  ctaSms: { background: `linear-gradient(135deg, #D97706 0%, #B45309 100%)`, color: C.white },
  ctaBook: { background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 100%)`, color: C.navy },
  ctaDisabled: { opacity: 0.4, cursor: "not-allowed" },

  /* Payment Modal */
  payBackdrop: { position: "fixed", inset: 0, background: "rgba(7,16,24,0.9)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, padding: "20px", backdropFilter: "blur(8px)" },
  payBox: { background: C.navyMid, border: `1px solid ${C.border}`, borderRadius: "14px", maxWidth: "380px", width: "100%", padding: "28px", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" },
  payTitle: { fontFamily: "'Cormorant Garamond', 'Georgia', serif", fontSize: "1.4rem", color: C.gold, textAlign: "center", margin: "0 0 8px" },
  paySub: { color: C.textMid, textAlign: "center", marginBottom: "20px", fontSize: "0.87rem" },
  payField: { display: "flex", flexDirection: "column", gap: "6px" },
  payLabel: { fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, fontWeight: 600 },
  payInput: { background: C.navyLight, border: `1px solid ${C.border}`, borderRadius: "6px", color: C.textMain, padding: "10px 12px", fontSize: "0.9rem", outline: "none", fontFamily: "'DM Sans', sans-serif" },
  paySubmit: { padding: "13px 16px", background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 100%)`, color: C.navy, border: "none", borderRadius: "7px", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem", fontFamily: "'DM Sans', sans-serif" },
  payCancel: { padding: "11px 16px", background: "transparent", color: C.textMid, border: `1px solid ${C.border}`, borderRadius: "7px", cursor: "pointer", fontSize: "0.9rem", fontFamily: "'DM Sans', sans-serif" },
  paySuccess: { background: "rgba(76,175,116,0.12)", border: "1px solid rgba(76,175,116,0.3)", color: "#86efac", padding: "12px", borderRadius: "6px", marginBottom: "16px", textAlign: "center", fontSize: "0.88rem" },
  payError: { background: "rgba(224,82,82,0.12)", border: "1px solid rgba(224,82,82,0.3)", color: "#fca5a5", padding: "12px", borderRadius: "6px", marginBottom: "16px", textAlign: "center", fontSize: "0.88rem" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::placeholder { color: #7A7260 !important; }
  option { background: #162233; color: #F0EAD8; }
  
  .spinner { animation: spin 0.9s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .filters-panel { animation: slideDown 0.25s ease; }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

  .partner-shimmer {
    background: linear-gradient(120deg, rgba(201,168,76,0.05) 30%, rgba(201,168,76,0.18) 40%, rgba(201,168,76,0.18) 60%, rgba(201,168,76,0.05) 70%);
    background-size: 200% auto;
    animation: shine 4s linear infinite;
  }
  @keyframes shine {
    to { background-position: 200% center; }
  }

  .prop-card:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.35), 0 0 0 1px rgba(201,168,76,0.3); }
  .prop-card:hover .card-img-el { transform: scale(1.05); }

  .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201,168,76,0.35); filter: brightness(1.05); }
  .btn-ghost:hover { border-color: rgba(201,168,76,0.5); color: #C9A84C; }

  .tool-btn:hover { background: rgba(201,168,76,0.08); border-color: rgba(201,168,76,0.4); color: #C9A84C; }
  .fav-btn:hover { transform: scale(1.15); background: rgba(201,168,76,0.15) !important; }

  .university-card:hover { transform: translateY(-4px); border-color: rgba(201,168,76,0.5); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
  .clear-university-btn:hover { background: rgba(201,168,76,0.15); }
  .toggle-section-btn:hover { border-color: rgba(201,168,76,0.4); color: #C9A84C; }
  .show-university-btn:hover { background: rgba(201,168,76,0.2); transform: translateY(-2px); }

  .search-inp::placeholder { color: #7A7260; }
  .search-inp:focus { outline: none; }
  .filter-ctrl:focus { border-color: #C9A84C !important; }
  .pay-inp:focus { border-color: #C9A84C !important; }

  .card-cta:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(201,168,76,0.35); filter: brightness(1.08); }

  .modal-close:hover { background: rgba(201,168,76,0.15) !important; color: #C9A84C !important; }

  /* Scrollbar styling */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #0D1B2A; }
  ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(201,168,76,0.6); }

  @media (max-width: 700px) {
    .search-strip-inner { flex-direction: column; }
    .search-divider { display: none; }
  }
`;