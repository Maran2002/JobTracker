import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, RotateCcw, SlidersHorizontal, Check } from "lucide-react";

/**
 * FilterDrawer — reusable right-to-left slide-in filter panel.
 *
 * Props:
 *   isOpen    {boolean}   - controls visibility
 *   onClose   {function}  - called when backdrop or X is clicked
 *   filters   {object}    - current filter values (controlled)
 *   onChange  {function}  - (updatedFilters) => void, called on every field change
 *   onApply   {function}  - (filters) => void, called when "Apply Filters" is clicked
 *   onReset   {function}  - () => void, called when "Reset" is clicked
 *   config    {Array}     - array of field descriptors (see below)
 *   title     {string}    - drawer heading (default "Filters")
 *
 * Config item shape:
 *   { key, label, type, options?, placeholder? }
 *
 * Supported types:
 *   "multiselect" — pill-toggle checkboxes (options: string[])
 *   "select"      — native <select> dropdown (options: string[])
 *   "text"        — free-text input
 *   "date"        — date picker input
 */
const FilterDrawer = ({
  isOpen,
  onClose,
  filters = {},
  onChange,
  onApply,
  onReset,
  config = [],
  title = "Filters",
}) => {
  /* ── keyboard / scroll lock ── */
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  /* ── helpers ── */
  const handleMultiToggle = useCallback((key, value) => {
    const current = filters[key] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  }, [filters, onChange]);

  const handleFieldChange = useCallback((key, value) => {
    onChange({ ...filters, [key]: value });
  }, [filters, onChange]);

  /* active filter count (for badges) */
  const activeCount = Object.values(filters).filter((v) =>
    Array.isArray(v) ? v.length > 0 : v !== "" && v != null
  ).length;

  /* ── render — portal to document.body escapes all stacking contexts ── */
  return createPortal(
    <>
      {/* ── Backdrop ── */}
      <div
        className="filter-drawer-backdrop"
        onClick={onClose}
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none" }}
        aria-hidden="true"
      />

      {/* ── Panel ── */}
      <aside
        className="filter-drawer-panel"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="filter-drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <SlidersHorizontal size={16} color="var(--ct-primary)" />
            <span className="filter-drawer-title">{title}</span>
            {activeCount > 0 && (
              <span className="filter-drawer-count-badge">{activeCount}</span>
            )}
          </div>
          <button
            className="filter-drawer-close-btn"
            onClick={onClose}
            aria-label="Close filters"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="filter-drawer-body">
          {config.map((field) => (
            <div key={field.key} className="filter-drawer-field">
              <div className="filter-drawer-field-label">{field.label}</div>

              {/* multiselect pills */}
              {field.type === "multiselect" && (
                <div className="filter-drawer-pills">
                  {field.options.map((opt) => {
                    const active = (filters[field.key] || []).includes(opt);
                    return (
                      <button
                        key={opt}
                        className={`filter-pill${active ? " filter-pill--active" : ""}`}
                        onClick={() => handleMultiToggle(field.key, opt)}
                        type="button"
                      >
                        {active && <Check size={10} />}
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* text input */}
              {field.type === "text" && (
                <input
                  type="text"
                  className="filter-drawer-input"
                  value={filters[field.key] || ""}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder || `Filter by ${field.label.toLowerCase()}…`}
                />
              )}

              {/* date input */}
              {field.type === "date" && (
                <input
                  type="date"
                  className="filter-drawer-input filter-drawer-input--date"
                  value={filters[field.key] || ""}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                />
              )}

              {/* select dropdown */}
              {field.type === "select" && (
                <select
                  className="filter-drawer-input filter-drawer-input--select"
                  value={filters[field.key] || ""}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                >
                  <option value="">Any {field.label}</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="filter-drawer-footer">
          <button
            className="btn-ghost filter-drawer-footer-btn"
            onClick={onReset}
            type="button"
          >
            <RotateCcw size={13} /> Reset
          </button>
          <button
            className="btn-primary filter-drawer-footer-btn filter-drawer-footer-btn--apply"
            onClick={() => { onApply(filters); onClose(); }}
            type="button"
          >
            Apply Filters
            {activeCount > 0 && (
              <span className="filter-drawer-apply-badge">{activeCount}</span>
            )}
          </button>
        </div>
      </aside>
    </>,
    document.body
  );
};

export default FilterDrawer;
