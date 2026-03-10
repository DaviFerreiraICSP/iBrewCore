import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, ShieldCheck, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import logo from '../assets/iBranch Hori Black.png';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setStep('code');
      setSuccess('Código de recuperação enviado para o seu e-mail.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar código. Verifique o e-mail informado.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', { 
        email, 
        code, 
        newPassword 
      });
      setSuccess('Senha redefinida com sucesso! Redirecionando...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Código inválido ou expirado.');
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
      <GlassCard style={{ maxWidth: '650px', width: '100%', padding: '4rem 5rem' }}>
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
          <h2 style={{ fontSize: '1.75rem', fontWeight: '8400', color: 'var(--black)', textAlign: 'center', marginBottom: '0.5rem' }}>
            Recuperar Senha
          </h2>
          <p style={{ color: '#666', fontSize: '1rem', textAlign: 'center' }}>
            {step === 'email' 
              ? 'Informe seu e-mail para receber um código de segurança.' 
              : 'Verifique seu e-mail e informe o código recebido.'}
          </p>
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

        {success && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ 
              padding: '12px', 
              background: 'rgba(52, 199, 89, 0.1)', 
              borderRadius: '10px', 
              color: '#1A8738', 
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}
          >
            {success}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.form 
              key="step-email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSendCode} 
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>E-mail da Conta</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', opacity: 0.4 }} />
                  <input
                    type="email"
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ paddingLeft: '48px', width: '100%', background: 'rgba(0,0,0,0.02)', borderRadius: '16px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px',  alignItems: 'center' }}>
                <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem' }}>
                  <ArrowLeft size={18} /> Voltar
                </Link>
                <button type="submit" className="liquid-glass" disabled={loading} style={{ flex: 1, height: '56px' }}>
                  {loading ? <Loader2 className="animate-spin" /> : <>Próximo <ArrowRight size={18} /></>}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.form 
              key="step-code"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleResetPassword} 
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Código de 6 dígitos</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <ShieldCheck size={18} style={{ position: 'absolute', left: '16px', opacity: 0.4 }} />
                  <input
                    type="text"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    required
                    style={{ paddingLeft: '48px', width: '100%', background: 'rgba(0,0,0,0.02)', borderRadius: '16px', letterSpacing: '8px', fontSize: '1.2rem', fontWeight: 'bold' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Nova Senha</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '16px', opacity: 0.4 }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ paddingLeft: '48px', paddingRight: '44px', width: '100%', background: 'rgba(0,0,0,0.02)', borderRadius: '16px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#666' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button 
                  type="button" 
                  onClick={() => setStep('email')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  <ArrowLeft size={18} /> Editar E-mail
                </button>
                <button type="submit" className="liquid-glass" disabled={loading} style={{ flex: 1, height: '56px' }}>
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Redefinir Senha'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
};

export default ForgotPassword;
