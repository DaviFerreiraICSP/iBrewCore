import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, UserPlus, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import logo from '../assets/iBranch Hori Black.png';
import { useAuthStore } from '../store/authStore';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      setAuth(response.data.access_token, response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '1rem'
    }}>
      <GlassCard style={{ maxWidth: '750px', width: '100%', padding: '4rem 5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <motion.img
            src={logo}
            alt="iBranch Logo"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{ 
              width: '280px', 
              height: 'auto',
              margin: '0 auto'
            }}
          />
          </div>
          <p style={{ color: '#666', fontSize: '1.1rem', textAlign: 'center' }}>Entre com suas credenciais para continuar.</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ 
              padding: '12px', 
              background: 'rgba(255, 59, 48, 0.1)', 
              borderRadius: '10px', 
              color: '#FF3B30', 
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: '#444' }}>E-mail</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  color: 'var(--black)',
                  opacity: 0.8
                }} 
              />
              <input
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '44px', width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: '#444' }}>Senha</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  color: 'var(--black)',
                  opacity: 0.8
                }} 
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '44px', paddingRight: '44px', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Link 
                to="/forgot-password" 
                style={{ fontSize: '0.8rem', color: '#888', textDecoration: 'none', fontWeight: '500' }}
                onMouseEnter={(e: any) => e.target.style.color = 'var(--blue)'}
                onMouseLeave={(e: any) => e.target.style.color = '#888'}
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </div>

          <button 
            type="submit" 
            className="liquid-glass"
            disabled={loading} 
            style={{ 
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? 'Entrando...' : (
              <>
                Entrar <ArrowRight size={18} />
              </>
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>Não tem uma conta?</p>
            <Link 
              to="/register" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: 'var(--blue)', 
                textDecoration: 'none', 
                fontWeight: '700' 
              }}
            >
              <UserPlus size={18} /> Cadastre-se agora
            </Link>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default Login;
