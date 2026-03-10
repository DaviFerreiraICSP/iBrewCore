import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import logo from '../assets/iBranch Hori Black.png';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/user', {
        name,
        email,
        password,
        role: 'USER' // Default role for public registration
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta.');
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
      <GlassCard style={{ maxWidth: '750px', width: '100%', padding: '4rem 5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '-35px', 
          background: '#666', 
          color: 'white', 
          padding: '8px 45px', 
          transform: 'rotate(45deg)',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          opacity: 0.8,
          zIndex: 10
        }}>
          VENDEDOR
        </div>
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
          <p style={{ color: '#666', fontSize: '1.1rem', textAlign: 'center' }}>Junte-se ao iBranch e comece a vender.</p>
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
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: '#444' }}>Nome Completo</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', color: 'var(--black)', opacity: 0.8 }} />
              <input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ paddingLeft: '44px', width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: '#444' }}>E-mail</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', color: 'var(--black)', opacity: 0.8 }} />
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
              <Lock size={18} style={{ position: 'absolute', left: '14px', color: 'var(--black)', opacity: 0.8 }} />
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
          </div>

          <button 
            type="submit" 
            className="liquid-glass"
            disabled={loading} 
          >
            {loading ? 'Cadastrando...' : 'Criar Conta de Vendedor'}
          </button>

          <Link 
            to="/login" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              marginTop: '1rem',
              color: '#666',
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}
          >
            <ArrowLeft size={16} /> Já tem uma conta? Entrar
          </Link>
        </form>
      </GlassCard>
    </div>
  );
};

export default Register;
