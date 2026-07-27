import { useMemo } from "react";

const ACTIVE_STAGES = [
  "Initial Outreach", "Relationship Building", "Discovery",
  "Demo Scheduled", "Post-Demo Follow-Up", "Verbal Commitment",
];

const StatCard = ({ label, value, color, emoji }) => (
  <div style={{
    background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
    padding: "12px 14px", minWidth: 130, flex: "1 1 130px",
  }}>
    <div style={{ fontSize: 16 }}>{emoji}</div>
    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 11, color: "#888", fontWeight: 500, marginTop: 2 }}>{label}</div>
  </div>
);

export default function Dashboard({ orgs, followUps }) {
  const stats = useMemo(() => {
    const count = (fn) => orgs.filter(fn).length;
    return {
      total: orgs.length,
      masjids: count(m => m.organization_type === "Masjid"),
      partners: count(m => m.organization_type === "Strategic Partner"),
      onboarded: count(m => m.stage === "Live / Onboarded"),
      onboarding: count(m => m.stage === "Onboarding"),
      active: count(m => ACTIVE_STAGES.includes(m.stage)),
      declined: count(m => m.stage === "Declined"),
      reengage: count(m => m.stage === "Re-Engagement Needed"),
    };
  }, [orgs]);

  const followUpsDue = followUps.dueToday.length + followUps.dueThisWeek.length;

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
      <StatCard label="Total Organizations" value={stats.total} color="#111" emoji="🏢" />
      <StatCard label="Masjids" value={stats.masjids} color="#0f766e" emoji="🕌" />
      <StatCard label="Strategic Partners" value={stats.partners} color="#6366f1" emoji="🤝" />
      <StatCard label="Onboarded" value={stats.onboarded} color="#10b981" emoji="🎉" />
      <StatCard label="In Onboarding" value={stats.onboarding} color="#f59e0b" emoji="⚙️" />
      <StatCard label="Active Conversations" value={stats.active} color="#3b82f6" emoji="💬" />
      <StatCard label="Follow-Ups Due" value={followUpsDue} color="#f97316" emoji="🗓️" />
      <StatCard label="Overdue Follow-Ups" value={followUps.overdue.length} color="#ef4444" emoji="⏰" />
      <StatCard label="Declined" value={stats.declined} color="#ef4444" emoji="❌" />
      <StatCard label="Re-Engagement" value={stats.reengage} color="#eab308" emoji="🔁" />
    </div>
  );
}
