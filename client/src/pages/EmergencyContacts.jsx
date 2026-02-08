import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getDemoContacts } from '../utils/demoData.js';

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useDemo, setUseDemo] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', relation: '', phone: '' });

  useEffect(() => {
    api.get('/patient/contacts')
      .then(({ data }) => {
        setContacts(Array.isArray(data) && data.length > 0 ? data : getDemoContacts());
        setUseDemo(!Array.isArray(data) || data.length === 0);
      })
      .catch(() => {
        setContacts(getDemoContacts());
        setUseDemo(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const reset = () => {
    setForm({ name: '', relation: '', phone: '' });
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/patient/contacts/${editing}`, form);
        setContacts((c) => c.map((x) => (x._id === editing ? { ...x, ...form } : x)));
        toast.success('Contact updated');
      } else {
        const { data } = await api.post('/patient/contacts', form);
        setContacts((c) => [...c, data]);
        toast.success('Contact added');
      }
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    try {
      await api.delete(`/patient/contacts/${id}`);
      setContacts((c) => c.filter((x) => x._id !== id));
      toast.success('Contact deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const startEdit = (c) => {
    setEditing(c._id);
    setForm({ name: c.name, relation: c.relation, phone: c.phone });
  };

  if (loading) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Emergency Contacts</h1>

      <form onSubmit={handleSubmit} className="glass-card p-4 space-y-3">
        <h3 className="font-semibold">{editing ? 'Edit Contact' : 'Add Contact'}</h3>
        <input
          className="input-field"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          className="input-field"
          placeholder="Relation"
          value={form.relation}
          onChange={(e) => setForm((f) => ({ ...f, relation: e.target.value }))}
          required
        />
        <input
          className="input-field"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          required
        />
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            {editing ? 'Update' : 'Add'}
          </button>
          {editing && (
            <button type="button" onClick={reset} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="font-semibold">Your Contacts</h3>
        {useDemo && (
          <p className="text-amber-400/90 text-sm">Showing demo data. Add contacts to replace.</p>
        )}
        {contacts.length === 0 ? (
          <p className="text-gray-400">No contacts yet. Add contacts to notify during emergencies.</p>
        ) : (
          contacts.map((c) => (
            <div key={c._id} className="glass-card p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-gray-400">{c.relation} • {c.phone}</p>
              </div>
              {!c._id?.startsWith('demo-') && (
                <div className="flex gap-2">
                  <button onClick={() => startEdit(c)} className="text-primary hover:underline">Edit</button>
                  <button onClick={() => handleDelete(c._id)} className="text-red-400 hover:underline">Delete</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
