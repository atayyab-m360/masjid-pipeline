import { staleOrgs } from "../lib/utils";

const Row = ({ org, onClick, tag, tagColor }) => (
  <div onClick={onClick} style={{
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "8px 10px", borderRadius: 8, cursor: "pointer", background: "#fff",
    marginBottom: 6, border: "1px solid #f0f0f0",
  }}>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: "#111" }}>{org.name}</div>
      <div style={{ fontSize: 11, color: "#888" }}>{org.next_action || "—"}</div>
    </div>
    <span style={{ fontSize: 11, fontWeight: 700, color: tagColor, whiteSpace: "nowrap", marginLeft: 8 }}>{tag}</span>
  </div>
);

const Section = ({ title, emoji, items, tagColor, onSelect, empty }) => (
  <div style={{ flex: "1 1 220px", minWidth: 220 }}>
    <div style={{ fontWeight: 700, fontSize: 13, color: "#333", marginBottom: 8 }}>{emoji} {title} ({items.length})</div>
    {items.length === 0
      ? <div style={{ color: "#bbb", fontSize: 12 }}>{empty}</div>
      : items.map(org => (
        <Row key={org.id} org={org} onClick={() => onSelect(org)}
          tag={org.next_followup_date || ""} tagColor={tagColor} />
      ))}
  </div>
);

export default function FollowUpsPanel({ orgs, followUps, onSelect }) {
  const stale = staleOrgs(orgs);

  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14,
      padding: 16, marginBottom: 20,
    }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 12 }}>
        📋 Meetings & Follow-Ups
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        <Section title="Overdue" emoji="⏰" items={followUps.overdue} tagColor="#ef4444" onSelect={onSelect} empty="Nothing overdue" />
        <Section title="Due Today" emoji="📌" items={followUps.dueToday} tagColor="#f97316" onSelect={onSelect} empty="Nothing due today" />
        <Section title="Due This Week" emoji="🗓️" items={followUps.dueThisWeek} tagColor="#3b82f6" onSelect={onSelect} empty="Nothing due this week" />
        <Section title="No Activity in 30+ Days" emoji="😴" items={stale} tagColor="#94a3b8" onSelect={onSelect} empty="Everyone's been contacted recently" />
      </div>
    </div>
  );
}
