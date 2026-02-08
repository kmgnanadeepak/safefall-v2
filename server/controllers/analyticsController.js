import FallEvent from '../models/FallEvent.js';
import Emergency from '../models/Emergency.js';

export const chat = async (req, res) => {
  try {
    const { question } = req.body;
    const userId = req.user._id;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ message: 'Question is required' });
    }

    const q = question.toLowerCase().trim();

    let answer = '';

    if (q.includes('how many falls') || q.includes('fall count') || q.includes('number of falls')) {
      const daysMatch = q.match(/(\d+)\s*(day|week|month)/);
      let startDate = new Date();
      if (daysMatch) {
        const n = parseInt(daysMatch[1]);
        const unit = daysMatch[2];
        if (unit === 'day') startDate.setDate(startDate.getDate() - n);
        else if (unit === 'week') startDate.setDate(startDate.getDate() - n * 7);
        else if (unit === 'month') startDate.setMonth(startDate.getMonth() - n);
      } else {
        startDate.setDate(startDate.getDate() - 7);
      }
      const count = await FallEvent.countDocuments({
        userId,
        timestamp: { $gte: startDate },
      });
      const emergencyCount = await FallEvent.countDocuments({
        userId,
        timestamp: { $gte: startDate },
        isEmergency: true,
      });
      answer = `In the selected period: ${count} total fall event(s), ${emergencyCount} of which were emergencies.`;
    } else if (q.includes('why') && (q.includes('emergency') || q.includes('marked'))) {
      answer = 'Events are marked as emergencies when the patient confirms "Emergency – Need Help" during the 30-second countdown, or when the countdown expires without a response. False alarms occur when the patient presses "I am OK" before the countdown ends.';
    } else if (q.includes('last fall') || q.includes('recent fall')) {
      const last = await FallEvent.findOne({ userId }).sort({ timestamp: -1 });
      if (last) {
        answer = `Last fall: ${last.timestamp.toISOString()}. Emergency: ${last.isEmergency ? 'Yes' : 'No'}. Resolved: ${last.resolved ? 'Yes' : 'No'}.`;
      } else {
        answer = 'No fall events recorded.';
      }
    } else if (q.includes('emergency') && q.includes('status')) {
      const active = await Emergency.findOne({
        userId,
        status: { $in: ['active', 'acknowledged'] },
      });
      answer = active
        ? `You have an active emergency (status: ${active.status}).`
        : 'No active emergencies.';
    } else {
      const totalFalls = await FallEvent.countDocuments({ userId });
      const totalEmergencies = await FallEvent.countDocuments({ userId, isEmergency: true });
      answer = `Analytics summary: ${totalFalls} total fall events, ${totalEmergencies} emergencies. Ask specific questions like "How many falls this week?" or "Why was this event marked emergency?" for detailed answers.`;
    }

    res.json({ question: question, answer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
