import React, { useEffect, useState } from 'react';
import { 
  Volume2, 
  CreditCard, 
  Building2, 
  Save, 
  CheckCircle2, 
  Loader2,
  Percent,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../store/settingsStore';
import GlassCard from '../components/GlassCard';

const Settings: React.FC = () => {
  const { settings, loading, fetchSettings, updateSettings } = useSettingsStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const audioCtxRef = React.useRef<AudioContext | null>(null);

  const playTestSound = (volumePercent: number) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
    
    const volume = volumePercent / 600; // Adjusted for pleasant test sound
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setLocalSettings(prev => prev ? ({ ...prev, audio_volume: newVolume }) : null);
    playTestSound(newVolume);
  };

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localSettings) return;

    setIsSubmitting(true);
    setError('');

    try {
      await updateSettings(localSettings);
      showSuccess('Configurações salvas com sucesso!');
    } catch (err: any) {
      setError('Erro ao salvar configurações.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !localSettings) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader2 className="animate-spin" size={40} color="var(--blue)" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--black)', marginBottom: '0.5rem' }}>Configurações</h1>
        <p style={{ color: '#666' }}>Personalize o comportamento do sistema e dados financeiros.</p>
      </header>

      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Audio Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(21, 101, 192, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)' }}>
                <Volume2 size={24} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Preferências de Áudio</h2>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              {/* Vertical Volume Bar (iOS Style) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div 
                  style={{ 
                    width: '40px', 
                    height: '160px', 
                    background: '#F0F0F0', 
                    borderRadius: '20px', 
                    position: 'relative', 
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                  onMouseDown={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const updateVolume = (clientY: number) => {
                      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
                      const percent = Math.round(100 - (y / rect.height) * 100);
                      handleVolumeChange({ target: { value: percent.toString() } } as any);
                    };
                    updateVolume(e.clientY);
                    
                    const onMouseMove = (moveEvent: MouseEvent) => updateVolume(moveEvent.clientY);
                    const onMouseUp = () => {
                      window.removeEventListener('mousemove', onMouseMove);
                      window.removeEventListener('mouseup', onMouseUp);
                    };
                    window.addEventListener('mousemove', onMouseMove);
                    window.addEventListener('mouseup', onMouseUp);
                  }}
                >
                  <motion.div 
                    initial={false}
                    animate={{ height: `${localSettings?.audio_volume || 0}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    style={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      left: 0, 
                      right: 0, 
                      background: 'var(--blue)',
                      opacity: 0.9
                    }} 
                  />
                  <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    color: (localSettings?.audio_volume || 0) > 50 ? 'white' : 'var(--blue)',
                    pointerEvents: 'none',
                    fontWeight: '800',
                    fontSize: '0.8rem',
                    zIndex: 2
                  }}>
                    {localSettings?.audio_volume}%
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#888' }}>Volume</span>
              </div>

              {/* Toggles and Info */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '16px' }}>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px' }}>Efeitos Sonoros</p>
                    <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.4' }}>Sons de sucesso e alertas no sistema iBrew.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setLocalSettings(prev => prev ? ({ ...prev, audio_enabled: !prev.audio_enabled }) : null)}
                    style={{ 
                      width: '32px', 
                      height: '16px', 
                      minHeight: '16px',
                      borderRadius: '8px', 
                      background: localSettings?.audio_enabled ? 'var(--blue)' : '#DDD',
                      border: 'none',
                      position: 'relative',
                      cursor: 'pointer',
                      padding: '0',
                      flexShrink: 0,
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <motion.div 
                      animate={{ x: localSettings?.audio_enabled ? 18 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      style={{ 
                        width: '12px', 
                        height: '12px', 
                        background: 'white', 
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        left: '0',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                    />
                  </button>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(21, 101, 192, 0.05)', borderRadius: '16px', border: '1px solid rgba(21, 101, 192, 0.1)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--blue)', fontWeight: '600' }}>
                    💡 Dica: Arraste a barra para ajustar o volume. O som de teste tocará automaticamente.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Bank Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(217, 160, 54, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--main-yellow)' }}>
                <Building2 size={24} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Dados Bancários & PIX</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Banco</label>
                <input 
                  type="text" 
                  placeholder="Ex: Nubank, Itaú..."
                  value={localSettings?.bank_info?.name || ''}
                  onChange={(e) => setLocalSettings(prev => prev ? ({ ...prev, bank_info: { ...prev.bank_info, name: e.target.value } }) : null)}
                  style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Chave PIX</label>
                <input 
                  type="text" 
                  placeholder="E-mail, CPF ou Aleatória"
                  value={localSettings?.bank_info?.pix || ''}
                  onChange={(e) => setLocalSettings(prev => prev ? ({ ...prev, bank_info: { ...prev.bank_info, pix: e.target.value } }) : null)}
                  style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Agência</label>
                <input 
                  type="text" 
                  value={localSettings?.bank_info?.agency || ''}
                  onChange={(e) => setLocalSettings(prev => prev ? ({ ...prev, bank_info: { ...prev.bank_info, agency: e.target.value } }) : null)}
                  style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Conta</label>
                <input 
                  type="text" 
                  value={localSettings?.bank_info?.account || ''}
                  onChange={(e) => setLocalSettings(prev => prev ? ({ ...prev, bank_info: { ...prev.bank_info, account: e.target.value } }) : null)}
                  style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Card Fees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GlassCard style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(214, 40, 40, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D62828' }}>
                <CreditCard size={24} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Taxas de Cartão</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Taxa de Débito (%)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Percent size={16} style={{ position: 'absolute', right: '16px', opacity: 0.4 }} />
                  <input 
                    type="number" 
                    step="0.01"
                    value={localSettings?.card_rates?.debit || 0}
                    onChange={(e) => setLocalSettings(prev => prev ? ({ ...prev, card_rates: { ...prev.card_rates, debit: parseFloat(e.target.value) } }) : null)}
                    style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', paddingRight: '40px' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Taxa de Crédito (%)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Percent size={16} style={{ position: 'absolute', right: '16px', opacity: 0.4 }} />
                  <input 
                    type="number" 
                    step="0.01"
                    value={localSettings?.card_rates?.credit || 0}
                    onChange={(e) => setLocalSettings(prev => prev ? ({ ...prev, card_rates: { ...prev.card_rates, credit: parseFloat(e.target.value) } }) : null)}
                    style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', paddingRight: '40px' }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '12px' }}>
                <Layers size={16} /> Bandeiras Aceitas
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Visa', 'Mastercard', 'Elo', 'Hipercard', 'Amex'].map(brand => {
                  const isSelected = localSettings?.card_rates?.brands.includes(brand);
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => {
                        if (!localSettings) return;
                        const brands = isSelected 
                          ? localSettings.card_rates.brands.filter(b => b !== brand)
                          : [...localSettings.card_rates.brands, brand];
                        setLocalSettings({ ...localSettings, card_rates: { ...localSettings.card_rates, brands } });
                      }}
                      style={{ 
                        padding: '8px 16px', 
                        borderRadius: '12px', 
                        fontSize: '0.85rem',
                        background: isSelected ? 'var(--black)' : 'rgba(0,0,0,0.05)',
                        color: isSelected ? 'white' : '#666',
                        border: 'none',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                    >
                      {brand}
                    </button>
                  )
                })}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30', borderRadius: '12px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4rem' }}>
          <button type="submit" className="liquid-glass" disabled={isSubmitting} style={{ minWidth: '200px', height: '56px' }}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Salvar Tudo</>}
          </button>
        </div>
      </form>

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

export default Settings;
