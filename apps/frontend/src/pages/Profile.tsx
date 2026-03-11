import React, { useState, useRef, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Camera, 
  Save, 
  CheckCircle2, 
  Loader2,
  Shield,
  Lock,
  Key,
  Fingerprint,
  Activity,
  ChevronRight,
  TrendingUp,
  Clock,
  Settings,
  ThumbsUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import GlassCard from '../components/GlassCard';
import ImageCropper from '../components/ImageCropper';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with user
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // Fetch the most recent profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/me');
        updateUser(res.data);
      } catch (err) {
        console.error('Falha ao sincronizar perfil', err);
      }
    };
    fetchProfile();
  }, [updateUser]);

  const hasChanges = user && (
    name !== (user.name || '') ||
    avatarUrl !== (user.avatarUrl || '')
  );

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleFileUpload = async (file: File | Blob) => {
    const formData = new FormData();
    formData.append('file', file, 'avatar.jpg');

    try {
      setIsSubmitting(true);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
      const newAvatarUrl = `${baseUrl}${res.data.url}`;
      setAvatarUrl(newAvatarUrl);
      setImageToCrop(null);
      
      if (user) {
        await api.patch(`/user/${user.id}`, { avatarUrl: newAvatarUrl });
        updateUser({ ...user, avatarUrl: newAvatarUrl });
        showSuccess('Foto de perfil atualizada!');
      }
    } catch (err) {
      setError('Falha ao enviar imagem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const response = await api.patch(`/user/${user.id}`, { name, avatarUrl });
      updateUser(response.data);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
      showSuccess('Perfil atualizado com sucesso!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--black)', marginBottom: '0.6rem', letterSpacing: '-1px' }}>
          Personalização de Perfil
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          Gerencie sua identidade digital e configurações de segurança no ecossistema <span style={{ color: 'var(--blue)', fontWeight: '700' }}>iBranch</span>.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '2.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Personal Identity & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Identity Card */}
          <GlassCard style={{ padding: '3rem 2rem', background: 'linear-gradient(135deg, #FFFFFF, #f8faff)', borderRadius: '40px', textAlign: 'center', boxShadow: '0 25px 80px rgba(0, 0, 0, 0.08)' }}>
            <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto 2rem' }}>
              {/* Dynamic Animated Rings */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                style={{ position: 'absolute', inset: '-12px', border: '2px solid var(--blue)', borderRadius: '64px', opacity: 0.1 }}
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{ position: 'absolute', inset: '-6px', border: '2px dashed var(--blue)', borderRadius: '60px', opacity: 0.2 }}
              />
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  borderRadius: '56px', 
                  background: 'white',
                  boxShadow: '0 15px 45px rgba(0, 63, 130, 0.15)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  zIndex: 2,
                  border: isDragging ? '3px solid var(--blue)' : '4px solid white',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(var(--blue-rgb), 0.05)' }}>
                    <UserIcon size={70} color="var(--blue)" style={{ opacity: 0.2 }} />
                  </div>
                )}
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  style={{ 
                    position: 'absolute', inset: 0, 
                    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                  }}
                >
                  <Camera size={28} />
                </motion.div>
                
                <input type="file" ref={fileInputRef} onChange={handleSelectFile} style={{ display: 'none' }} accept="image/*" />
              </motion.div>

              {/* Status Indicator */}
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ position: 'absolute', bottom: '15px', right: '15px', width: '18px', height: '18px', background: '#34C759', borderRadius: '50%', border: '4px solid white', zIndex: 10, boxShadow: '0 4px 10px rgba(52, 199, 89, 0.3)' }}
              />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--black)', marginBottom: '0.4rem', letterSpacing: '-0.5px' }}>{user?.name}</h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'rgba(var(--blue-rgb), 0.1)', color: 'var(--blue)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '800', marginBottom: '2rem' }}>
              <Shield size={14} /> {user?.role === 'ADMIN' ? 'Administrador iBranch' : 'Operador'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ padding: '1.2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <p style={{ fontSize: '0.7rem', color: '#999', fontWeight: '700', textTransform: 'uppercase', marginBottom: '5px' }}>Atividade</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <TrendingUp size={16} color="#34C759" />
                  <span style={{ fontSize: '1.2rem', fontWeight: '900' }}>85%</span>
                </div>
              </div>
              <div style={{ padding: '1.2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <p style={{ fontSize: '0.7rem', color: '#999', fontWeight: '700', textTransform: 'uppercase', marginBottom: '5px' }}>Sessão</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Clock size={16} color="var(--blue)" />
                  <span style={{ fontSize: '1.2rem', fontWeight: '900' }}>2.4h</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Quick Stats Card */}
          <GlassCard style={{ padding: '2rem', background: 'rgba(21, 101, 192, 0.03)', borderRadius: '32px', border: '1px solid rgba(21, 101, 192, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
              <div style={{ width: '44px', height: '44px', background: 'var(--blue)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity color="white" size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Resumo Mensal</h3>
                <p style={{ fontSize: '0.8rem', color: '#777' }}>Dados de desempenho global.</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {[
                { label: 'Vendas Processadas', value: '142', progress: 75, color: 'var(--blue)' }
              ].map((stat, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#555' }}>{stat.label}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '900' }}>{stat.value}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.progress}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      style={{ height: '100%', background: stat.color, borderRadius: '10px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Settings & Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <GlassCard style={{ padding: '2.5rem', background: 'white', borderRadius: '40px', boxShadow: '0 25px 80px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2.5rem' }}>
              <div style={{ width: '10px', height: '30px', background: 'var(--blue)', borderRadius: '5px' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.5px' }}>Configurações de Identidade</h3>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '16px', background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30', borderRadius: '16px', marginBottom: '2rem', textAlign: 'center', fontWeight: '700' }}>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '900', marginBottom: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>Seu Nome</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <UserIcon size={18} style={{ position: 'absolute', left: '16px', opacity: 0.4 }} />
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                      style={{ 
                        padding: '16px 16px 16px 50px', 
                        background: 'rgba(0,0,0,0.03)', 
                        border: '1px solid rgba(0,0,0,0.05)',
                        borderRadius: '18px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        width: '100%',
                        transition: 'all 0.3s'
                      }} 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '900', marginBottom: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>E-mail Primário</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '16px', opacity: 0.4 }} />
                    <input 
                      type="email" 
                      value={email} 
                      disabled 
                      style={{ 
                        padding: '16px 16px 16px 50px', 
                        background: 'rgba(0,0,0,0.05)', 
                        border: '1px solid transparent',
                        borderRadius: '18px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        width: '100%',
                        color: '#999',
                        cursor: 'not-allowed'
                      }} 
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.5rem', background: 'rgba(var(--blue-rgb), 0.05)', borderRadius: '24px' }}>
                <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                  <Settings size={22} color="var(--blue)" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '800', fontSize: '1rem' }}>Preferências do iBranch</p>
                  <p style={{ fontSize: '0.85rem', color: '#666' }}>Seu perfil é sincronizado com todas as estações de venda.</p>
                </div>
                <motion.button 
                  type="submit" 
                  className={saveStatus === 'success' ? "" : "liquid-glass"} 
                  disabled={isSubmitting || (!hasChanges && saveStatus === 'idle')} 
                  animate={saveStatus === 'success' ? { backgroundColor: '#34C759', scale: [1, 1.05, 1] } : {}}
                  style={{ 
                    height: '52px', 
                    padding: '0 30px', 
                    borderRadius: '16px',
                    background: saveStatus === 'success' ? '#34C759' : undefined,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    opacity: (!hasChanges && saveStatus === 'idle') ? 0.5 : 1,
                    cursor: (!hasChanges && saveStatus === 'idle') ? 'not-allowed' : 'pointer',
                    minWidth: '180px',
                    justifyContent: 'center'
                  }}
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : saveStatus === 'success' ? (
                    <><ThumbsUp size={18} /> Salvo</>
                  ) : (
                    <><Save size={18} /> Atualizar Agora</>
                  )}
                </motion.button>
              </div>
            </form>
          </GlassCard>

          {/* Security & Access Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            
            <GlassCard style={{ padding: '2rem', background: 'white', borderRadius: '35px', boxShadow: '0 15px 45px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(255, 149, 0, 0.1)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={22} color="#FF9500" />
                </div>
                <div style={{ padding: '4px 10px', background: 'rgba(52, 199, 89, 0.1)', color: '#34C759', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900' }}>ATIVO</div>
              </div>
              <h4 style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Segurança de Login</h4>
              <p style={{ fontSize: '0.85rem', color: '#777', marginBottom: '1.5rem' }}>Proteja sua conta com autenticação multi-fator e logs.</p>
              
              <button 
                type="button"
                className="liquid-glass" 
                style={{ width: '100%', height: '48px', borderRadius: '14px', background: 'rgba(0,0,0,0.03)', color: 'var(--black)', fontSize: '0.9rem', border: '1px solid rgba(0,0,0,0.05)' }}
              >
                Gerenciar 2FA <ChevronRight size={16} />
              </button>
            </GlassCard>

            <GlassCard style={{ padding: '2rem', background: 'white', borderRadius: '35px', boxShadow: '0 15px 45px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(0, 102, 255, 0.1)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Fingerprint size={22} color="var(--blue)" />
                </div>
                <Key size={18} color="#CCC" />
              </div>
              <h4 style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Credenciais iBranch</h4>
              <p style={{ fontSize: '0.85rem', color: '#777', marginBottom: '1.5rem' }}>Mantenha suas senhas e chaves de API atualizadas.</p>
              
              <button 
                type="button"
                className="liquid-glass" 
                style={{ width: '100%', height: '48px', borderRadius: '14px', background: 'rgba(0,0,0,0.03)', color: 'var(--black)', fontSize: '0.9rem', border: '1px solid rgba(0,0,0,0.05)' }}
              >
                Alterar Senha <Lock size={16} style={{ marginLeft: '4px' }} />
              </button>
            </GlassCard>

          </div>
        </div>

      </div>

      <AnimatePresence>
        {imageToCrop && (
          <ImageCropper 
            image={imageToCrop} 
            aspect={1} 
            onCropComplete={handleFileUpload} 
            onCancel={() => setImageToCrop(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'fixed', bottom: '40px', left: '50%',
              marginLeft: '-150px', width: '300px', zIndex: 10000,
              display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px',
              background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
              borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              color: 'var(--black)', fontWeight: '700'
            }}
          >
            <div style={{ width: '32px', height: '32px', background: '#34C759', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 color="white" size={20} />
            </div>
            <span style={{ fontSize: '0.9rem' }}>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
