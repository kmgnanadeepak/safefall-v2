import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import EmergencyContacts from './pages/EmergencyContacts';
import HealthProfile from './pages/HealthProfile';
import FallHistory from './pages/FallHistory';
import LiveMap from './pages/LiveMap';
import AnalyticsChat from './pages/AnalyticsChat';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

function App() {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B]">
        <div className="animate-pulse text-primary text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

        <Route
          path="/patient/*"
          element={
            <ProtectedRoute role="patient">
              <MainLayout>
                <Routes>
                  <Route index element={<PatientDashboard />} />
                  <Route path="contacts" element={<EmergencyContacts />} />
                  <Route path="health-profile" element={<HealthProfile />} />
                  <Route path="fall-history" element={<FallHistory />} />
                  <Route path="map" element={<LiveMap />} />
                  <Route path="analytics" element={<AnalyticsChat />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/hospital/*"
          element={
            <ProtectedRoute role="hospital">
              <MainLayout>
                <Routes>
                  <Route index element={<HospitalDashboard />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to={user ? (user.role === 'patient' ? '/patient' : '/hospital') : '/login'} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
