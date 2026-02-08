/**
 * Demo/placeholder data for empty API responses.
 * Ensures dashboards always display something when backend returns empty arrays.
 */

export function getDemoSensorData() {
  const points = 20;
  const now = Date.now();
  const data = [];
  for (let i = 0; i < points; i++) {
    const t = new Date(now - (points - i) * 2000);
    data.push({
      timestamp: t.toISOString(),
      accelerometer: {
        x: (Math.random() - 0.5) * 3,
        y: (Math.random() - 0.5) * 3,
        z: 9.8 + (Math.random() - 0.5) * 2,
      },
      gyroscope: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2,
      },
    });
  }
  return data;
}

export function getDemoFallEvents() {
  const events = [];
  const now = new Date();
  for (let i = 0; i < 4; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - (i + 1) * 3);
    d.setHours(d.getHours() + i * 2);
    events.push({
      _id: `demo-fall-${i}`,
      timestamp: d.toISOString(),
      isEmergency: i % 3 === 0,
      resolved: true,
      location: { lat: 28.6139 + (Math.random() - 0.5) * 0.1, lng: 77.209 + (Math.random() - 0.5) * 0.1 },
    });
  }
  return events;
}

export function getDemoContacts() {
  return [
    { _id: 'demo-c1', name: 'John Smith', relation: 'Son', phone: '+1-555-0101' },
    { _id: 'demo-c2', name: 'Mary Johnson', relation: 'Daughter', phone: '+1-555-0102' },
    { _id: 'demo-c3', name: 'Emergency Services', relation: 'Primary', phone: '911' },
  ];
}

export function getDemoNotifications() {
  const items = [];
  const now = new Date();
  const messages = [
    'Fall detection system active. You are being monitored.',
    'Daily wellness check completed.',
    'Your emergency contacts are configured.',
    'Location tracking is enabled.',
  ];
  messages.forEach((msg, i) => {
    const d = new Date(now);
    d.setHours(d.getHours() - i);
    items.push({
      _id: `demo-n${i}`,
      message: msg,
      read: i > 1,
      timestamp: d.toISOString(),
    });
  });
  return items;
}

export function getDemoEmergencies() {
  return [
    {
      _id: 'demo-em1',
      userId: { _id: 'demo-u1', name: 'Demo Patient', email: 'demo@safefall.ai' },
      status: 'active',
      location: { lat: 28.6139, lng: 77.209 },
      createdAt: new Date().toISOString(),
    },
  ];
}
