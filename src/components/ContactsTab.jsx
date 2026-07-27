import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { CONTACT_TYPES, RELATIONSHIP_STRENGTHS, STRENGTH_COLOR, inputStyle, labelStyle } from "../lib/constants";

const emptyContact = {
  full_name: "", job_title: "", email: "", phone: "", contact_type: "Other",
  relationship_strength: "New", preferred_contact_method: "", notes: "", last_contact_date: "",
};

export default function ContactsTab({ organizationId }) {
  const [contacts, setContacts] = useState([]);
  const [editing, setEditing] = useState(null); // contact object or "add" or null

  const load = useCallback(async () => {
    const { data } = await supabase.from("contacts").select("*")
      .eq("organization_id", organizationId).order("created_at", { ascending: false });
    setContacts(data || []);
  }, [organizationId]);

  useEffect(() => { load(); }, [load]);

  const save = async (form) => {
    if (form.id) {
      await supabase.from("contacts").update({ ...form }).eq("id", form.id);
    } else {
      await supabase.from("contacts").insert({ ...form, organization_id: organizationId });
    }
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    await supabase.from("contacts").delete().eq("id", id);
    load();
  };

  if (editing) {
    return <ContactForm contact={editing === "add" ? emptyContact : editing}
      onCancel={() => setEditing(null)} onSave={save} />;
  }

  return (
    <div>
      <button onClick={() => setEditing("add")} style={{
        padding: "8px 14px", borderRadius: 8, border: "none", background: "#0f766e",
        color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, marginBottom: 14,
      }}>+ Add Contact</button>

      {contacts.length === 0 && <div style={{ color: "#aaa", fontSize: 13, padding: "10px 0" }}>No contacts yet.</div>}

      {contacts.map(c => (
        <div key={c.id} style={{
          border: "1px solid #eee", borderRadius: 10, padding: "10px 14px", marginBottom: 8,
          display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10,
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>
              {c.full_name || "(unnamed)"}
              <span style={{
                marginLeft: 8, fontSize: 11, fontWeight: 700,
                color: STRENGTH_COLOR[c.relationship_strength] || "#94a3b8",
              }}>● {c.relationship_strength}</span>
            </div>
            <div style={{ fontSize: 12, color: "#888" }}>{c.contact_type}{c.job_title ? ` · ${c.job_title}` : ""}</div>
            {c.email && <div style={{ fontSize: 12, color: "#aaa" }}>{c.email}</div>}
            {c.phone && <div style={{ fontSize: 12, color: "#aaa" }}>{c.phone}</div>}
            {c.notes && <div style={{ fontSize: 12, color: "#666", marginTop: 4, fontStyle: "italic" }}>{c.notes}</div>}
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button onClick={() => setEditing(c)} style={{ background: "#f3f4f6", border: "none", borderRadius: 6, padding: "5px 9px", cursor: "pointer", fontSize: 13 }}>✏️</button>
            <button onClick={() => remove(c.id)} style={{ background: "#fef2f2", border: "none", borderRadius: 6, padding: "5px 9px", cursor: "pointer", fontSize: 13 }}>🗑️</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ContactForm({ contact, onCancel, onSave }) {
  const [form, setForm] = useState(contact);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Full Name</label>
          <input style={inputStyle} value={form.full_name || ""} onChange={e => set("full_name", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Job Title / Role</label>
          <input style={inputStyle} value={form.job_title || ""} onChange={e => set("job_title", e.target.value)} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} value={form.email || ""} onChange={e => set("email", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Phone</label>
          <input style={inputStyle} value={form.phone || ""} onChange={e => set("phone", e.target.value)} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Contact Type</label>
          <select style={inputStyle} value={form.contact_type} onChange={e => set("contact_type", e.target.value)}>
            {CONTACT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Relationship Strength</label>
          <select style={inputStyle} value={form.relationship_strength} onChange={e => set("relationship_strength", e.target.value)}>
            {RELATIONSHIP_STRENGTHS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Preferred Contact Method</label>
          <input style={inputStyle} value={form.preferred_contact_method || ""} onChange={e => set("preferred_contact_method", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Last Contact Date</label>
          <input type="date" style={inputStyle} value={form.last_contact_date || ""} onChange={e => set("last_contact_date", e.target.value)} />
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Notes</label>
        <textarea rows={2} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
          value={form.notes || ""} onChange={e => set("notes", e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: "9px 0", borderRadius: 8, border: "1.5px solid #e5e7eb",
          background: "#fff", cursor: "pointer", fontWeight: 600, color: "#555",
        }}>Cancel</button>
        <button onClick={() => onSave(form)} style={{
          flex: 2, padding: "9px 0", borderRadius: 8, border: "none",
          background: "#0f766e", color: "#fff", cursor: "pointer", fontWeight: 700,
        }}>Save Contact</button>
      </div>
    </div>
  );
}
