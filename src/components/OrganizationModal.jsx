import { useState } from "react";
import {
  ORG_TYPES, STAGES, PRIORITIES, TEAM_MEMBERS,
  inputStyle, labelStyle,
} from "../lib/constants";
import { ConfirmDialog } from "./Shared";
import ContactsTab from "./ContactsTab";
import ActivitiesTab from "./ActivitiesTab";
import FollowUpsTab from "./FollowUpsTab";

const emptyOrg = {
  name: "", organization_type: "Masjid", website: "", phone: "",
  street_address: "", city: "", state: "", region: "",
  stage: "New Prospect", priority: "Medium", lead_source: "",
  date_first_contacted: "", date_last_contact: "", next_followup_date: "",
  next_action: "", assigned_to: "Unassigned", main_opportunity: "",
  current_challenges: "", decline_reason: "", reengagement_strategy: "", notes: "",
};

const Field = ({ label, children }) => (
  <div style={{ flex: 1, minWidth: 140 }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const TABS = ["Organization Info", "Contacts", "Activities", "Follow-Ups", "Notes"];

export default function OrganizationModal({ org, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(org?.id ? org : emptyOrg);
  const [tab, setTab] = useState("Organization Info");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isEdit = !!org?.id;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#00000066", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 640,
        boxShadow: "0 20px 60px #0003", maxHeight: "90vh", overflowY: "auto",
      }} onClick={e => e.stopPropagation()}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111" }}>
            {isEdit ? form.name || "Edit Organization" : "Add Organization"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888" }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 18, borderBottom: "1px solid #eee", flexWrap: "wrap" }}>
          {TABS.map(t => {
            const disabled = !isEdit && t !== "Organization Info";
            return (
              <button key={t} disabled={disabled} onClick={() => setTab(t)} style={{
                padding: "8px 12px", border: "none", background: "none", cursor: disabled ? "not-allowed" : "pointer",
                fontSize: 13, fontWeight: 700, color: disabled ? "#ccc" : (tab === t ? "#0f766e" : "#888"),
                borderBottom: tab === t ? "2px solid #0f766e" : "2px solid transparent", marginBottom: -1,
              }}>{t}</button>
            );
          })}
        </div>

        {!isEdit && tab !== "Organization Info" && (
          <div style={{ color: "#aaa", fontSize: 13 }}>Save the organization first to add {tab.toLowerCase()}.</div>
        )}

        {tab === "Organization Info" && (
          <>
            <Section title="🕌 BASIC INFORMATION">
              <Field label="Organization Name">
                <input style={inputStyle} value={form.name} onChange={e => set("name", e.target.value)} />
              </Field>
              <Row>
                <Field label="Organization Type">
                  <select style={inputStyle} value={form.organization_type} onChange={e => set("organization_type", e.target.value)}>
                    {ORG_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Website">
                  <input style={inputStyle} value={form.website || ""} onChange={e => set("website", e.target.value)} />
                </Field>
              </Row>
              <Row>
                <Field label="Phone Number">
                  <input style={inputStyle} value={form.phone || ""} onChange={e => set("phone", e.target.value)} />
                </Field>
                <Field label="Region">
                  <input style={inputStyle} value={form.region || ""} onChange={e => set("region", e.target.value)} />
                </Field>
              </Row>
              <Field label="Street Address">
                <input style={inputStyle} value={form.street_address || ""} onChange={e => set("street_address", e.target.value)} />
              </Field>
              <Row>
                <Field label="City">
                  <input style={inputStyle} value={form.city || ""} onChange={e => set("city", e.target.value)} />
                </Field>
                <Field label="State">
                  <input style={inputStyle} value={form.state || ""} onChange={e => set("state", e.target.value)} />
                </Field>
              </Row>
            </Section>

            <Section title="📈 PIPELINE INFORMATION">
              <Row>
                <Field label="Current Stage">
                  <select style={inputStyle} value={form.stage} onChange={e => set("stage", e.target.value)}>
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Priority">
                  <select style={inputStyle} value={form.priority} onChange={e => set("priority", e.target.value)}>
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </Field>
              </Row>
              <Row>
                <Field label="Lead Source">
                  <input style={inputStyle} value={form.lead_source || ""} onChange={e => set("lead_source", e.target.value)} />
                </Field>
                <Field label="Assigned Team Member">
                  <select style={inputStyle} value={form.assigned_to || "Unassigned"} onChange={e => set("assigned_to", e.target.value)}>
                    {TEAM_MEMBERS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </Field>
              </Row>
              <Row>
                <Field label="Date First Contacted">
                  <input type="date" style={inputStyle} value={form.date_first_contacted || ""} onChange={e => set("date_first_contacted", e.target.value)} />
                </Field>
                <Field label="Date of Last Contact">
                  <input type="date" style={inputStyle} value={form.date_last_contact || ""} onChange={e => set("date_last_contact", e.target.value)} />
                </Field>
              </Row>
              <Row>
                <Field label="Next Follow-Up Date">
                  <input type="date" style={inputStyle} value={form.next_followup_date || ""} onChange={e => set("next_followup_date", e.target.value)} />
                </Field>
              </Row>
              <Field label="Next Action">
                <input style={inputStyle} value={form.next_action || ""} onChange={e => set("next_action", e.target.value)} />
              </Field>
              <Field label="Main Opportunity">
                <input style={inputStyle} value={form.main_opportunity || ""} onChange={e => set("main_opportunity", e.target.value)} />
              </Field>
              <Field label="Current Challenges or Concerns">
                <textarea rows={2} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                  value={form.current_challenges || ""} onChange={e => set("current_challenges", e.target.value)} />
              </Field>
              {form.stage === "Declined" && (
                <Field label="Reason for Declining">
                  <textarea rows={2} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                    value={form.decline_reason || ""} onChange={e => set("decline_reason", e.target.value)} />
                </Field>
              )}
              {form.stage === "Re-Engagement Needed" && (
                <Field label="Re-Engagement Strategy">
                  <textarea rows={2} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                    value={form.reengagement_strategy || ""} onChange={e => set("reengagement_strategy", e.target.value)} />
                </Field>
              )}
            </Section>

            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              {isEdit && (
                <button onClick={() => setConfirmDelete(true)} style={{
                  padding: "10px 14px", borderRadius: 8, border: "1.5px solid #fca5a5",
                  background: "#fef2f2", cursor: "pointer", color: "#ef4444", fontWeight: 600,
                }}>Delete</button>
              )}
              <button onClick={onClose} style={{
                flex: 1, padding: "10px 0", borderRadius: 8, border: "1.5px solid #e5e7eb",
                background: "#fff", cursor: "pointer", fontWeight: 600, color: "#555",
              }}>Cancel</button>
              <button onClick={() => onSave(form)} style={{
                flex: 2, padding: "10px 0", borderRadius: 8, border: "none",
                background: "#0f766e", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14,
              }}>{isEdit ? "Save Changes" : "Add Organization"}</button>
            </div>
          </>
        )}

        {isEdit && tab === "Contacts" && <ContactsTab organizationId={form.id} />}
        {isEdit && tab === "Activities" && <ActivitiesTab organizationId={form.id} />}
        {isEdit && tab === "Follow-Ups" && <FollowUpsTab organizationId={form.id} />}
        {isEdit && tab === "Notes" && (
          <div>
            <textarea rows={10} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              value={form.notes || ""} onChange={e => set("notes", e.target.value)}
              placeholder="General notes about this organization..." />
            <button onClick={() => onSave(form)} style={{
              marginTop: 12, padding: "9px 16px", borderRadius: 8, border: "none",
              background: "#0f766e", color: "#fff", cursor: "pointer", fontWeight: 700,
            }}>Save Notes</button>
          </div>
        )}
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this organization?"
          message="This permanently removes the organization along with its contacts, activities, and follow-ups. This can't be undone."
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => { onDelete(form.id); setConfirmDelete(false); }}
        />
      )}
    </div>
  );
}

const Section = ({ title, children }) => (
  <div style={{ background: "#f8f9fc", borderRadius: 10, padding: "12px 16px", marginBottom: 16, border: "1px solid #e5e7f5" }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: "#0f766e", marginBottom: 10 }}>{title}</div>
    {children}
  </div>
);

const Row = ({ children }) => (
  <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>{children}</div>
);
