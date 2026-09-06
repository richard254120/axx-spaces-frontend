import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

// Design System Colors
const C = {
  navy: "#0D1B2A",
  navyLight: "#1E3148",
  gold: "#C9A84C",
  goldLight: "#E2C47A",
  cream: "#F5F0E8",
  white: "#FFFFFF",
  textMain: "#F0EAD8",
  textMid: "#B8AD96",
  textDim: "#7A7260",
  teal: "#1D9E75",
  tealDark: "#085041",
  border: "rgba(201,168,76,0.18)",
  surface: "rgba(22, 34, 51, 0.7)"
};

const categories = [
  { id: "legal", name: "Legal", icon: "⚖️", description: "Lawyers and legal services" },
  { id: "accounting", name: "Accounting", icon: "📊", description: "Financial and tax services" },
  { id: "consulting", name: "Consulting", icon: "💼", description: "Business and strategy consulting" },
  { id: "tutoring", name: "Tutoring", icon: "📚", description: "Education and tutoring services" },
  { id: "medical", name: "Medical", icon: "🏥", description: "Healthcare professionals" },
  { id: "engineering", name: "Engineering", icon: "🔬", description: "Engineering services" },
  { id: "architecture", name: "Architecture", icon: "🏛️", description: "Design and architecture" },
  { id: "other", name: "Other", icon: "🔧", description: "Other professional services" }
];

export default function ProfessionalServices() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [locationFilter, setLocationFilter] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    fetchServices();
    fetchSpecializations();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, selectedCategory, searchQuery, priceRange, locationFilter, specializationFilter, experienceFilter, verifiedOnly]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await API.get("/professional-services");
      setServices(response.data.services || []);
      setFilteredServices(response.data.services || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const response = await API.get("/professional-services/specializations");
      setSpecializations(response.data || []);
    } catch (error) {
      console.error("Error fetching specializations:", error);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    if (selectedCategory !== "all") {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.professionalInfo.specializations.some(spec => 
          spec.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        (s.businessInfo.companyName && s.businessInfo.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(s => 
        s.location.city.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (specializationFilter) {
      filtered = filtered.filter(s => 
        s.professionalInfo.specializations.some(spec => 
          spec.toLowerCase().includes(specializationFilter.toLowerCase())
        )
      );
    }

    if (experienceFilter) {
      filtered = filtered.filter(s => 
        s.professionalInfo.experience >= parseInt(experienceFilter)
      );
    }

    if (verifiedOnly) {
      filtered = filtered.filter(s => s.verification.verified);
    }

    if (priceRange.min) {
      filtered = filtered.filter(s => s.pricing.hourlyRate >= parseFloat(priceRange.min));
    }

    if (priceRange.max) {
      filtered = filtered.filter(s => s.pricing.hourlyRate <= parseFloat(priceRange.max));
    }

    setFilteredServices(filtered);
  };

  const handleBookConsultation = (serviceId) => {
    if (!user) {
      navigate("/login", { state: { from: `/professional-services/${serviceId}` } });
      return;
    }
    navigate(`/professional-services/${serviceId}`);
  };

  const StarRating = ({ value }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ color: star <= value ? C.gold : C.textDim }}>
          {star <= value ? "★" : "☆"}
        </span>
      ))}
      <span style={{ color: C.textDim, fontSize: "12px", marginLeft: "4px" }}>
        {value?.toFixed(1) || "0.0"}
      </span>
    </div>
  );

  const ServiceCard = ({ service }) => (
    <div 
      className="service-card"
      onClick={() => navigate(`/professional-services/${service._id}`)}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {service.featured && (
        <div style={{
          position: "absolute",
          top: "0",
          right: "0",
          background: C.gold,
          color: C.navy,
          padding: "4px 12px",
          fontSize: "10px",
          fontWeight: "700",
          borderBottomLeftRadius: "8px",
          zIndex: "10"
        }}>
          FEATURED
        </div>
      )}

      {/* Image */}
      <div style={{ height: "180px", overflow: "hidden", position: "relative" }}>
        {service.images && service.images.length > 0 ? (
          <img
            src={service.images[0]}
            alt={service.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
        ) : (
          <div style={{
            width: "100%",
            height: "100%",
            background: C.navyLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "48px"
          }}>
            {categories.find(c => c.id === service.category)?.icon || "👨‍💼"}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{
            background: "rgba(201,168,76,0.1)",
            color: C.gold,
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: "600"
          }}>
            {categories.find(c => c.id === service.category)?.name || service.category}
          </span>
          {service.verification.verified && (
            <span style={{
              background: "rgba(29,158,117,0.1)",
              color: C.teal,
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: "600"
            }}>
              ✓ Verified
            </span>
          )}
        </div>

        <h3 style={{
          fontSize: "16px",
          fontWeight: "700",
          color: C.textMain,
          marginBottom: "4px",
          margin: "0 0 4px 0"
        }}>
          {service.name}
        </h3>

        {service.businessInfo.companyName && (
          <p style={{
            fontSize: "12px",
            color: C.textDim,
            marginBottom: "8px",
            fontStyle: "italic"
          }}>
            {service.businessInfo.companyName}
          </p>
        )}

        <p style={{
          fontSize: "13px",
          color: C.textMid,
          marginBottom: "12px",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}>
          {service.description}
        </p>

        {/* Specializations */}
        {service.professionalInfo.specializations.length > 0 && (
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {service.professionalInfo.specializations.slice(0, 3).map((spec, idx) => (
                <span key={idx} style={{
                  background: "rgba(255,255,255,0.05)",
                  color: C.textMid,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "10px"
                }}>
                  {spec}
                </span>
              ))}
              {service.professionalInfo.specializations.length > 3 && (
                <span style={{ fontSize: "10px", color: C.textDim }}>
                  +{service.professionalInfo.specializations.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <span style={{ fontSize: "12px", color: C.textDim }}>
            📍 {service.location.city}
          </span>
          <span style={{ fontSize: "12px", color: C.textDim }}>
            🎓 {service.professionalInfo.experience} yrs exp
          </span>
          {service.location.remoteConsultation && (
            <span style={{ fontSize: "12px", color: C.teal }}>
              📹 Remote available
            </span>
          )}
        </div>

        <div style={{ marginBottom: "12px" }}>
          <StarRating value={service.stats.rating} />
          <span style={{ fontSize: "11px", color: C.textDim, marginLeft: "8px" }}>
            ({service.stats.reviewCount} reviews)
          </span>
        </div>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "12px",
          borderTop: `1px solid ${C.border}`
        }}>
          <div>
            <span style={{
              fontSize: "18px",
              fontWeight: "700",
              color: C.gold
            }}>
              KES {service.pricing.hourlyRate.toLocaleString()}
            </span>
            <span style={{
              fontSize: "12px",
              color: C.textDim,
              marginLeft: "4px"
            }}>
              /hour
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBookConsultation(service._id);
            }}
            style={{
              background: C.gold,
              color: C.navy,
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.goldLight;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = C.gold;
            }}
          >
            Book Consultation
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: C.navy,
      color: C.textMain,
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`,
        padding: "60px 28px 40px",
        borderBottom: `1px solid ${C.border}`
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: "700",
            marginBottom: "16px",
            background: `linear-gradient(135deg, ${C.textMain} 0%, ${C.gold} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Professional Services
          </h1>
          <p style={{
            fontSize: "16px",
            color: C.textMid,
            maxWidth: "600px",
            lineHeight: "1.6"
          }}>
            Connect with verified professionals for legal, financial, consulting, and educational services
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{
        padding: "28px",
        background: C.navyLight,
        borderBottom: `1px solid ${C.border}`
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            display: "flex",
            gap: "12px",
            marginBottom: "20px",
            flexWrap: "wrap"
          }}>
            <input
              type="text"
              placeholder="Search professionals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: "1",
                minWidth: "200px",
                padding: "12px 16px",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
                color: C.textMain,
                fontSize: "14px"
              }}
            />
            <input
              type="text"
              placeholder="Location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              style={{
                width: "200px",
                padding: "12px 16px",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
                color: C.textMain,
                fontSize: "14px"
              }}
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: "12px 20px",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
                color: C.textMain,
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span>Filters</span>
              <span>{showFilters ? "▲" : "▼"}</span>
            </button>
          </div>

          {showFilters && (
            <div style={{
              background: C.surface,
              padding: "20px",
              borderRadius: "8px",
              border: `1px solid ${C.border}`,
              display: "flex",
              gap: "20px",
              flexWrap: "wrap"
            }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: C.textDim, marginBottom: "8px" }}>
                  Hourly Rate (KES)
                </label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                    style={{
                      width: "100px",
                      padding: "8px 12px",
                      background: C.navy,
                      border: `1px solid ${C.border}`,
                      borderRadius: "6px",
                      color: C.textMain,
                      fontSize: "14px"
                    }}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                    style={{
                      width: "100px",
                      padding: "8px 12px",
                      background: C.navy,
                      border: `1px solid ${C.border}`,
                      borderRadius: "6px",
                      color: C.textMain,
                      fontSize: "14px"
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: C.textDim, marginBottom: "8px" }}>
                  Specialization
                </label>
                <select
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  style={{
                    width: "200px",
                    padding: "8px 12px",
                    background: C.navy,
                    border: `1px solid ${C.border}`,
                    borderRadius: "6px",
                    color: C.textMain,
                    fontSize: "14px"
                  }}
                >
                  <option value="">All Specializations</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: C.textDim, marginBottom: "8px" }}>
                  Minimum Experience (years)
                </label>
                <input
                  type="number"
                  placeholder="Years"
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  style={{
                    width: "120px",
                    padding: "8px 12px",
                    background: C.navy,
                    border: `1px solid ${C.border}`,
                    borderRadius: "6px",
                    color: C.textMain,
                    fontSize: "14px"
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="verified"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                <label htmlFor="verified" style={{ fontSize: "14px", color: C.textMain, cursor: "pointer" }}>
                  Verified Only
                </label>
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "8px",
            marginTop: "20px"
          }}>
            <button
              onClick={() => setSelectedCategory("all")}
              style={{
                padding: "10px 20px",
                background: selectedCategory === "all" ? C.gold : C.surface,
                border: selectedCategory === "all" ? "none" : `1px solid ${C.border}`,
                borderRadius: "20px",
                color: selectedCategory === "all" ? C.navy : C.textMain,
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s"
              }}
            >
              All Services
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: "10px 20px",
                  background: selectedCategory === cat.id ? C.gold : C.surface,
                  border: selectedCategory === cat.id ? "none" : `1px solid ${C.border}`,
                  borderRadius: "20px",
                  color: selectedCategory === cat.id ? C.navy : C.textMain,
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div style={{ padding: "40px 28px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <div style={{ fontSize: "24px", marginBottom: "16px" }}>Loading professionals...</div>
            </div>
          ) : filteredServices.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
              <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>No professionals found</h3>
              <p style={{ color: C.textDim }}>
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "20px", color: C.textDim }}>
                Showing {filteredServices.length} professionals
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "24px"
              }}>
                {filteredServices.map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Become a Professional CTA */}
      {user && user.role !== 'admin' && (
        <div style={{
          background: `linear-gradient(135deg, ${C.navyLight} 0%, ${C.navy} 100%)`,
          padding: "60px 28px",
          textAlign: "center",
          borderTop: `1px solid ${C.border}`
        }}>
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h2 style={{
              fontSize: "28px",
              fontWeight: "700",
              marginBottom: "16px",
              color: C.textMain
            }}>
              Are you a professional?
            </h2>
            <p style={{
              fontSize: "16px",
              color: C.textMid,
              marginBottom: "24px",
              lineHeight: "1.6"
            }}>
              Join our platform and connect with clients seeking your expertise
            </p>
            <button
              onClick={() => navigate("/professional-services/register")}
              style={{
                background: C.gold,
                color: C.navy,
                border: "none",
                padding: "14px 32px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              Register as Professional
            </button>
          </div>
        </div>
      )}
    </div>
  );
}