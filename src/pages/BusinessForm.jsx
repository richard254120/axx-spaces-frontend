import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";
import PhoneInput from "../components/PhoneInput";

/* ── Multi-select dropdown component ── */
function MultiSelectDropdown({ options, selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div style={styles.multiSelectContainer} ref={dropdownRef}>
      <div
        style={styles.multiSelectButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={styles.selectedCategoriesDisplay}>
          {selected.length === 0 ? (
            <span style={styles.multiSelectButtonPlaceholder}>Select categories...</span>
          ) : (
            selected.map(cat => (
              <span key={cat} style={styles.selectedCategoryTag}>{cat}</span>
            ))
          )}
        </div>
        <span style={{
          ...styles.dropdownArrow,
          ...(isOpen ? styles.dropdownArrowOpen : {})
        }}>
          ▼
        </span>
      </div>

      {isOpen && (
        <div style={styles.multiSelectDropdown}>
          {options.map(option => (
            <div
              key={option}
              style={{
                ...styles.multiSelectOption,
                ...(selected.includes(option) ? styles.multiSelectOptionSelected : {}),
                ...(hoveredOption === option ? styles.multiSelectOptionHover : {}),
              }}
              onClick={() => toggleOption(option)}
              onMouseEnter={() => setHoveredOption(option)}
              onMouseLeave={() => setHoveredOption(null)}
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
                style={styles.multiSelectCheckbox}
                onClick={(e) => e.stopPropagation()}
              />
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "40px 20px",
    color: "#f1f5f9",
    fontFamily: "'DM Sans', sans-serif",
  },
  form: {
    maxWidth: "900px",
    margin: "0 auto",
    background: "rgba(30, 41, 59, 0.8)",
    borderRadius: "20px",
    padding: "40px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  title: {
    fontSize: "32px",
    fontWeight: 800,
    color: "#60a5fa",
    marginBottom: "30px",
    textAlign: "center",
  },
  section: {
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#60a5fa",
    marginBottom: "15px",
    paddingBottom: "10px",
    borderBottom: "2px solid #60a5fa",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#cbd5e1",
    marginBottom: "8px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "16px",
    marginBottom: "15px",
    transition: "border-color 0.3s",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "16px",
    marginBottom: "15px",
    minHeight: "120px",
    resize: "vertical",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "16px",
    marginBottom: "15px",
    boxSizing: "border-box",
  },
  checkboxGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "15px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  checkboxLabelSelected: {
    background: "#60a5fa",
    color: "#0f172a",
    border: "1px solid #60a5fa",
  },
  /* ── Multi-select dropdown styles ── */
  multiSelectContainer: {
    position: "relative",
    marginBottom: "15px",
  },
  multiSelectButton: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: "48px",
    boxSizing: "border-box",
  },
  multiSelectButtonPlaceholder: {
    color: "#94a3b8",
  },
  multiSelectDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "rgba(30, 41, 59, 0.95)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    marginTop: "8px",
    maxHeight: "300px",
    overflowY: "auto",
    zIndex: 1000,
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
  },
  multiSelectOption: {
    padding: "12px 16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "background 0.2s",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  multiSelectOptionHover: {
    background: "rgba(96, 165, 250, 0.1)",
  },
  multiSelectOptionSelected: {
    background: "rgba(96, 165, 250, 0.2)",
  },
  multiSelectCheckbox: {
    width: "18px",
    height: "18px",
    accentColor: "#60a5fa",
  },
  selectedCategoriesDisplay: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    maxWidth: "calc(100% - 30px)",
  },
  selectedCategoryTag: {
    background: "#60a5fa",
    color: "#0f172a",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: 600,
  },
  dropdownArrow: {
    transition: "transform 0.3s",
  },
  dropdownArrowOpen: {
    transform: "rotate(180deg)",
  },
  /* ── Upload progress styles ── */
  uploadProgressContainer: {
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(96, 165, 250, 0.3)",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "16px",
  },
  uploadProgressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  uploadProgressTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#60a5fa",
  },
  uploadProgressCount: {
    fontSize: "13px",
    color: "#94a3b8",
  },
  uploadProgressBar: {
    height: "8px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "8px",
  },
  uploadProgressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #60a5fa, #3b82f6)",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  },
  uploadProgressText: {
    fontSize: "12px",
    color: "#94a3b8",
    textAlign: "center",
  },
  button: {
    width: "100%",
    padding: "16px",
    background: "#60a5fa",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    fontSize: "18px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "opacity 0.3s",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  error: {
    background: "rgba(239, 68, 68, 0.2)",
    border: "1px solid #ef4444",
    color: "#ef4444",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  success: {
    background: "rgba(34, 197, 94, 0.2)",
    border: "1px solid #22c55e",
    color: "#22c55e",
    padding: "16px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "15px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  instructions: {
    background: "rgba(251, 191, 36, 0.1)",
    border: "1px solid #fbbf24",
    borderRadius: "15px",
    padding: "20px",
    marginBottom: "30px",
  },
  instructionsTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#fbbf24",
    marginBottom: "15px",
  },
  instructionsList: {
    margin: 0,
    paddingLeft: "20px",
    color: "#cbd5e1",
    lineHeight: "1.8",
  },
  redirectBar: {
    marginTop: "12px",
    background: "rgba(56,189,248,0.08)",
    border: "1px solid rgba(56,189,248,0.25)",
    borderRadius: "10px",
    padding: "10px 16px",
    fontSize: "13px",
    color: "#38bdf8",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  /* ── Product section styles ── */
  productFormBox: {
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(96, 165, 250, 0.2)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
  },
  productFormTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#60a5fa",
    marginBottom: "14px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  addProductBtn: {
    width: "100%",
    padding: "13px",
    background: "rgba(96, 165, 250, 0.15)",
    color: "#60a5fa",
    border: "1px solid rgba(96, 165, 250, 0.4)",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    marginTop: "4px",
  },
  productCard: {
    padding: "12px",
    background: "rgba(15, 23, 42, 0.5)",
    borderRadius: "10px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  productCardLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
    minWidth: 0,
  },
  productThumb: {
    width: "54px",
    height: "54px",
    objectFit: "cover",
    borderRadius: "8px",
    flexShrink: 0,
    border: "1px solid rgba(255,255,255,0.1)",
  },
  productThumbPlaceholder: {
    width: "54px",
    height: "54px",
    borderRadius: "8px",
    background: "rgba(96,165,250,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    flexShrink: 0,
    border: "1px solid rgba(96,165,250,0.2)",
  },
  productName: {
    fontWeight: 700,
    fontSize: "14px",
    color: "#f1f5f9",
    marginBottom: "2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  productMeta: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  removeBtn: {
    padding: "6px 14px",
    background: "rgba(239,68,68,0.15)",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    flexShrink: 0,
    marginLeft: "10px",
  },
  /* ── Progress indicator styles ── */
  progressContainer: {
    marginBottom: "40px",
  },
  progressSteps: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    position: "relative",
  },
  progressLine: {
    position: "absolute",
    top: "50%",
    left: "0",
    right: "0",
    height: "2px",
    background: "rgba(255, 255, 255, 0.1)",
    transform: "translateY(-50%)",
    zIndex: "0",
  },
  progressLineFilled: {
    position: "absolute",
    top: "50%",
    left: "0",
    height: "2px",
    background: "#60a5fa",
    transform: "translateY(-50%)",
    zIndex: "0",
    transition: "width 0.3s ease",
  },
  step: {
    position: "relative",
    zIndex: "1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  stepCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "rgba(15, 23, 42, 0.8)",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: 700,
    color: "#94a3b8",
    transition: "all 0.3s",
  },
  stepCircleActive: {
    background: "#60a5fa",
    borderColor: "#60a5fa",
    color: "#0f172a",
  },
  stepCircleCompleted: {
    background: "#22c55e",
    borderColor: "#22c55e",
    color: "white",
  },
  stepLabel: {
    marginTop: "8px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#94a3b8",
    transition: "all 0.3s",
  },
  stepLabelActive: {
    color: "#60a5fa",
  },
  stepLabelCompleted: {
    color: "#22c55e",
  },
  navigationButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "30px",
  },
  backButton: {
    flex: 1,
    padding: "16px",
    background: "rgba(255, 255, 255, 0.1)",
    color: "#f1f5f9",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.3s",
  },
  nextButton: {
    flex: 1,
    padding: "16px",
    background: "#60a5fa",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.3s",
  },
  reviewSection: {
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
  },
  reviewTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#60a5fa",
    marginBottom: "15px",
  },
  reviewItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  reviewLabel: {
    color: "#94a3b8",
    fontSize: "14px",
  },
  reviewValue: {
    color: "#f1f5f9",
    fontSize: "14px",
    fontWeight: 600,
    textAlign: "right",
  },
};

const BUSINESS_CATEGORIES = [
  "Restaurants", "Retail", "Services", "Technology", "Healthcare", "Education",
  "Entertainment", "Professional Services", "Manufacturing", "Agriculture",
  "Construction", "Transportation", "Fashions", "Beauty & Wellness", "Automotive",
  "Real Estate", "Financial Services", "Hospitality", "Sports & Fitness",
  "Arts & Crafts", "Food & Beverage", "Home Services", "Legal Services",
  "Media & Communications", "Non-Profit", "Pet Services", "Travel & Tourism",
  "Wholesale", "E-commerce", "Other",
];

const KENYA_COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta",
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka Nithi",
  "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga",
  "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia",
  "Uasin Gishu", "Elgeyo Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru",
  "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma",
  "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi City",
];

export default function BusinessForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categories: [],
    // Essential fields
    location: { county: "", town: "", address: "", coordinates: { lat: "", lng: "" } },
    contact: { phone: "", email: "", website: "" },
    // Optional fields that can be updated later in dashboard
    yearEstablished: "",
    employeeCount: "",
    priceRange: "",
    submitterName: "",
    socialMedia: { facebook: "", instagram: "", twitter: "", linkedin: "", tiktok: "", whatsapp: "" },
    images: [],
    logo: "",
    products: [],
    pricelist: { url: "", name: "" },
  });

  /* ── FIX 1: Controlled product form state (replaces uncontrolled DOM inputs) ── */
  /*
   * KEY FIX: formDataRef always holds the LATEST formData.
   * handleSubmit reads from the ref so it never uses a stale closure —
   * this is what caused newly-added products to be missing from the PUT.
   */
  const formDataRef = useRef(formData);
  useEffect(() => { formDataRef.current = formData; }, [formData]);

  const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "", category: "", imageUrl: "" });
  const [productImageFile, setProductImageFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [uploading, setUploading] = useState({ logo: false, photos: false, product: false, pricelist: false });
  const [businessPhotos, setBusinessPhotos] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState({ photos: 0, current: 0, total: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  const [productUploadCount, setProductUploadCount] = useState(0);

  const STEPS = [
    { id: 1, title: "Basic Info" },
    { id: 2, title: "Location" },
    { id: 3, title: "Contact" },
    { id: 4, title: "Logo & Photos" },
    { id: 5, title: "Products" },
    { id: 6, title: "Pricelist" },
    { id: 7, title: "Review" },
  ];

  /* ── Load existing business when editing ── */
  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const res = await API.get(`/business/${id}`);
        const biz = res.data.business;
        setFormData(biz);
        if (biz.images?.length) {
          setBusinessPhotos(biz.images);
        }
      } catch {
        setError("Failed to load business");
      }
    };

    if (isEditing) loadBusiness();
  }, [id, isEditing]);

  /* ── Countdown timer after successful edit ── */
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      navigate("/axxbiashara", { state: { refresh: true } });
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* ── Image compression helper ── */
  const compressImage = (file, maxWidth = 1200, maxHeight = 900, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
            },
            'image/jpeg',
            quality
          );
        };
      };
    });
  };

  /* ── Upload handlers ── */
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setLogoPreview(localUrl);
    setUploading(prev => ({ ...prev, logo: true }));

    try {
      const compressedFile = await compressImage(file, 400, 400, 0.7);
      const fd = new FormData();
      fd.append("logo", compressedFile);
      const res = await API.post("/uploads/logo", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setFormData(prev => ({ ...prev, logo: res.data.url }));
    } catch {
      setError("Failed to upload logo");
      setLogoPreview("");
    } finally {
      setUploading(prev => ({ ...prev, logo: false }));
      try {
        URL.revokeObjectURL(localUrl);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const uploadProductImage = async (file) => {
    if (!file) return "";
    setProductUploadCount(prev => prev + 1);
    setUploading(prev => ({ ...prev, product: true }));
    try {
      const compressedFile = await compressImage(file, 500, 500, 0.7);
      const fd = new FormData();
      fd.append("image", compressedFile);
      const res = await API.post("/uploads/product-image", fd, { headers: { "Content-Type": "multipart/form-data" } });
      return res.data.url || "";
    } catch {
      setError("Failed to upload product image");
      return "";
    } finally {
      setProductUploadCount(prev => {
        const nextVal = Math.max(0, prev - 1);
        if (nextVal === 0) {
          setUploading(u => ({ ...u, product: false }));
        }
        return nextVal;
      });
    }
  };

  const handlePricelistUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(prev => ({ ...prev, pricelist: true }));
    const fd = new FormData();
    fd.append("pricelist", file);
    try {
      const res = await API.post("/uploads/pricelist", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setFormData(prev => ({
        ...prev,
        pricelist: { ...prev.pricelist, url: res.data.url, publicId: res.data.publicId, name: res.data.originalName || file.name },
      }));
    } catch {
      setError("Failed to upload pricelist");
    } finally {
      setUploading(prev => ({ ...prev, pricelist: false }));
    }
  };

  const handleBusinessPhotosUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (businessPhotos.length + files.length > 30) {
      setError("You can upload a maximum of 30 photos");
      return;
    }

    // 1. Create local URLs and display them instantly
    const localUrls = files.map(file => URL.createObjectURL(file));
    setBusinessPhotos(prev => [...prev, ...localUrls]);

    setIsUploading(true);
    setUploadProgress({ photos: 0, current: 0, total: files.length });
    setUploading(prev => ({ ...prev, photos: true }));

    try {
      // 2. Compress files in parallel with optimized resolution and quality
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file, 1200, 900, 0.7))
      );

      // 3. Prepare FormData for single-request batch upload
      const fd = new FormData();
      compressedFiles.forEach(file => {
        fd.append("photos", file);
      });

      // 4. Perform batch upload to /uploads/business-photos (plural)
      const res = await API.post("/uploads/business-photos", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress({
            photos: percentCompleted,
            current: files.length,
            total: files.length,
          });
        }
      });

      const uploadedUrls = res.data.urls || [];

      if (uploadedUrls.length === 0) {
        throw new Error("No URLs returned from upload");
      }

      // 5. Replace local blob URLs in businessPhotos preview list with Cloudinary URLs
      setBusinessPhotos(prev => {
        const updated = [...prev];
        let remoteIndex = 0;
        for (let i = 0; i < updated.length; i++) {
          if (updated[i].startsWith("blob:")) {
            if (remoteIndex < uploadedUrls.length) {
              updated[i] = uploadedUrls[remoteIndex++];
            }
          }
        }
        return updated;
      });

      // 6. Update formData.images (excluding any temporary blobs, appending Cloudinary URLs)
      setFormData(prev => {
        const currentImages = (prev.images || []).filter(url => !url.startsWith("blob:"));
        return {
          ...prev,
          images: [...currentImages, ...uploadedUrls]
        };
      });

      setSuccess(`${uploadedUrls.length} photo(s) uploaded successfully!`);
      setTimeout(() => setSuccess(""), 3000);

      // Clean up local URLs
      localUrls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          console.error("Revoke error:", e);
        }
      });
    } catch (error) {
      setError("Failed to upload photos. Please try again.");
      console.error("Upload error:", error);

      // Remove the temporary local blob URLs on error
      setBusinessPhotos(prev => prev.filter(url => !url.startsWith("blob:")));
      setFormData(prev => ({
        ...prev,
        images: (prev.images || []).filter(url => !url.startsWith("blob:"))
      }));
    } finally {
      setUploading(prev => ({ ...prev, photos: false }));
      setIsUploading(false);
      setUploadProgress({ photos: 0, current: 0, total: 0 });
    }
  };

  const removePhoto = (index) => {
    setBusinessPhotos(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleAddProduct = () => {
    if (!newProduct.name.trim()) {
      setError("Product name is required");
      return;
    }

    // 1. Generate local preview URL instantly
    const localUrl = productImageFile ? URL.createObjectURL(productImageFile) : "";
    const tempIndex = formData.products.length;

    // 2. Add product to state immediately using the local preview URL
    const productToAdd = {
      name: newProduct.name.trim(),
      description: newProduct.description.trim(),
      price: newProduct.price ? parseFloat(newProduct.price) : 0,
      category: newProduct.category.trim(),
      imageUrl: localUrl,
    };

    setFormData(prev => ({
      ...prev,
      products: [...prev.products, productToAdd],
    }));

    // 3. Clear new product input fields instantly
    setNewProduct({ name: "", description: "", price: "", category: "", imageUrl: "" });
    const currentFile = productImageFile;
    setProductImageFile(null);

    // 4. Perform upload in the background if a file was selected
    if (currentFile) {
      uploadProductImage(currentFile).then(uploadedUrl => {
        setFormData(prev => {
          const updatedProducts = [...prev.products];
          if (updatedProducts[tempIndex]) {
            updatedProducts[tempIndex].imageUrl = uploadedUrl;
          }
          return { ...prev, products: updatedProducts };
        });
        try {
          URL.revokeObjectURL(localUrl);
        } catch (e) {
          console.error(e);
        }
      }).catch(err => {
        console.error("Background product upload error:", err);
        setFormData(prev => {
          const updatedProducts = [...prev.products];
          if (updatedProducts[tempIndex]) {
            updatedProducts[tempIndex].imageUrl = "";
          }
          return { ...prev, products: updatedProducts };
        });
        try {
          URL.revokeObjectURL(localUrl);
        } catch (e) {
          console.error(e);
        }
      });
    }
  };

  const handleRemoveProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  /* ── Step navigation ── */
  const validateStep = (step) => {
    // Prevent navigation if uploads are still active
    const activeUpload = isUploading || uploading.logo || uploading.photos || uploading.product || uploading.pricelist || productUploadCount > 0;
    if (activeUpload) {
      setError("Please wait for all uploads to complete before proceeding");
      return false;
    }

    switch (step) {
      case 1:
        return formData.name && formData.description && formData.categories.length > 0 && formData.submitterName;
      case 2:
        return formData.location.county && formData.location.town;
      case 3:
        return formData.contact.phone;
      case 4:
        return true; // Logo and photos are optional
      case 5:
        return true; // Products are optional
      case 6:
        return true; // Pricelist is optional
      case 7:
        return true; // Review step
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    } else {
      setError("Please fill in all required fields before proceeding");
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError("");
  };

  const handleStepClick = (step) => {
    if (step < currentStep || validateStep(currentStep)) {
      setCurrentStep(step);
      setError("");
    }
  };


  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if uploads are still active
    const activeUpload = isUploading || uploading.logo || uploading.photos || uploading.product || uploading.pricelist || productUploadCount > 0;
    if (activeUpload) {
      setError("Please wait for all uploads to complete before submitting");
      return;
    }

    // Validate that at least one image was uploaded if user attempted to upload
    if (businessPhotos.length === 0 && formData.images && formData.images.length > 0) {
      setError("Image upload failed. Please try uploading your photos again or remove them from the form.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const basePayload = formDataRef.current; // always latest, never stale
    
    // Clean optional fields to avoid sending empty strings for enums/numbers
    const payload = {
      ...basePayload,
      employeeCount: basePayload.employeeCount === "" ? undefined : basePayload.employeeCount,
      priceRange: basePayload.priceRange === "" ? undefined : basePayload.priceRange,
      yearEstablished: basePayload.yearEstablished === "" ? undefined : basePayload.yearEstablished,
    };

    if (payload.location) {
      payload.location = {
        ...payload.location,
        coordinates: payload.location.coordinates ? {
          lat: payload.location.coordinates.lat === "" ? undefined : payload.location.coordinates.lat,
          lng: payload.location.coordinates.lng === "" ? undefined : payload.location.coordinates.lng,
        } : undefined
      };
    }

    try {
      if (isEditing) {
        await API.put(`/business/${id}`, payload);
        setSuccess("Business updated successfully! Redirecting to directory…");
        setCountdown(3);
      } else {
        const res = await API.post("/business", payload);
        setSuccess(res.data.message || "Business submitted for review!");
        setTimeout(() => navigate("/business-dashboard"), 2000);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please log in to add a business");
        setTimeout(() => navigate("/business-login"), 2000);
      } else {
        setError(err.response?.data?.error || "Failed to save business");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h1 style={styles.title}>
          {isEditing ? "✏️ Edit Business" : "➕ Add Business"}
        </h1>

        {!isEditing && (
          <div style={styles.instructions}>
            <h3 style={styles.instructionsTitle}>📋 Instructions</h3>
            <ul style={styles.instructionsList}>
              <li>Fill in your business details to list on AxxBiashara</li>
              <li>Select multiple categories that describe your business</li>
              <li>Social media links can be added later in your dashboard</li>
              <li>Your business will be reviewed and approved by admin before appearing</li>
            </ul>
          </div>
        )}

        {error && <div style={styles.error}>{error}</div>}

        {/* ── PROGRESS INDICATOR ── */}
        {!isEditing && (
          <div style={styles.progressContainer}>
            <div style={styles.progressSteps}>
              <div style={styles.progressLine}></div>
              <div style={{
                ...styles.progressLineFilled,
                width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
              }}></div>
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  style={styles.step}
                  onClick={() => handleStepClick(step.id)}
                >
                  <div style={{
                    ...styles.stepCircle,
                    ...(currentStep === step.id ? styles.stepCircleActive : {}),
                    ...(currentStep > step.id ? styles.stepCircleCompleted : {}),
                  }}>
                    {currentStep > step.id ? "✓" : step.id}
                  </div>
                  <div style={{
                    ...styles.stepLabel,
                    ...(currentStep === step.id ? styles.stepLabelActive : {}),
                    ...(currentStep > step.id ? styles.stepLabelCompleted : {}),
                  }}>
                    {step.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {success && (
          <div>
            <div style={styles.success}>
              <span style={{ fontSize: "20px" }}>✅</span>
              {success}
            </div>
            {isEditing && countdown !== null && (
              <div style={styles.redirectBar}>
                <span>🔄</span>
                Taking you to the business directory in{" "}
                <strong style={{ color: "#f1f5f9", margin: "0 4px" }}>{countdown}</strong>
                {" "}second{countdown !== 1 ? "s" : ""}…
                <button
                  type="button"
                  onClick={() => navigate("/axxbiashara", { state: { refresh: true } })}
                  style={{
                    marginLeft: "auto", background: "none", border: "none",
                    color: "#38bdf8", cursor: "pointer", fontSize: "13px",
                    fontWeight: 700, textDecoration: "underline",
                  }}
                >
                  Go now
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 1: BASIC INFORMATION ── */}
        {(!isEditing && currentStep === 1) || isEditing ? (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Basic Information</h2>

            <label style={styles.label}>Your Name or Company Name *</label>
            <input
              type="text"
              style={styles.input}
              value={formData.submitterName}
              onChange={e => setFormData(prev => ({ ...prev, submitterName: e.target.value }))}
              required
              placeholder="Enter your name or company name"
            />

            <label style={styles.label}>Business Name *</label>
            <input
              type="text"
              style={styles.input}
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="Enter your business name"
            />

            <label style={styles.label}>Description *</label>
            <textarea
              style={styles.textarea}
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              placeholder="Describe your business, products, and services in detail"
            />

            <label style={styles.label}>Year Established</label>
            <input
              type="number"
              style={styles.input}
              value={formData.yearEstablished || ""}
              onChange={e => setFormData(prev => ({ ...prev, yearEstablished: e.target.value }))}
              placeholder="e.g., 2015"
              min="1900"
              max={new Date().getFullYear()}
            />

            <label style={styles.label}>Number of Employees</label>
            <select
              style={styles.select}
              value={formData.employeeCount || ""}
              onChange={e => setFormData(prev => ({ ...prev, employeeCount: e.target.value }))}
            >
              <option value="">Select size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>

            <label style={styles.label}>Price Range</label>
            <select
              style={styles.select}
              value={formData.priceRange || ""}
              onChange={e => setFormData(prev => ({ ...prev, priceRange: e.target.value }))}
            >
              <option value="">Select price range</option>
              <option value="$">$ - Budget friendly</option>
              <option value="$$">$$ - Moderate</option>
              <option value="$$$">$$$ - Expensive</option>
              <option value="$$$$">$$$$ - Premium</option>
            </select>

            <label style={styles.label}>Categories (Select multiple) *</label>
            <MultiSelectDropdown
              options={BUSINESS_CATEGORIES}
              selected={formData.categories}
              onChange={(categories) => setFormData(prev => ({ ...prev, categories }))}
            />
          </div>
        ) : null}

        {/* ── STEP 2: LOCATION ── */}
        {(!isEditing && currentStep === 2) || isEditing ? (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Location</h2>

            <label style={styles.label}>County *</label>
            <select
              style={styles.select}
              value={formData.location.county}
              onChange={e => setFormData(prev => ({ ...prev, location: { ...prev.location, county: e.target.value } }))}
              required
            >
              <option value="">Select County</option>
              {KENYA_COUNTIES.map(county => <option key={county} value={county}>{county}</option>)}
            </select>

            <label style={styles.label}>Town/City *</label>
            <input
              type="text"
              style={styles.input}
              value={formData.location.town}
              onChange={e => setFormData(prev => ({ ...prev, location: { ...prev.location, town: e.target.value } }))}
              required
            />

            <label style={styles.label}>Address</label>
            <input
              type="text"
              style={styles.input}
              value={formData.location.address}
              onChange={e => setFormData(prev => ({ ...prev, location: { ...prev.location, address: e.target.value } }))}
            />

            <label style={styles.label}>GPS Latitude (optional)</label>
            <input
              type="number"
              step="any"
              style={styles.input}
              value={formData.location.coordinates?.lat || ""}
              onChange={e => setFormData(prev => ({ ...prev, location: { ...prev.location, coordinates: { ...prev.location.coordinates, lat: e.target.value } } }))}
              placeholder="e.g. -1.286389"
            />

            <label style={styles.label}>GPS Longitude (optional)</label>
            <input
              type="number"
              step="any"
              style={styles.input}
              value={formData.location.coordinates?.lng || ""}
              onChange={e => setFormData(prev => ({ ...prev, location: { ...prev.location, coordinates: { ...prev.location.coordinates, lng: e.target.value } } }))}
              placeholder="e.g. 36.817223"
            />
          </div>
        ) : null}

        {/* ── STEP 3: CONTACT ── */}
        {(!isEditing && currentStep === 3) || isEditing ? (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Contact Information</h2>

            <label style={styles.label}>Phone *</label>
            <PhoneInput
              style={styles.input}
              value={formData.contact.phone}
              onChange={value => setFormData(prev => ({ ...prev, contact: { ...prev.contact, phone: value } }))}
              required
            />

            <label style={styles.label}>Email</label>
            <input
              type="email"
              style={styles.input}
              value={formData.contact.email}
              onChange={e => setFormData(prev => ({ ...prev, contact: { ...prev.contact, email: e.target.value } }))}
            />

            <label style={styles.label}>Website (Optional)</label>
            <input
              type="url"
              style={styles.input}
              value={formData.contact.website}
              onChange={e => setFormData(prev => ({ ...prev, contact: { ...prev.contact, website: e.target.value } }))}
              placeholder="https://example.com"
            />

            <h2 style={{ ...styles.sectionTitle, marginTop: "30px" }}>Social Media Accounts</h2>
            <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "20px" }}>
              Add your social media links to help customers connect with your business
            </p>

            <label style={styles.label}>Facebook</label>
            <input
              type="url"
              style={styles.input}
              value={formData.socialMedia.facebook}
              onChange={e => setFormData(prev => ({ ...prev, socialMedia: { ...prev.socialMedia, facebook: e.target.value } }))}
              placeholder="https://facebook.com/yourbusiness"
            />

            <label style={styles.label}>Instagram</label>
            <input
              type="url"
              style={styles.input}
              value={formData.socialMedia.instagram}
              onChange={e => setFormData(prev => ({ ...prev, socialMedia: { ...prev.socialMedia, instagram: e.target.value } }))}
              placeholder="https://instagram.com/yourbusiness"
            />

            <label style={styles.label}>Twitter/X</label>
            <input
              type="url"
              style={styles.input}
              value={formData.socialMedia.twitter}
              onChange={e => setFormData(prev => ({ ...prev, socialMedia: { ...prev.socialMedia, twitter: e.target.value } }))}
              placeholder="https://twitter.com/yourbusiness"
            />

            <label style={styles.label}>LinkedIn</label>
            <input
              type="url"
              style={styles.input}
              value={formData.socialMedia.linkedin}
              onChange={e => setFormData(prev => ({ ...prev, socialMedia: { ...prev.socialMedia, linkedin: e.target.value } }))}
              placeholder="https://linkedin.com/company/yourbusiness"
            />

            <label style={styles.label}>TikTok</label>
            <input
              type="url"
              style={styles.input}
              value={formData.socialMedia.tiktok}
              onChange={e => setFormData(prev => ({ ...prev, socialMedia: { ...prev.socialMedia, tiktok: e.target.value } }))}
              placeholder="https://tiktok.com/@yourbusiness"
            />

            <label style={styles.label}>WhatsApp</label>
            <input
              type="url"
              style={styles.input}
              value={formData.socialMedia.whatsapp}
              onChange={e => setFormData(prev => ({ ...prev, socialMedia: { ...prev.socialMedia, whatsapp: e.target.value } }))}
              placeholder="https://wa.me/254XXXXXXXXXX"
            />
          </div>
        ) : null}

        {/* ── STEP 4: LOGO & PHOTOS ── */}
        {(!isEditing && currentStep === 4) || isEditing ? (
          <>
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Business Logo</h2>
              <label style={styles.label}>Upload Logo</label>
              <input
                type="file"
                style={styles.input}
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading.logo}
              />
              {(logoPreview || formData.logo) && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={logoPreview || formData.logo}
                    alt="Logo preview"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      opacity: logoPreview ? 0.6 : 1,
                      transition: "opacity 0.3s"
                    }}
                  />
                  {logoPreview ? (
                    <p style={{ fontSize: "12px", color: "#fbbf24", marginTop: "6px" }}>⚡ Uploading logo...</p>
                  ) : (
                    <p style={{ fontSize: "12px", color: "#4ade80", marginTop: "6px" }}>✅ Logo uploaded successfully</p>
                  )}
                </div>
              )}
            </div>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Business Photos (Up to 30)</h2>
              <label style={styles.label}>Upload Photos</label>
              <input
                type="file"
                style={styles.input}
                accept="image/*"
                multiple
                onChange={handleBusinessPhotosUpload}
                disabled={uploading.photos}
              />

              {isUploading && (
                <div style={styles.uploadProgressContainer}>
                  <div style={styles.uploadProgressHeader}>
                    <span style={styles.uploadProgressTitle}>Uploading Photos...</span>
                    <span style={styles.uploadProgressCount}>{uploadProgress.current} / {uploadProgress.total}</span>
                  </div>
                  <div style={styles.uploadProgressBar}>
                    <div style={{
                      ...styles.uploadProgressFill,
                      width: `${uploadProgress.photos}%`,
                    }} />
                  </div>
                  <div style={styles.uploadProgressText}>
                    {uploadProgress.photos}% complete
                  </div>
                </div>
              )}

              <p style={{ fontSize: "12px", color: "#94a3b8" }}>{businessPhotos.length} / 30 photos uploaded</p>
              {businessPhotos.length > 0 && (
                <div style={{
                  marginTop: "15px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: "10px",
                }}>
                  {businessPhotos.map((photo, index) => {
                    const isBlob = photo.startsWith("blob:");
                    return (
                      <div key={index} style={{ position: "relative" }}>
                        <img
                          src={photo}
                          alt={`Business photo ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            opacity: isBlob ? 0.6 : 1,
                            transition: "opacity 0.3s"
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => !isBlob && removePhoto(index)}
                          disabled={isBlob}
                          style={{
                            position: "absolute", top: "5px", right: "5px",
                            background: isBlob ? "#64748b" : "#ef4444", color: "white", border: "none",
                            borderRadius: "50%", width: "24px", height: "24px",
                            cursor: isBlob ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: "bold",
                            opacity: isBlob ? 0.5 : 1
                          }}
                        >×</button>
                        {isBlob && (
                          <div style={{
                            position: "absolute", bottom: "5px", left: "5px",
                            background: "rgba(15, 23, 42, 0.85)", color: "#60a5fa",
                            fontSize: "10px", padding: "2px 6px", borderRadius: "4px",
                            border: "1px solid rgba(96, 165, 250, 0.3)", fontWeight: "bold"
                          }}>
                            Uploading...
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : null}

        {/* ── STEP 5: PRODUCTS & SERVICES ── */}
        {(!isEditing && currentStep === 5) || isEditing ? (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Products & Services</h2>

            <div style={styles.productFormBox}>
              <p style={styles.productFormTitle}>➕ Add a Product or Service</p>

              <label style={styles.label}>Product / Service Name *</label>
              <input
                type="text"
                style={styles.input}
                placeholder="e.g. Beef Burger, Web Design Package"
                value={newProduct.name}
                onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
              />

              <label style={styles.label}>Description</label>
              <input
                type="text"
                style={styles.input}
                placeholder="Brief description of the product or service"
                value={newProduct.description}
                onChange={e => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
              />

              <label style={styles.label}>Price (KES)</label>
              <input
                type="number"
                style={styles.input}
                placeholder="e.g. 1500"
                value={newProduct.price}
                onChange={e => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                min="0"
              />

              <label style={styles.label}>Category</label>
              <input
                type="text"
                style={styles.input}
                placeholder="e.g. Food, Design, Consulting"
                value={newProduct.category}
                onChange={e => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
              />

              <label style={styles.label}>Product Image (Optional)</label>
              <input
                type="file"
                style={styles.input}
                accept="image/*"
                disabled={uploading.product}
                onChange={e => setProductImageFile(e.target.files[0] || null)}
              />
              {uploading.product && <p style={{ fontSize: "12px", color: "#fbbf24", marginBottom: "8px" }}>Uploading product image…</p>}
              {productImageFile && !uploading.product && (
                <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "10px" }}>
                  📎 {productImageFile.name} selected
                </p>
              )}

              <button
                type="button"
                style={styles.addProductBtn}
                onClick={handleAddProduct}
              >
                + Add Product / Service
              </button>
            </div>

            {formData.products.length > 0 && (
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#94a3b8", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {formData.products.length} {formData.products.length === 1 ? "Product" : "Products"} Added
                </p>
                {formData.products.map((product, index) => {
                  const isBlob = product.imageUrl && product.imageUrl.startsWith("blob:");
                  return (
                    <div key={index} style={styles.productCard}>
                      <div style={styles.productCardLeft}>
                        {product.imageUrl ? (
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              style={{
                                ...styles.productThumb,
                                opacity: isBlob ? 0.6 : 1
                              }}
                            />
                            {isBlob && (
                              <div style={{
                                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                                background: "rgba(15, 23, 42, 0.5)", display: "flex",
                                alignItems: "center", justifyContent: "center", borderRadius: "8px"
                              }}>
                                <span style={{ fontSize: "12px", color: "#60a5fa" }}>⏳</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={styles.productThumbPlaceholder}>🛍</div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={styles.productName}>{product.name}</div>
                          <div style={styles.productMeta}>
                            {product.price ? `KES ${Number(product.price).toLocaleString()}` : "No price set"}
                            {product.category ? ` · ${product.category}` : ""}
                            {isBlob && <span style={{ color: "#fbbf24", marginLeft: "8px", fontSize: "11px", fontWeight: "bold" }}>(Uploading...)</span>}
                          </div>
                          {product.description && (
                            <div style={{ ...styles.productMeta, marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "260px" }}>
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        style={styles.removeBtn}
                        onClick={() => handleRemoveProduct(index)}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {formData.products.length === 0 && (
              <p style={{ fontSize: "13px", color: "#475569", textAlign: "center", padding: "20px 0" }}>
                No products added yet. Use the form above to add your first product or service.
              </p>
            )}
          </div>
        ) : null}

        {/* ── STEP 6: PRICELIST ── */}
        {(!isEditing && currentStep === 6) || isEditing ? (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Pricelist / Menu</h2>
            <label style={styles.label}>Upload Pricelist/Menu</label>
            <input
              type="file"
              style={styles.input}
              accept=".pdf,.doc,.docx,.txt"
              onChange={handlePricelistUpload}
              disabled={uploading.pricelist}
            />
            {uploading.pricelist && <p style={{ fontSize: "12px", color: "#fbbf24", marginBottom: "8px" }}>Uploading pricelist...</p>}
            {formData.pricelist?.url && (
              <p style={{ fontSize: "12px", color: "#4ade80", marginTop: "8px" }}>
                ✅ Pricelist uploaded: {formData.pricelist.name}
              </p>
            )}
          </div>
        ) : null}

        {/* ── STEP 7: REVIEW ── */}
        {!isEditing && currentStep === 7 ? (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Review Your Business</h2>

            <div style={styles.reviewSection}>
              <p style={styles.reviewTitle}>Basic Information</p>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Business Name:</span>
                <span style={styles.reviewValue}>{formData.name}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Description:</span>
                <span style={styles.reviewValue}>{formData.description?.substring(0, 100)}...</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Categories:</span>
                <span style={styles.reviewValue}>{formData.categories.join(", ")}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Year Established:</span>
                <span style={styles.reviewValue}>{formData.yearEstablished || "Not specified"}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Employees:</span>
                <span style={styles.reviewValue}>{formData.employeeCount || "Not specified"}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Price Range:</span>
                <span style={styles.reviewValue}>{formData.priceRange || "Not specified"}</span>
              </div>
            </div>

            <div style={styles.reviewSection}>
              <p style={styles.reviewTitle}>Location</p>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>County:</span>
                <span style={styles.reviewValue}>{formData.location.county}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Town/City:</span>
                <span style={styles.reviewValue}>{formData.location.town}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Address:</span>
                <span style={styles.reviewValue}>{formData.location.address || "Not specified"}</span>
              </div>
            </div>

            <div style={styles.reviewSection}>
              <p style={styles.reviewTitle}>Contact</p>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Phone:</span>
                <span style={styles.reviewValue}>{formData.contact.phone}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Email:</span>
                <span style={styles.reviewValue}>{formData.contact.email || "Not specified"}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Website:</span>
                <span style={styles.reviewValue}>{formData.contact.website || "Not specified"}</span>
              </div>
            </div>

            <div style={styles.reviewSection}>
              <p style={styles.reviewTitle}>Social Media</p>
              {formData.socialMedia.facebook && (
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Facebook:</span>
                  <span style={styles.reviewValue}>✅ Added</span>
                </div>
              )}
              {formData.socialMedia.instagram && (
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Instagram:</span>
                  <span style={styles.reviewValue}>✅ Added</span>
                </div>
              )}
              {formData.socialMedia.twitter && (
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Twitter:</span>
                  <span style={styles.reviewValue}>✅ Added</span>
                </div>
              )}
              {formData.socialMedia.linkedin && (
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>LinkedIn:</span>
                  <span style={styles.reviewValue}>✅ Added</span>
                </div>
              )}
              {formData.socialMedia.tiktok && (
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>TikTok:</span>
                  <span style={styles.reviewValue}>✅ Added</span>
                </div>
              )}
              {formData.socialMedia.whatsapp && (
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>WhatsApp:</span>
                  <span style={styles.reviewValue}>✅ Added</span>
                </div>
              )}
              {!formData.socialMedia.facebook && !formData.socialMedia.instagram && !formData.socialMedia.twitter &&
                !formData.socialMedia.linkedin && !formData.socialMedia.tiktok && !formData.socialMedia.whatsapp && (
                  <div style={styles.reviewItem}>
                    <span style={styles.reviewLabel}>Social Media:</span>
                    <span style={styles.reviewValue}>Not specified</span>
                  </div>
                )}
            </div>

            <div style={styles.reviewSection}>
              <p style={styles.reviewTitle}>Additional Info</p>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Logo:</span>
                <span style={styles.reviewValue}>{formData.logo ? "✅ Uploaded" : "Not uploaded"}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Photos:</span>
                <span style={styles.reviewValue}>{businessPhotos.length} uploaded</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Products:</span>
                <span style={styles.reviewValue}>{formData.products.length} added</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Pricelist:</span>
                <span style={styles.reviewValue}>{formData.pricelist?.url ? "✅ Uploaded" : "Not uploaded"}</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* ── NAVIGATION BUTTONS (for multi-step form) ── */}
        {!isEditing && (
          <div style={styles.navigationButtons}>
            {currentStep > 1 && (
              <button
                type="button"
                style={styles.backButton}
                onClick={handleBack}
              >
                ← Back
              </button>
            )}
            {currentStep < STEPS.length ? (
              <button
                type="button"
                style={styles.nextButton}
                onClick={handleNext}
              >
                {currentStep === STEPS.length - 1 ? "Review" : "Next →"}
              </button>
            ) : (
              <button
                type="submit"
                style={{ ...styles.nextButton, ...(loading ? styles.buttonDisabled : {}) }}
                disabled={loading}
              >
                {loading ? "Submitting…" : "Submit Business"}
              </button>
            )}
          </div>
        )}

        {/* ── SUBMIT BUTTON (for editing mode) ── */}
        {isEditing && (
          <button
            type="submit"
            style={{ ...styles.button, ...(loading || countdown !== null ? styles.buttonDisabled : {}) }}
            disabled={loading || countdown !== null}
          >
            {loading
              ? "Saving…"
              : countdown !== null
                ? `Redirecting in ${countdown}s…`
                : "Update Business"}
          </button>
        )}
      </form>
    </div>
  );
}