import EmergencyContact from '../models/EmergencyContact.js';

export const getContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ userId: req.patientId }).sort({ createdAt: 1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createContact = async (req, res) => {
  try {
    const { name, relation, phone } = req.body;
    if (!name || !relation || !phone) {
      return res.status(400).json({ message: 'Name, relation, and phone are required' });
    }
    const contact = await EmergencyContact.create({
      userId: req.patientId,
      name,
      relation,
      phone,
    });
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findOneAndUpdate(
      { _id: req.params.id, userId: req.patientId },
      req.body,
      { new: true }
    );
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findOneAndDelete({ _id: req.params.id, userId: req.patientId });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
