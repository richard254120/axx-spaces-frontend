import { useState, useRef, useEffect } from "react";
import { kenyanUniversities, searchUniversities } from "../data/kenyanUniversities";

const C = {
  navy: "#0B2140",
  navyLight: "#132d52",
  gold: "#C9A84C",
  textMain: "#f0ece4",
  textDim: "#8a9bb5",
  border: "rgba(201,168,76,0.25)",
};

export default function UniversityPicker({
  value,
  onChange,
  required = false,
  label = "Nearby University",
  hint,
}) {
  const [query, setQuery] = useState(value?.name || "");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    setQuery(value?.name || "");
  }, [value?.id, value?.name]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const results = query.trim()
    ? searchUniversities(query)
    : kenyanUniversities.slice(0, 12);

  const pick = (uni) => {
    onChange(uni);
    setQuery(uni.name);
    setOpen(false);
  };

  const clear = () => {
    onChange(null);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <label style={styles.label}>
        {label} {required && "*"}
      </label>
      <div style={styles.inputWrap}>
        <span style={styles.icon}>🏛️</span>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value.trim()) onChange(null);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search university (e.g. JKUAT, Kenyatta, Moi)..."
          style={styles.input}
          required={required && !value?.id}
        />
        {value?.id && (
          <button type="button" onClick={clear} style={styles.clearBtn} aria-label="Clear">
            ✕
          </button>
        )}
      </div>

      {value?.id && (
        <div style={styles.selectedChip}>
          <span>{value.name}</span>
          <span style={{ ...styles.chipMeta, display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>{value.location}, {value.county}</span>
          </span>
        </div>
      )}

      {open && results.length > 0 && (
        <ul style={styles.dropdown}>
          {results.map((uni) => (
            <li key={uni.id}>
              <button
                type="button"
                style={{
                  ...styles.option,
                  ...(value?.id === uni.id ? styles.optionActive : {}),
                }}
                onClick={() => pick(uni)}
              >
                <strong>{uni.name}</strong>
                <span style={styles.optionSub}>
                  {uni.location} · {uni.county} · {uni.code}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && results.length === 0 && (
        <div style={styles.empty}>No university found for &quot;{query}&quot;</div>
      )}

      {hint && <p style={styles.hint}>{hint}</p>}
    </div>
  );
}

const styles = {
  label: {
    display: "block",
    color: C.textMain,
    fontSize: "0.85rem",
    fontWeight: 600,
    marginBottom: "8px",
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: C.navyLight,
    border: `1px solid ${C.border}`,
    borderRadius: "10px",
    padding: "0 12px",
  },
  icon: { fontSize: "1.1rem" },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: C.textMain,
    fontSize: "0.95rem",
    padding: "12px 0",
    fontFamily: "'DM Sans', sans-serif",
  },
  clearBtn: {
    background: "transparent",
    border: "none",
    color: C.textDim,
    cursor: "pointer",
    fontSize: "0.9rem",
    padding: "4px",
  },
  selectedChip: {
    marginTop: "10px",
    padding: "10px 14px",
    background: "rgba(201,168,76,0.12)",
    border: `1px solid ${C.gold}`,
    borderRadius: "8px",
    color: C.textMain,
    fontSize: "0.85rem",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  chipMeta: { color: C.textDim, fontSize: "0.8rem" },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    margin: "6px 0 0",
    padding: "6px 0",
    listStyle: "none",
    background: C.navy,
    border: `1px solid ${C.border}`,
    borderRadius: "10px",
    maxHeight: "260px",
    overflowY: "auto",
    zIndex: 50,
    boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
  },
  option: {
    width: "100%",
    textAlign: "left",
    background: "transparent",
    border: "none",
    color: C.textMain,
    padding: "10px 14px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    fontFamily: "'DM Sans', sans-serif",
  },
  optionActive: { background: "rgba(201,168,76,0.15)" },
  optionSub: { color: C.textDim, fontSize: "0.78rem" },
  empty: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: "6px",
    padding: "12px",
    background: C.navy,
    border: `1px solid ${C.border}`,
    borderRadius: "10px",
    color: C.textDim,
    fontSize: "0.85rem",
    zIndex: 50,
  },
  hint: {
    marginTop: "8px",
    fontSize: "0.78rem",
    color: C.textDim,
    lineHeight: 1.5,
  },
};
