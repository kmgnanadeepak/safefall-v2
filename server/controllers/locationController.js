export const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ message: 'Valid lat and lng required' });
    }
    req.app.locals.userLocations = req.app.locals.userLocations || {};
    req.app.locals.userLocations[req.patientId] = { lat, lng, updatedAt: new Date() };
    res.json({ lat, lng, message: 'Location updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLocation = async (req, res) => {
  try {
    const locations = req.app.locals.userLocations || {};
    const patientId = req.patientId || req.params.patientId;
    const loc = locations[patientId];
    if (!loc) return res.status(404).json({ message: 'Location not available' });
    res.json(loc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
