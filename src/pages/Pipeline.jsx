import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  SlidersHorizontal,
  MoreHorizontal,
  Clock,
  Plus,
  ExternalLink,
  GripVertical,
  Briefcase,
  MapPin,
  DollarSign,
  Star,
  Loader2,
  X,
} from "lucide-react";
import api from "../api/gateway";
import { toast } from "vibe-toast";
import FilterDrawer from "../components/FilterDrawer";
import AddInterviewModal from "../components/AddInterviewModal";
import { formatSalary } from "../utils/formatSalary";

/* ── Column config ───────────────────────────── */
const COLUMN_DEFS = [
  { id: "Applied", label: "Applied", accentColor: "#4f46e5", emoji: "📨" },
  { id: "Screening", label: "Screening", accentColor: "#06b6d4", emoji: "🔍" },
  {
    id: "Interviewing",
    label: "Interview",
    accentColor: "#10b981",
    emoji: "🎤",
  },
  { id: "Offer Received", label: "Offer", accentColor: "#f59e0b", emoji: "🏆" },
  { id: "Rejected", label: "Rejected", accentColor: "#ef4444", emoji: "❌" },
];

const PRIORITY_COLORS = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" };

/* ── Filter config ───────────────────────────── */
const PIPELINE_FILTER_CONFIG = [
  {
    key: "priority",
    label: "Priority",
    type: "multiselect",
    options: ["High", "Medium", "Low"],
  },
  {
    key: "jobType",
    label: "Job Type",
    type: "multiselect",
    options: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"],
  },
  {
    key: "workMode",
    label: "Work Mode",
    type: "multiselect",
    options: ["On-site", "Remote", "Hybrid"],
  },
  {
    key: "location",
    label: "Location",
    type: "text",
    placeholder: "e.g. New York, Remote…",
  },
  {
    key: "dateFrom",
    label: "Applied After",
    type: "date",
  },
  {
    key: "dateTo",
    label: "Applied Before",
    type: "date",
  },
];

const DEFAULT_FILTERS = {
  priority: [],
  jobType: [],
  workMode: [],
  location: "",
  dateFrom: "",
  dateTo: "",
};

/* ── FilterChip ──────────────────────────────── */
const FilterChip = ({ label, color, onRemove }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "3px 10px 3px 11px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "600",
      background: color ? `${color}18` : "var(--ct-primary-light)",
      color: color || "var(--ct-primary)",
      border: `1px solid ${color ? `${color}30` : "rgba(79,70,229,0.18)"}`,
    }}
  >
    {label}
    <button
      onClick={onRemove}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0",
        color: "inherit",
        opacity: 0.7,
        display: "flex",
        alignItems: "center",
        lineHeight: 1,
      }}
    >
      <X size={10} />
    </button>
  </span>
);

/* ── drag state ref ──────────────────────────── */
let dragState = { cardId: null, fromCol: null };

/* ── KanbanCard ──────────────────────────────── */
const KanbanCard = ({ card, onDragStart, onDragEnd, isDragging }) => {
  const navigate = useNavigate();
  const dateStr = card.dateApplied
    ? new Date(card.dateApplied).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      })
    : "";

  return (
    <div
      id={`card-${card._id}`}
      className="kanban-card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart(card._id);
      }}
      onDragEnd={onDragEnd}
      style={{
        opacity: isDragging ? 0.45 : 1,
        transform: isDragging ? "rotate(2deg) scale(0.97)" : undefined,
        cursor: "grab",
        userSelect: "none",
        position: "relative",
        transition: "opacity 0.18s, transform 0.18s",
      }}
    >
      {/* grip handle (visual only) */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          color: "var(--ct-text-muted)",
          opacity: 0.4,
        }}
      >
        <GripVertical size={12} />
      </div>

      {/* company + menu row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "6px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "9px",
            flexShrink: 0,
            background: `${card.color || "#4f46e5"}22`,
            color: card.color || "#4f46e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "800",
            fontSize: "12px",
          }}
        >
          {card.logo || card.company?.slice(0, 2).toUpperCase() || "C"}
        </div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: "700",
            color: "var(--ct-text-secondary)",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {card.company}
        </span>
      </div>

      {/* title */}
      <div className="kanban-card-title" style={{ paddingRight: "14px" }}>
        {card.title}
      </div>

      {/* meta pills */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "5px",
          marginBottom: "8px",
        }}
      >
        {card.location && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              fontSize: "10px",
              color: "var(--ct-text-muted)",
              fontWeight: "600",
            }}
          >
            <MapPin size={9} />
            {card.location}
          </span>
        )}
        {card.salary && card.salary !== "Not Disclosed" && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              fontSize: "10px",
              color: "var(--ct-text-muted)",
              fontWeight: "600",
            }}
          >
            {formatSalary(card.salary, card.currency)}
          </span>
        )}
      </div>

      {/* footer row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {card.priority && (
            <span
              style={{
                fontSize: "9px",
                fontWeight: "700",
                padding: "2px 7px",
                borderRadius: "10px",
                background: `${PRIORITY_COLORS[card.priority]}18`,
                color: PRIORITY_COLORS[card.priority],
                border: `1px solid ${PRIORITY_COLORS[card.priority]}30`,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {card.priority}
            </span>
          )}
          {card.jobType && (
            <span
              style={{
                fontSize: "9px",
                fontWeight: "600",
                color: "var(--ct-text-muted)",
                background: "var(--ct-bg-secondary)",
                padding: "2px 7px",
                borderRadius: "10px",
              }}
            >
              {card.jobType}
            </span>
          )}
        </div>
        {dateStr && (
          <div className="kanban-card-footer" style={{ fontSize: "10px" }}>
            <Clock size={10} /> {dateStr}
          </div>
        )}
      </div>

      {/* job URL quick link */}
      {card.jobUrl && (
        <a
          href={card.jobUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            marginTop: "8px",
            fontSize: "10px",
            color: "var(--ct-primary)",
            fontWeight: "600",
            textDecoration: "none",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={9} /> View posting
        </a>
      )}
    </div>
  );
};

/* ── KanbanColumn ────────────────────────────── */
const KanbanColumn = ({
  col,
  draggingId,
  onDragStart,
  onDragEnd,
  onDrop,
  onAddClick,
  updating,
}) => {
  const [over, setOver] = useState(false);

  return (
    <div
      key={col.id}
      className="kanban-col"
      id={`kanban-${col.id}`}
      style={{
        outline: over
          ? `2px solid ${col.accentColor}`
          : "2px solid transparent",
        outlineOffset: "-2px",
        background: over ? `${col.accentColor}08` : undefined,
        transition: "outline-color 0.18s, background 0.18s",
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onDrop(col.id);
      }}
    >
      {/* Column header */}
      <div className="kanban-col-header">
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <span style={{ fontSize: "14px" }}>{col.emoji}</span>
          <span className="kanban-col-title">{col.label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              minWidth: "20px",
              height: "20px",
              borderRadius: "10px",
              background: `${col.accentColor}20`,
              color: col.accentColor,
              fontSize: "11px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 6px",
            }}
          >
            {col.cards.length}
          </span>
          {updating === col.id && (
            <Loader2
              size={12}
              style={{
                color: col.accentColor,
                animation: "spin 1s linear infinite",
              }}
            />
          )}
        </div>
      </div>

      {/* Cards */}
      <div style={{ minHeight: "40px" }}>
        {col.cards.map((card) => (
          <KanbanCard
            key={card._id}
            card={card}
            isDragging={draggingId === card._id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}

        {/* Empty drop zone hint */}
        {col.cards.length === 0 && (
          <div
            style={{
              padding: "20px 12px",
              textAlign: "center",
              borderRadius: "10px",
              border: "1.5px dashed var(--ct-border)",
              color: "var(--ct-text-muted)",
              fontSize: "11px",
              fontWeight: "600",
              background: over ? `${col.accentColor}08` : "transparent",
              transition: "all 0.18s",
            }}
          >
            Drop cards here
          </div>
        )}
      </div>

      {/* Add card button */}
      <button
        onClick={() => onAddClick(col.id)}
        style={{
          width: "100%",
          marginTop: "8px",
          background: "none",
          border: "1px dashed var(--ct-border)",
          borderRadius: "9px",
          padding: "9px",
          color: "var(--ct-text-muted)",
          fontSize: "12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          transition: "all 0.18s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = col.accentColor;
          e.currentTarget.style.color = col.accentColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--ct-border)";
          e.currentTarget.style.color = "var(--ct-text-muted)";
        }}
      >
        <Plus size={13} /> Add application
      </button>
    </div>
  );
};

/* ══════════ Pipeline Page ═══════════ */
const Pipeline = () => {
  const navigate = useNavigate();
  const [columns, setColumns] = useState(
    COLUMN_DEFS.map((c) => ({ ...c, cards: [] })),
  );
  const [draggingId, setDraggingId] = useState(null);
  const [updating, setUpdating] = useState(null); // colId being updated
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [showAddInterview, setShowAddInterview] = useState(false);
  const [interviewModalData, setInterviewModalData] = useState({
    applicationId: null,
    applicationData: null,
    existingInterviews: [],
  });

  /* ── fetch ── */
  const fetchPipeline = useCallback(async () => {
    try {
      const { data } = await api.get("/applications");
      setColumns(
        COLUMN_DEFS.map((col) => ({
          ...col,
          cards: data.filter((a) => a.status === col.id),
        })),
      );
    } catch {
      toast.error("Failed to load pipeline.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  /* ── drag handlers ── */
  const handleDragStart = useCallback(
    (cardId) => {
      const fromCol =
        columns.find((c) => c.cards.some((cd) => cd._id === cardId))?.id ||
        null;
      dragState = { cardId, fromCol };
      setDraggingId(cardId);
    },
    [columns],
  );

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    dragState = { cardId: null, fromCol: null };
  }, []);

  const handleDrop = useCallback(
    async (toColId) => {
      const { cardId, fromCol } = dragState;
      if (!cardId || fromCol === toColId) {
        setDraggingId(null);
        return;
      }

      // optimistic update
      setColumns((prev) => {
        const card = prev
          .find((c) => c.id === fromCol)
          ?.cards.find((cd) => cd._id === cardId);
        if (!card) return prev;
        return prev.map((col) => {
          if (col.id === fromCol)
            return {
              ...col,
              cards: col.cards.filter((cd) => cd._id !== cardId),
            };
          if (col.id === toColId)
            return {
              ...col,
              cards: [{ ...card, status: toColId }, ...col.cards],
            };
          return col;
        });
      });

      setDraggingId(null);
      setUpdating(toColId);

      try {
        await api.put(`/applications/${cardId}`, { status: toColId });
        toast.success(`Moved to ${toColId} ✓`);

        if (toColId === "Interviewing") {
          const { data: existing } = await api.get(
            `/interviews?applicationId=${cardId}`,
          );
          const cardRef = prevColumnsRef.current
            .find((c) => c.id === fromCol)
            ?.cards.find((cd) => cd._id === cardId);

          if (existing && existing.length > 0) {
            if (
              window.confirm(
                "This application already has scheduled interviews. Do you want to update the existing schedule?",
              )
            ) {
              setInterviewModalData({
                applicationId: cardId,
                applicationData: cardRef,
                existingInterviews: existing,
              });
              setShowAddInterview(true);
            }
          } else {
            setInterviewModalData({
              applicationId: cardId,
              applicationData: cardRef,
              existingInterviews: [],
            });
            setShowAddInterview(true);
          }
        }
      } catch (err) {
        toast.error("Failed to update status. Reverting…");
        fetchPipeline(); // revert on error
      } finally {
        setUpdating(null);
      }
    },
    [fetchPipeline, columns],
  );

  const prevColumnsRef = useRef(columns);
  useEffect(() => {
    prevColumnsRef.current = columns;
  }, [columns]);

  const handleAddClick = (statusId) => {
    navigate("/applications/new", { state: { defaultStatus: statusId } });
  };

  /* ── active filter count (for badge on button) ── */
  const activeFilterCount = useMemo(
    () =>
      Object.values(appliedFilters).filter((v) =>
        Array.isArray(v) ? v.length > 0 : v !== "" && v != null,
      ).length,
    [appliedFilters],
  );

  /* ── derived filtered columns ── */
  const filteredColumns = useMemo(() => {
    const { priority, jobType, workMode, location, dateFrom, dateTo } =
      appliedFilters;
    const hasFilters =
      priority.length ||
      jobType.length ||
      workMode.length ||
      location ||
      dateFrom ||
      dateTo;

    if (!hasFilters) return columns;

    const dateFromMs = dateFrom ? new Date(dateFrom).getTime() : null;
    const dateToMs = dateTo ? new Date(dateTo).getTime() : null;

    return columns.map((col) => ({
      ...col,
      cards: col.cards.filter((card) => {
        if (priority.length && !priority.includes(card.priority)) return false;
        if (jobType.length && !jobType.includes(card.jobType)) return false;
        if (workMode.length && !workMode.includes(card.workMode)) return false;
        if (
          location &&
          !card.location?.toLowerCase().includes(location.toLowerCase())
        )
          return false;
        if (dateFromMs) {
          const applied = card.dateApplied
            ? new Date(card.dateApplied).getTime()
            : null;
          if (!applied || applied < dateFromMs) return false;
        }
        if (dateToMs) {
          const applied = card.dateApplied
            ? new Date(card.dateApplied).getTime()
            : null;
          if (!applied || applied > dateToMs) return false;
        }
        return true;
      }),
    }));
  }, [columns, appliedFilters]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "300px",
          gap: "12px",
          color: "var(--ct-text-muted)",
        }}
      >
        <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "14px", fontWeight: "600" }}>
          Loading pipeline…
        </span>
      </div>
    );
  }

  return (
    <div className="page-enter">
      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "6px",
          fontSize: "12px",
          color: "var(--ct-text-muted)",
        }}
      >
        <span>Recruitment</span>
        <span>›</span>
        <span style={{ color: "var(--ct-primary)", fontWeight: "600" }}>
          Pipeline Kanban
        </span>
      </div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "22px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 className="page-title">Application Pipeline</h1>
          <p className="page-subtitle" style={{ marginTop: "4px" }}>
            Drag cards between columns to update status instantly.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Stats pills */}
          {/* <div style={{ display: "flex", gap: "8px" }}>
            {COLUMN_DEFS.slice(0, 4).map(col => {
              const count = columns.find(c => c.id === col.id)?.cards.length || 0;
              return count > 0 ? (
                <div key={col.id} style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "5px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
                  background: `${col.accentColor}15`, color: col.accentColor,
                  border: `1px solid ${col.accentColor}30`,
                }}>
                  {col.emoji} {count}
                </div>
              ) : null;
            })}
          </div> */}

          <button
            className="btn-primary"
            id="pipeline-add-btn"
            onClick={() => navigate("/applications/new")}
          >
            <Plus size={15} /> New Application
          </button>
          <button
            className="btn-secondary"
            id="pipeline-filter-btn"
            onClick={() => {
              setPendingFilters(appliedFilters);
              setFilterOpen(true);
            }}
            style={{ position: "relative" }}
          >
            <SlidersHorizontal size={14} /> Filters
            {activeFilterCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  background: "var(--ct-primary)",
                  color: "#fff",
                  fontSize: "9px",
                  fontWeight: "700",
                  borderRadius: "10px",
                  padding: "2px 6px",
                  lineHeight: 1.4,
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Instructions hint */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "9px 14px",
          borderRadius: "10px",
          marginBottom: "18px",
          background: "var(--ct-primary-light)",
          border: "1px solid rgba(79,70,229,0.15)",
          fontSize: "12px",
          color: "var(--ct-primary)",
          fontWeight: "600",
          width: "fit-content",
        }}
      >
        <GripVertical size={13} />
        Drag &amp; drop application cards to move them between stages
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "14px",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "var(--ct-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Filters:
          </span>
          {appliedFilters.priority.map((v) => (
            <FilterChip
              key={`priority-${v}`}
              label={v}
              color={PRIORITY_COLORS[v]}
              onRemove={() =>
                setAppliedFilters((prev) => ({
                  ...prev,
                  priority: prev.priority.filter((x) => x !== v),
                }))
              }
            />
          ))}
          {appliedFilters.jobType.map((v) => (
            <FilterChip
              key={`jobType-${v}`}
              label={v}
              onRemove={() =>
                setAppliedFilters((prev) => ({
                  ...prev,
                  jobType: prev.jobType.filter((x) => x !== v),
                }))
              }
            />
          ))}
          {appliedFilters.workMode.map((v) => (
            <FilterChip
              key={`workMode-${v}`}
              label={v}
              onRemove={() =>
                setAppliedFilters((prev) => ({
                  ...prev,
                  workMode: prev.workMode.filter((x) => x !== v),
                }))
              }
            />
          ))}
          {appliedFilters.location && (
            <FilterChip
              label={`Location: ${appliedFilters.location}`}
              onRemove={() =>
                setAppliedFilters((prev) => ({ ...prev, location: "" }))
              }
            />
          )}
          {appliedFilters.dateFrom && (
            <FilterChip
              label={`From: ${appliedFilters.dateFrom}`}
              onRemove={() =>
                setAppliedFilters((prev) => ({ ...prev, dateFrom: "" }))
              }
            />
          )}
          {appliedFilters.dateTo && (
            <FilterChip
              label={`To: ${appliedFilters.dateTo}`}
              onRemove={() =>
                setAppliedFilters((prev) => ({ ...prev, dateTo: "" }))
              }
            />
          )}
          <button
            onClick={() => {
              setAppliedFilters(DEFAULT_FILTERS);
              setPendingFilters(DEFAULT_FILTERS);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: "700",
              color: "var(--ct-danger)",
              padding: "3px 8px",
              borderRadius: "6px",
              transition: "background 0.18s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--ct-danger-light)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Kanban board */}
      <div className="kanban-board">
        {filteredColumns.map((col) => (
          <KanbanColumn
            key={col.id}
            col={col}
            draggingId={draggingId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            onAddClick={handleAddClick}
            updating={updating}
          />
        ))}
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={pendingFilters}
        onChange={setPendingFilters}
        onApply={(filters) => setAppliedFilters(filters)}
        onReset={() => setPendingFilters(DEFAULT_FILTERS)}
        config={PIPELINE_FILTER_CONFIG}
        title="Pipeline Filters"
      />

      {/* Add Interview Modal */}
      {showAddInterview && (
        <AddInterviewModal
          onClose={() => setShowAddInterview(false)}
          applicationId={interviewModalData.applicationId}
          applicationData={interviewModalData.applicationData}
          existingInterviews={interviewModalData.existingInterviews}
          onSaved={() => {}}
        />
      )}
    </div>
  );
};

export default Pipeline;
