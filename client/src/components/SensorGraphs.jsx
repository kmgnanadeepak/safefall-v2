import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../services/api';
import { getDemoSensorData } from '../utils/demoData.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
  },
  scales: {
    x: { display: true, maxTicksLimit: 8 },
    y: { display: true },
  },
};

function buildChartData(data) {
  const labels = data.map((d) => new Date(d.timestamp).toLocaleTimeString());
  const colors = {
      x: 'rgb(255, 106, 0)',
    y: 'rgb(34, 197, 94)',
    z: 'rgb(59, 130, 246)',
  };
  return {
    accel: {
      labels,
      datasets: [
        { label: 'X', data: data.map((d) => d.accelerometer?.x ?? 0), borderColor: colors.x, tension: 0.3, fill: true },
        { label: 'Y', data: data.map((d) => d.accelerometer?.y ?? 0), borderColor: colors.y, tension: 0.3, fill: true },
        { label: 'Z', data: data.map((d) => d.accelerometer?.z ?? 0), borderColor: colors.z, tension: 0.3, fill: true },
      ],
    },
    gyro: {
      labels,
      datasets: [
        { label: 'X', data: data.map((d) => d.gyroscope?.x ?? 0), borderColor: colors.x, tension: 0.3, fill: true },
        { label: 'Y', data: data.map((d) => d.gyroscope?.y ?? 0), borderColor: colors.y, tension: 0.3, fill: true },
        { label: 'Z', data: data.map((d) => d.gyroscope?.z ?? 0), borderColor: colors.z, tension: 0.3, fill: true },
      ],
    },
  };
}

export default function SensorGraphs({ userId }) {
  const [accel, setAccel] = useState({ labels: [], datasets: [] });
  const [gyro, setGyro] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/patient/sensor-data?limit=50');
        const chartData = buildChartData(Array.isArray(data) && data.length > 0 ? data : getDemoSensorData());
        setAccel(chartData.accel);
        setGyro(chartData.gyro);
      } catch {
        const chartData = buildChartData(getDemoSensorData());
        setAccel(chartData.accel);
        setGyro(chartData.gyro);
      }
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [userId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="glass-card p-4 h-64">
        <h3 className="font-semibold mb-2">Accelerometer (X, Y, Z)</h3>
        <Line data={accel} options={options} />
      </div>
      <div className="glass-card p-4 h-64">
        <h3 className="font-semibold mb-2">Gyroscope (X, Y, Z)</h3>
        <Line data={gyro} options={options} />
      </div>
    </div>
  );
}
