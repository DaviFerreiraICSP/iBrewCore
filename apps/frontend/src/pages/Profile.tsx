import React, { useState, useRef } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Camera, 
  Save, 
  CheckCircle2, 
  Loader2,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import GlassCard from '../components/GlassCard';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with user when it changes in the store
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // Fetch the most recent profile on mount
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/me');
        updateUser(res.data);
      } catch (err) {
        console.error('Falha ao sincronizar perfil', err);
      }
    };
    fetchProfile();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsSubmitting(true);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
      const newAvatarUrl = `${baseUrl}${res.data.url}`;
      setAvatarUrl(newAvatarUrl);
      
      // Auto-save avatar update
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

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
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
      showSuccess('Perfil atualizado com sucesso!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--black)', marginBottom: '0.5rem' }}>Meu Perfil</h1>
        <p style={{ color: '#666' }}>Gerencie suas informações pessoais e segurança.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <GlassCard style={{ padding: '3rem', background: '#FFFFFF', borderRadius: '32px', position: 'relative', overflow: 'hidden' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Avatar section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  width: '180px', 
                  height: '180px', 
                  borderRadius: '50px', 
                  background: 'rgba(0,0,0,0.03)',
                  border: isDragging ? '3px solid var(--blue)' : '2px dashed rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  style={{ display: 'none' }} 
                  accept="image/*"
                />
                
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserIcon size={60} color="var(--blue)" style={{ opacity: 0.3 }} />
                )}

                <div style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  background: 'rgba(0,0,0,0.3)', 
                  backdropFilter: 'blur(5px)',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  opacity: 0,
                  transition: 'opacity 0.2s'
                }}
                className="hover-overlay"
                >
                  <Camera size={18} />
                </div>
                
                <style>{`
                  div:hover .hover-overlay { opacity: 1 !important; }
                `}</style>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>{user?.name}</p>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>{user?.email}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              {error && (
                <div style={{ padding: '12px', background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30', borderRadius: '12px', textAlign: 'center' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Nome Completo</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <UserIcon size={18} style={{ position: 'absolute', left: '16px', opacity: 0.4 }} />
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                      style={{ 
                        paddingLeft: '48px', 
                        background: 'rgba(0,0,0,0.02)', 
                        border: '1px solid rgba(0,0,0,0.05)',
                        borderRadius: '16px'
                      }} 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>E-mail</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '16px', opacity: 0.4 }} />
                    <input 
                      type="email" 
                      value={email} 
                      disabled 
                      style={{ 
                        paddingLeft: '48px', 
                        background: 'rgba(0,0,0,0.05)', 
                        border: '1px solid transparent',
                        borderRadius: '16px',
                        cursor: 'not-allowed',
                        color: '#999'
                      }} 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Nível de Acesso</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Shield size={18} style={{ position: 'absolute', left: '16px', opacity: 0.4 }} />
                    <input 
                      type="text" 
                      value={user?.role === 'ADMIN' ? 'Administrador' : 'Operador'} 
                      disabled 
                      style={{ 
                        paddingLeft: '48px', 
                        background: 'rgba(0,0,0,0.05)', 
                        border: '1px solid transparent',
                        borderRadius: '16px',
                        cursor: 'not-allowed',
                        color: '#999'
                      }} 
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                <button type="submit" className="liquid-glass" disabled={isSubmitting} style={{ minWidth: '240px', height: '56px' }}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Salvar Alterações</>}
                </button>
              </div>
            </div>
          </form>
        </GlassCard>
      </div>

      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'fixed',
              bottom: '40px',
              left: '50%',
              marginLeft: '-150px',
              width: '300px',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 24px',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              color: 'var(--black)',
              fontWeight: '700'
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
