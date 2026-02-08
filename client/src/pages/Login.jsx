import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleBtnRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleBtnRef.current) return;
    const init = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (res) => {
          setGoogleLoading(true);
          try {
            const { data } = await api.post('/auth/google', {
              credential: res.credential,
              role: 'patient',
            });
            login(data, data.token);
            navigate(data.role === 'patient' ? '/patient' : '/hospital');
            toast.success('Signed in with Google');
          } catch (err) {
            toast.error(err.response?.data?.message || 'Google sign-in failed');
          } finally {
            setGoogleLoading(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text: 'continue_with',
        width: 280,
      });
    };
    if (window.google?.accounts?.id) init();
    else {
      const id = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(id);
          init();
        }
      }, 100);
      return () => clearInterval(id);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data, data.token);
      navigate(data.role === 'patient' ? '/patient' : '/hospital');
      toast.success('Logged in successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md glass-card p-8">
      <h1 className="text-2xl font-bold text-center mb-6">SafeFall AI</h1>
      <h2 className="text-lg text-gray-400 text-center mb-8">Sign In</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          required
        />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        {GOOGLE_CLIENT_ID && (
          <div className="flex justify-center mt-4">
            <div ref={googleBtnRef} />
            {googleLoading && <span className="ml-2 text-sm">Signing in...</span>}
          </div>
        )}
      </form>
      <p className="text-center mt-6 text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
