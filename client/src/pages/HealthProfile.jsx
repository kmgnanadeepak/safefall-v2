import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genders = ['male', 'female', 'other', 'prefer_not_to_say'];

export default function HealthProfile() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    age: '',
    gender: '',
    bloodGroup: '',
    conditions: [],
    allergies: [],
    notes: '',
  });
  const [conditionInput, setConditionInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');

  useEffect(() => {
    api.get('/patient/health-profile')
      .then(({ data }) => {
        setForm({
          age: data.age ?? '',
          gender: data.gender ?? '',
          bloodGroup: data.bloodGroup ?? '',
          conditions: data.conditions ?? [],
          allergies: data.allergies ?? [],
          notes: data.notes ?? '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/patient/health-profile', form);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const addCondition = () => {
    if (conditionInput.trim()) {
      setForm((f) => ({ ...f, conditions: [...f.conditions, conditionInput.trim()] }));
      setConditionInput('');
    }
  };

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setForm((f) => ({ ...f, allergies: [...f.allergies, allergyInput.trim()] }));
      setAllergyInput('');
    }
  };

  const removeCondition = (i) => setForm((f) => ({ ...f, conditions: f.conditions.filter((_, j) => j !== i) }));
  const removeAllergy = (i) => setForm((f) => ({ ...f, allergies: f.allergies.filter((_, j) => j !== i) }));

  if (loading) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Health Profile</h1>
      <p className="text-gray-400 text-sm">Hospitals can view this only during emergencies or if you are assigned.</p>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Age</label>
          <input
            type="number"
            min="0"
            max="150"
            className="input-field"
            value={form.age}
            onChange={(e) => setForm((f) => ({ ...f, age: e.target.value ? parseInt(e.target.value, 10) : '' }))}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Gender</label>
          <select
            className="input-field"
            value={form.gender}
            onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
          >
            <option value="">Select</option>
            {genders.map((g) => (
              <option key={g} value={g}>{g.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Blood Group</label>
          <select
            className="input-field"
            value={form.bloodGroup}
            onChange={(e) => setForm((f) => ({ ...f, bloodGroup: e.target.value }))}
          >
            <option value="">Select</option>
            {bloodGroups.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Medical Conditions</label>
          <div className="flex gap-2 mb-2">
            <input
              className="input-field flex-1"
              placeholder="Add condition"
              value={conditionInput}
              onChange={(e) => setConditionInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
            />
            <button type="button" onClick={addCondition} className="btn-secondary">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.conditions.map((c, i) => (
              <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm flex items-center gap-1">
                {c} <button type="button" onClick={() => removeCondition(i)} className="text-red-400">×</button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Allergies</label>
          <div className="flex gap-2 mb-2">
            <input
              className="input-field flex-1"
              placeholder="Add allergy"
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
            />
            <button type="button" onClick={addAllergy} className="btn-secondary">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.allergies.map((a, i) => (
              <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm flex items-center gap-1">
                {a} <button type="button" onClick={() => removeAllergy(i)} className="text-red-400">×</button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Notes</label>
          <textarea
            className="input-field min-h-[100px]"
            placeholder="Additional medical notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </div>
        <button type="submit" className="btn-primary">Save Profile</button>
      </form>
    </div>
  );
}
