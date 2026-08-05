"use client";

interface Category {
  label: string;
  value: string;
  count: number;
  icon: string;
}

interface PriceRange {
  label: string;
  value: string;
  min: number;
  max: number;
}

const CATEGORIES: Category[] = [
  { label: "All Products", value: "all", count: 6, icon: "🔭" },
  { label: "Telescopes", value: "telescope", count: 2, icon: "🔭" },
  { label: "Binoculars", value: "binocular", count: 1, icon: "👁" },
  { label: "Filters", value: "filter", count: 1, icon: "🌈" },
  { label: "Accessories", value: "accessories", count: 2, icon: "🧰" },
];

const PRICE_RANGES: PriceRange[] = [
  { label: "Under $100", value: "under-100", min: 0, max: 10000 },
  { label: "$100 – $300", value: "100-300", min: 10000, max: 30000 },
  { label: "$300+", value: "300-plus", min: 30000, max: Infinity },
];

interface SidebarProps {
  selectedCategory: string;
  selectedPrice: string;
  onCategoryChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onClear: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  selectedCategory,
  selectedPrice,
  onCategoryChange,
  onPriceChange,
  onClear,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const hasFilters = selectedCategory !== "all" || selectedPrice !== "";

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay${isOpen ? " open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`sidebar${isOpen ? " mobile-open" : ""}`}
        aria-label="Product filters"
      >
        <button
          className="sidebar-close-btn"
          type="button"
          onClick={onClose}
          aria-label="Close filters"
        >
          ×
        </button>
        {/* Categories */}
        <div className="sidebar-section">
          <p className="sidebar-section-title">Categories</p>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`filter-option${selectedCategory === cat.value ? " active" : ""}`}
              onClick={() => onCategoryChange(cat.value)}
              type="button"
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="filter-option-count">{cat.count}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-divider" />

        {/* Price Range */}
        <div className="sidebar-section">
          <p className="sidebar-section-title">Price Range</p>
          {PRICE_RANGES.map((range) => (
            <button
              key={range.value}
              className={`filter-option${selectedPrice === range.value ? " active" : ""}`}
              onClick={() =>
                onPriceChange(selectedPrice === range.value ? "" : range.value)
              }
              type="button"
            >
              <span>{range.label}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-divider" />

        {/* Rating (visual only) */}
        <div className="sidebar-section">
          <p className="sidebar-section-title">Rating</p>
          <div
            style={{
              padding: "8px 10px",
              fontSize: "14px",
              color: "var(--ink-2)",
            }}
          >
            <span style={{ color: "var(--gold)" }}>★★★★★</span> &amp; up
          </div>
          <div
            style={{
              padding: "8px 10px",
              fontSize: "14px",
              color: "var(--ink-2)",
            }}
          >
            <span style={{ color: "var(--gold)" }}>★★★★</span>☆ &amp; up
          </div>
        </div>

        {hasFilters && (
          <>
            <div className="sidebar-divider" />
            <button
              className="clear-filters-btn"
              onClick={onClear}
              type="button"
            >
              ✕ Clear All Filters
            </button>
          </>
        )}
      </aside>
    </>
  );
}

export { PRICE_RANGES };
