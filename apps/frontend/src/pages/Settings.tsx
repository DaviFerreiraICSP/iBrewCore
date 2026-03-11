import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Volume2, 
  CreditCard, 
  Building2, 
  Save, 
  Loader2,
  Percent,
  Sparkles,
  Globe,
  ThumbsUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store/settingsStore';
import GlassCard from '../components/GlassCard';

const GlassOrbIcon: React.FC<{ icon: React.ReactNode; color: string; delay?: number }> = ({ icon, color, delay = 0 }) => (
  <motion.div
    animate={{ 
      y: [0, -6, 0],
      rotate: [0, 2, 0, -2, 0]
    }}
    transition={{ 
      duration: 5, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay 
    }}
    style={{ 
      width: '52px', 
      height: '52px', 
      background: 'rgba(255, 255, 255, 0.4)', 
      backdropFilter: 'blur(10px)',
      borderRadius: '50%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      color: color,
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: `0 10px 20px -5px ${color}33, inset 0 2px 8px rgba(255,255,255,0.8)`
    }}
  >
    {icon}
  </motion.div>
);

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { settings, loading, fetchSettings, updateSettings } = useSettingsStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');
  const [error, setError] = useState('');
  const [stretch, setStretch] = useState(1);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings && !localSettings) {
      setLocalSettings(settings);
      if (settings.language && i18n.language !== settings.language) {
        i18n.changeLanguage(settings.language);
      }
    }
  }, [settings, localSettings, i18n]);

  // Deep comparison to enable/disable Save All button
  const hasChanges = localSettings && settings && (
    JSON.stringify({ ...localSettings, audio_enabled: settings.audio_enabled, audio_volume: settings.audio_volume }) !== 
    JSON.stringify(settings)
  );

  const autoSaveAudio = useCallback(async (newVolume?: number, newEnabled?: boolean) => {
    if (!localSettings) return;
    try {
      await updateSettings({
        ...localSettings,
        ...(newVolume !== undefined && { audio_volume: newVolume }),
        ...(newEnabled !== undefined && { audio_enabled: newEnabled })
      });
    } catch (err) {
      console.error("Auto-save audio failed", err);
    }
  }, [localSettings, updateSettings]);

  const playTestSound = (volumePercent: number) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    const volume = volumePercent / 600;
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localSettings || !hasChanges) return;
    setIsSubmitting(true);
    setError('');
    try {
      await updateSettings(localSettings);
      if (localSettings.language) {
        i18n.changeLanguage(localSettings.language);
      }
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      setError(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !localSettings) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}>
        <Loader2 className="animate-spin" size={48} color="var(--blue)" />
      </div>
    );
  }

  const languages = [
    { code: 'pt', name: t('settings.languages.pt'), flag: '🇧🇷' },
    { code: 'de', name: t('settings.languages.de'), flag: '🇩🇪' },
    { code: 'en', name: t('settings.languages.en'), flag: '🇺🇸' },
    { code: 'es', name: t('settings.languages.es'), flag: '🇪🇸' }
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '6rem' }}>
      <header style={{ marginBottom: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--blue)', marginBottom: '8px' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
              <Sparkles size={18} />
            </motion.div>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>{t('common.systemName')}</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--black)', letterSpacing: '-1.5px' }}>{t('settings.title')}</h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>{t('settings.subtitle')}</p>
        </div>
        
        <motion.button 
          onClick={handleUpdate}
          className={saveStatus === 'success' ? "" : "liquid-glass"} 
          disabled={isSubmitting || (!hasChanges && saveStatus === 'idle')} 
          animate={saveStatus === 'success' ? { backgroundColor: '#34C759', scale: [1, 1.05, 1] } : {}}
          style={{ 
            height: '56px', 
            padding: '0 40px', 
            borderRadius: '20px',
            background: saveStatus === 'success' ? '#34C759' : undefined,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            opacity: (!hasChanges && saveStatus === 'idle') ? 0.5 : 1,
            cursor: (!hasChanges && saveStatus === 'idle') ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : saveStatus === 'success' ? (
            <><ThumbsUp size={20} /> {t('common.saved')}</>
          ) : (
            <><Save size={20} /> {t('common.saveAll')}</>
          )}
        </motion.button>
      </header>

      <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Bank Details */}
          <GlassCard style={{ padding: '2.5rem', borderRadius: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2.5rem' }}>
              <GlassOrbIcon icon={<Building2 size={24} />} color="var(--main-yellow)" />
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900' }}>{t('settings.bank.title')}</h2>
                <p style={{ fontSize: '0.85rem', color: '#666' }}>{t('settings.bank.subtitle')}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('settings.bank.institution')}</label>
                <input 
                  type="text" 
                  value={localSettings?.bank_info?.name || ''}
                  onChange={(e) => setLocalSettings(prev => prev ? ({ ...prev, bank_info: { ...prev.bank_info, name: e.target.value } }) : null)}
                  style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', height: '54px', borderRadius: '16px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('settings.bank.pix')}</label>
                <input 
                  type="text" 
                  value={localSettings?.bank_info?.pix || ''}
                  onChange={(e) => setLocalSettings(prev => prev ? ({ ...prev, bank_info: { ...prev.bank_info, pix: e.target.value } }) : null)}
                  style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', height: '54px', borderRadius: '16px' }}
                />
              </div>
            </div>
          </GlassCard>

          {/* Card Fees */}
          <GlassCard style={{ padding: '2.5rem', borderRadius: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2.5rem' }}>
              <GlassOrbIcon icon={<CreditCard size={24} />} color="#D62828" delay={1} />
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900' }}>{t('settings.fees.title')}</h2>
                <p style={{ fontSize: '0.85rem', color: '#666' }}>{t('settings.fees.subtitle')}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('settings.fees.debit')}</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Percent size={18} style={{ position: 'absolute', left: '16px', opacity: 0.4 }} />
                  <input 
                    type="number" 
                    step="0.01"
                    value={localSettings?.card_rates?.debit || 0}
                    onChange={(e) => setLocalSettings(prev => prev ? ({ ...prev, card_rates: { ...prev.card_rates, debit: parseFloat(e.target.value) } }) : null)}
                    style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', height: '54px', borderRadius: '16px', paddingLeft: '48px' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('settings.fees.credit')}</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Percent size={18} style={{ position: 'absolute', left: '16px', opacity: 0.4 }} />
                  <input 
                    type="number" 
                    step="0.01"
                    value={localSettings?.card_rates?.credit || 0}
                    onChange={(e) => setLocalSettings(prev => prev ? ({ ...prev, card_rates: { ...prev.card_rates, credit: parseFloat(e.target.value) } }) : null)}
                    style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', height: '54px', borderRadius: '16px', paddingLeft: '48px' }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Language Selection */}
          <GlassCard style={{ padding: '2.5rem', borderRadius: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2.5rem' }}>
              <GlassOrbIcon icon={<Globe size={24} />} color="#6B46C1" delay={1.5} />
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900' }}>{t('settings.languages.title')}</h2>
                <p style={{ fontSize: '0.85rem', color: '#666' }}>{t('settings.languages.subtitle')}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              {languages.map((lang) => (
                <motion.div
                  key={lang.code}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setLocalSettings(prev => prev ? ({ ...prev, language: lang.code }) : null);
                    i18n.changeLanguage(lang.code);
                  }}
                  style={{ 
                    padding: '20px', 
                    borderRadius: '24px', 
                    background: localSettings?.language === lang.code ? 'var(--blue)' : 'rgba(0,0,0,0.03)',
                    color: localSettings?.language === lang.code ? 'white' : 'var(--black)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{lang.flag}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '900' }}>{lang.name}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>

        </div>

        {/* Lado Direito */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Audio Section */}
          <GlassCard style={{ padding: '2.5rem', borderRadius: '32px', minHeight: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2.5rem' }}>
              <GlassOrbIcon icon={<Volume2 size={24} />} color="var(--blue)" delay={2} />
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900' }}>{t('settings.audio.title')}</h2>
                <p style={{ fontSize: '0.85rem', color: '#666' }}>{t('settings.audio.subtitle')}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}>
              
              <div 
                style={{ 
                  width: '64px', height: '280px', background: 'rgba(0,0,0,0.04)', borderRadius: '32px', 
                  position: 'relative', padding: '8px', cursor: 'pointer', border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.06)'
                }}
                onMouseDown={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  let lastY = e.clientY;
                  const updateVolume = (clientY: number) => {
                    const deltaY = clientY - lastY;
                    lastY = clientY;
                    setStretch(Math.max(0.75, Math.min(1.25, 1 - (deltaY / 150))));
                    const relativeY = Math.max(0, Math.min(rect.height - 16, clientY - (rect.top + 8)));
                    const percent = Math.round(100 - (relativeY / (rect.height - 16)) * 100);
                    setLocalSettings(prev => prev ? ({ ...prev, audio_volume: percent }) : null);
                    playTestSound(percent);
                  };
                  updateVolume(e.clientY);
                  const onMouseMove = (m: MouseEvent) => updateVolume(m.clientY);
                  const onMouseUp = () => {
                    setStretch(1);
                    autoSaveAudio();
                    window.removeEventListener('mousemove', onMouseMove);
                    window.removeEventListener('mouseup', onMouseUp);
                  };
                  window.addEventListener('mousemove', onMouseMove);
                  window.addEventListener('mouseup', onMouseUp);
                }}
              >
                <motion.div 
                  animate={{ height: `${localSettings?.audio_volume || 0}%`, scaleY: stretch, opacity: (localSettings?.audio_volume || 0) / 100 * 0.3 }}
                  style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', borderRadius: '24px', background: 'var(--blue)', filter: 'blur(15px)', originY: 1, zIndex: 1 }} 
                />
                <motion.div 
                  animate={{ height: `calc(${(localSettings?.audio_volume || 0)}% - ${((localSettings?.audio_volume || 0) / 100) * 16}px)`, scaleY: stretch }}
                  transition={{ height: { type: 'spring', stiffness: 200, damping: 20 }, scaleY: { type: 'spring', stiffness: 400, damping: 12 } }}
                  style={{ 
                    position: 'absolute', bottom: '8px', left: '8px', right: '8px', minHeight: (localSettings?.audio_volume || 0) > 0 ? '40px' : '0',
                    background: 'linear-gradient(180deg, var(--blue) 0%, #0d47a1 100%)', borderRadius: '24px', originY: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.15)', zIndex: 2,
                    boxShadow: '0 15px 30px rgba(13, 71, 161, 0.4), inset 0 2px 8px rgba(255,255,255,0.3)'
                  }} 
                >
                  <span style={{ color: 'white', fontWeight: '900', fontSize: '0.85rem' }}>{localSettings?.audio_volume}%</span>
                </motion.div>
              </div>

              {/* Proportional Toggle */}
              <div 
                onClick={() => {
                  const newEnabled = !localSettings?.audio_enabled;
                  setLocalSettings(prev => prev ? ({ ...prev, audio_enabled: newEnabled }) : null);
                  autoSaveAudio(undefined, newEnabled);
                }}
                style={{ 
                  width: '100%', padding: '1.2rem', background: 'rgba(0,0,0,0.03)', borderRadius: '24px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
                }}
              >
                <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>{localSettings?.audio_enabled ? t('settings.audio.enabled') : t('settings.audio.muted')}</span>
                <div style={{ 
                  width: '56px', height: '30px', borderRadius: '15px', background: localSettings?.audio_enabled ? '#34C759' : '#DDD',
                  position: 'relative', transition: 'background 0.3s'
                }}>
                  <motion.div 
                    animate={{ x: localSettings?.audio_enabled ? 28 : 2 }}
                    style={{ width: '26px', height: '26px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: '0', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                  />
                </div>
              </div>

            </div>
          </GlassCard>
        </div>

      </form>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', padding: '16px 24px', background: '#FF3B30', color: 'white', borderRadius: '20px', fontWeight: '800', zIndex: 10000 }}>
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
