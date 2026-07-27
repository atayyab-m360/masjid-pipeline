export function exportCSV(orgs) {
  const cols = [
    "name", "organization_type", "stage", "priority", "city", "state", "region",
    "phone", "website", "assigned_to", "next_action", "next_followup_date",
    "date_last_contact", "notes",
  ];
  const headers = [
    "Organization", "Type", "Stage", "Priority", "City", "State", "Region",
    "Phone", "Website", "Assigned To", "Next Action", "Next Follow-Up",
    "Last Contact", "Notes",
  ];
  const rows = orgs.map(m => cols.map(k => `"${(m[k] || "").toString().replace(/"/g, '""')}"`).join(","));
  const blob = new Blob([headers.join(",") + "\n" + rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "minar360_pipeline.csv"; a.click();
  URL.revokeObjectURL(url);
}

const daysFromToday = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return Math.round((d - t) / 86400000);
};

export function followUpBuckets(orgs) {
  const dueToday = [], dueThisWeek = [], overdue = [];
  orgs.forEach(m => {
    const d = daysFromToday(m.next_followup_date);
    if (d === null) return;
    if (d < 0) overdue.push(m);
    else if (d === 0) dueToday.push(m);
    else if (d <= 7) dueThisWeek.push(m);
  });
  return { dueToday, dueThisWeek, overdue };
}

export function staleOrgs(orgs) {
  return orgs.filter(m => {
    const d = daysFromToday(m.date_last_contact);
    return d !== null && d < -30;
  });
}
