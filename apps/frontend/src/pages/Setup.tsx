import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import logo from '../assets/IBrewWhite.png';

const Setup: React.FC = () => {
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
        role: 'ADMIN' // Always admin for setup
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar administrador inicial.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '1rem'
    }}>
      <GlassCard className="animate-fade-in" style={{ maxWidth: '850px', width: '100%', padding: '4rem 6rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '-35px', 
          background: 'var(--blue)', 
          color: 'white', 
          padding: '8px 45px', 
          transform: 'rotate(45deg)',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 10
        }}>
          MODO ADMIN
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <motion.img
            src={logo}
            alt="iBranch Logo"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8 }}
            style={{ 
              width: '320px', 
              height: 'auto',
              margin: '0 auto'
            }}
          />
          </div>
          <p style={{ color: '#666', fontSize: '1.2rem', textAlign: 'center' }}>Siga os passos para configurar seu acesso administrativo.</p>
        </div>

        {error && (
          <div style={{ 
            padding: '1rem', 
            background: 'rgba(255, 0, 0, 0.1)', 
            borderRadius: '12px', 
            color: 'red', 
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <User size={20} style={{ position: 'absolute', left: '12px', color: 'var(--black)', opacity: 0.8 }} />
            <input
              type="text"
              placeholder="Seu Nome Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ paddingLeft: '44px', width: '100%' }}
            />
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Mail size={20} style={{ position: 'absolute', left: '12px', color: 'var(--black)', opacity: 0.8 }} />
            <input
              type="email"
              placeholder="E-mail Administrativo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ paddingLeft: '44px', width: '100%' }}
            />
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Lock size={20} style={{ position: 'absolute', left: '12px', color: 'var(--black)', opacity: 0.8 }} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Sua Senha Mestra"
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
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button type="submit" className="liquid-glass" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Configurando...' : 'Finalizar Configuração e Salvar'}
          </button>
        </form>
      </GlassCard>
    </div>
  );
};

export default Setup;
