import { STAGES, STAGE_CONFIG } from "../lib/constants";
import { StageBadge, PriorityBadge } from "./Shared";

export function OrgRow({ org, onOpen, onQuickStage }) {
  return (
    <div style={{
      padding: "14px 18px", borderBottom: "1px solid #f0f0f0",
      display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap",
    }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>{org.name}</div>
        <div style={{ color: "#888", fontSize: 12 }}>{org.organization_type}</div>
        {(org.city || org.state) && <div style={{ color: "#888", fontSize: 13 }}>📍 {[org.city, org.state].filter(Boolean).join(", ")}</div>}
      </div>
      <div style={{ flex: 1, minWidth: 160 }}>
        <StageBadge stage={org.stage} />
        <div style={{ marginTop: 4 }}><PriorityBadge priority={org.priority} /></div>
      </div>
      <div style={{ flex: 1, minWidth: 180 }}>
        {org.next_action && <div style={{ fontSize: 12, color: "#666" }}>➡️ {org.next_action}</div>}
        {org.next_followup_date && <div style={{ fontSize: 12, color: "#f97316", fontWeight: 600, marginTop: 2 }}>🗓️ Due {org.next_followup_date}</div>}
      </div>
      <div style={{ minWidth: 90, flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: "#aaa", fontWeight: 500, marginBottom: 3 }}>ASSIGNED TO</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: org.assigned_to && org.assigned_to !== "Unassigned" ? "#0f766e" : "#ccc" }}>
          {org.assigned_to && org.assigned_to !== "Unassigned" ? "👤 " + org.assigned_to : "—"}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <select value={org.stage} onChange={e => onQuickStage(org.id, e.target.value)}
          style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 12, background: "#f9fafb", cursor: "pointer" }}>
          {STAGES.map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={() => onOpen(org)} style={{ background: "#f3f4f6", border: "none", borderRadius: 6, padding: "5px 9px", cursor: "pointer", fontSize: 14 }}>✏️</button>
      </div>
    </div>
  );
}

export function BoardColumn({ stage, orgs, onOpen }) {
  const cfg = STAGE_CONFIG[stage];
  return (
    <div style={{ minWidth: 210, flex: "0 0 210px", background: cfg.bg, borderRadius: 12, padding: 12, border: `1.5px solid ${cfg.color}30` }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: cfg.color, marginBottom: 10 }}>
        {cfg.emoji} {stage} <span style={{ fontWeight: 400, opacity: .7 }}>({orgs.length})</span>
      </div>
      {orgs.map(org => (
        <div key={org.id} onClick={() => onOpen(org)} style={{
          background: "#fff", borderRadius: 8, padding: 10, marginBottom: 8, boxShadow: "0 1px 4px #0001", cursor: "pointer",
        }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#111" }}>{org.name}</div>
          <div style={{ color: "#888", fontSize: 11 }}>{org.organization_type}</div>
          {(org.city || org.state) && <div style={{ color: "#888", fontSize: 12 }}>📍 {[org.city, org.state].filter(Boolean).join(", ")}</div>}
          {org.assigned_to && org.assigned_to !== "Unassigned" && (
            <div style={{ fontSize: 11, color: "#0f766e", fontWeight: 600, marginTop: 3 }}>👤 {org.assigned_to}</div>
          )}
        </div>
      ))}
      {orgs.length === 0 && <div style={{ color: "#bbb", fontSize: 12, textAlign: "center", padding: "12px 0" }}>Empty</div>}
    </div>
  );
}
