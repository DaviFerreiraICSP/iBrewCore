import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { TrendingUp, DollarSign, AlertTriangle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import GlassCard from '../components/GlassCard';

interface DashboardStats {
  revenueToday: number;
  salesCountToday: number;
  topProducts: any[];
  lowStock: any[];
}

// Internal UltraGlassCard for maximum dynamism
const UltraGlassCard: React.FC<{ 
  children: React.ReactNode; 
  glowColor?: string; 
  onClick?: () => void;
  style?: React.CSSProperties;
  delay?: number;
}> = ({ children, glowColor = 'rgba(255,255,255,0.2)', onClick, style, delay = 0 }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);
  const shineX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const shineY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        perspective: "1000px",
        cursor: 'pointer',
        height: '100%',
        ...style
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          height: '100%',
          transformStyle: "preserve-3d",
          position: "relative",
          borderRadius: "32px",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 20px ${glowColor}30`,
          overflow: "hidden"
        }}
      >
        {/* shine effect */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at ${shineX} ${shineY}, rgba(255,255,255,0.4) 0%, transparent 60%)`,
            pointerEvents: "none",
            zIndex: 1
          }}
        />
        <div style={{ padding: '2rem', position: "relative", zIndex: 2 }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/summary');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'white'
    }}>
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{ fontSize: '1.2rem', fontWeight: '800', color: '#666' }}
      >
        {t('common.loading')}
      </motion.div>
    </div>
  );

  const kpiData = [
    { id: 'revenue', label: t('dashboard.revenue'), value: `R$ ${stats?.revenueToday.toFixed(2)}`, icon: <DollarSign />, color: '#007AFF' },
    { id: 'sales', label: t('dashboard.sales'), value: stats?.salesCountToday, icon: <TrendingUp />, color: '#FF9500' },
    { id: 'stock', label: t('dashboard.lowStock'), value: stats?.lowStock.length, icon: <AlertTriangle />, color: '#FF3B30' },
    { id: 'average', label: 'Ticket Médio', value: `R$ ${(stats?.revenueToday || 0) / (stats?.salesCountToday || 1)}`, icon: <TrendingUp />, color: '#34C759' },
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem', position: 'relative' }}>
      {/* Dynamic Background Blobs - Softened & Cleaned */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, overflow: 'hidden', pointerEvents: 'none', opacity: 0.6 }}>
        <motion.div
          animate={{ x: [0, -120, 0], y: [0, 100, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', bottom: '15%', right: '15%', width: '500px', height: '500px', background: 'rgba(52,199,89,0.08)', borderRadius: '50%', filter: 'blur(100px)' }}
        />
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, -60, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', top: '40%', right: '25%', width: '350px', height: '350px', background: 'rgba(203,213,225,0.15)', borderRadius: '50%', filter: 'blur(90px)' }}
        />
      </div>

      <header style={{ 
        marginBottom: '2.5rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: '1.5rem',
        position: 'relative',
        zIndex: 5
      }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-2px', color: 'var(--black)', marginBottom: '0.4rem' }}>
            {t('dashboard.title')}
          </h1>
          <p style={{ color: '#666', fontSize: '1.2rem', fontWeight: '500' }}>{t('dashboard.subtitle')}</p>
        </div>

        <div style={{ 
          display: 'flex', 
          background: 'rgba(255,255,255,0.4)', 
          padding: '8px', 
          borderRadius: '24px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.5)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          position: 'relative'
        }}>
          {(['day', 'week', 'month'] as const).map((p) => (
            <motion.button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                position: 'relative',
                padding: '12px 28px',
                borderRadius: '16px',
                border: 'none',
                background: 'transparent',
                color: period === p ? 'white' : '#666',
                fontWeight: '900',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'color 0.3s ease',
                zIndex: 1
              }}
              whileTap={{ scale: 0.95 }}
            >
              {period === p && (
                <motion.div
                  layoutId="period-selector-lens"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(15px)',
                    WebkitBackdropFilter: 'blur(15px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255,255,255,0.2)',
                    zIndex: -1
                  }}
                />
              )}
              {p === 'day' ? 'Hoje' : p === 'week' ? 'Semana' : 'Mês'}
            </motion.button>
          ))}
        </div>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '2rem',
        marginBottom: '4rem'
      }}>
        {kpiData.map((kpi, index) => (
          <UltraGlassCard
            key={kpi.id}
            glowColor={kpi.color}
            onClick={() => setActiveModal(kpi.id)}
            delay={index * 0.15}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <motion.div 
                  style={{ 
                    background: `${kpi.color}20`, 
                    color: kpi.color, 
                    width: '64px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '22px',
                    boxShadow: `0 12px 25px ${kpi.color}25`
                  }}
                  animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 4 + index, 
                    ease: "easeInOut" 
                  }}
                >
                  {React.cloneElement(kpi.icon as React.ReactElement<any>, { size: 32 })}
                </motion.div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.8)', 
                  padding: '6px 12px', 
                  borderRadius: '12px', 
                  fontSize: '0.8rem', 
                  fontWeight: '800',
                  color: '#34C759',
                  border: '1px solid rgba(52,199,89,0.2)'
                }}>
                  +12%
                </div>
              </div>
              
              <div>
                <p style={{ fontSize: '0.9rem', color: '#666', fontWeight: '800', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>
                  {kpi.label}
                </p>
                <h3 style={{ fontSize: '2.6rem', fontWeight: '900', color: 'var(--black)', letterSpacing: '-2px', lineHeight: 1 }}>
                  {kpi.value}
                </h3>
              </div>
            </div>
          </UltraGlassCard>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '2rem' }}>
        <UltraGlassCard delay={0.6}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-1px' }}>
                {period === 'day' ? 'Fluxo de Atividade' : 'Performance Analítica'}
              </h3>
              <p style={{ color: '#666', fontWeight: '600' }}>Monitoramento em tempo real</p>
            </div>
            <button className="liquid-glass-blue" style={{ padding: '12px 30px', borderRadius: '18px' }}>
              Relatórios
            </button>
          </div>
          <div style={{ 
            height: '350px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
            borderRadius: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
             <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'radial-gradient(circle at 10% 10%, #007AFF 0%, transparent 50%)' }} />
             <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                <TrendingUp size={60} style={{ color: '#007AFF', marginBottom: '1.5rem', opacity: 0.5 }} />
                <p style={{ fontSize: '1.1rem', fontWeight: '800', color: '#444' }}>Gráfico Neural de Vendas</p>
                <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#888' }}>Processando vetores de dados...</p>
             </div>
          </div>
        </UltraGlassCard>

        <UltraGlassCard delay={0.75} glowColor="#FFD60A">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-1px' }}>Destaques</h3>
            <Sparkles size={24} color="#FF9500" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {stats?.topProducts.slice(0, 4).map((product, idx) => {
              const bgColors = ['#FFD700', '#C0C0C0', '#CD7F32', '#007AFF'];
              return (
                <motion.div 
                  key={idx}
                  whileHover={{ x: 10 }}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '16px',
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.4)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      background: idx < 3 ? `${bgColors[idx]}20` : 'rgba(0,0,0,0.05)',
                      color: idx < 3 ? bgColors[idx] : '#666',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '900',
                      fontSize: '1rem',
                      border: idx < 3 ? `1px solid ${bgColors[idx]}40` : 'none'
                    }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontWeight: '800', color: 'var(--black)', fontSize: '1.05rem' }}>{product.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#007AFF' }}>{product.totalQuantity}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#888', textTransform: 'uppercase' }}>Und</div>
                  </div>
                </motion.div>
              );
            })}
            {stats?.topProducts.length === 0 && <p style={{ color: '#999', fontSize: '1rem', fontWeight: '600', padding: '1rem' }}>Vendas pendentes...</p>}
          </div>
        </UltraGlassCard>
      </div>

      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                width: '100%',
                maxWidth: '650px',
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(30px)',
                borderRadius: '40px',
                padding: '3rem',
                boxShadow: '0 50px 100px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.6)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* modal glow background */}
               <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'rgba(0,122,255,0.1)', borderRadius: '50%', filter: 'blur(50px)' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', position: 'relative' }}>
                <div>
                  <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--black)', marginBottom: '0.6rem', letterSpacing: '-1.5px' }}>
                    {activeModal === 'revenue' ? 'Engenharia de Faturamento' : 
                     activeModal === 'sales' ? 'Fluxo de Vendas' :
                     activeModal === 'stock' ? 'Saúde do Estoque' : 'Métrica de Ticket'}
                  </h2>
                  <p style={{ color: '#666', fontWeight: '700', fontSize: '1.1rem' }}>Consolidado do período: {period === 'day' ? 'Hoje' : period === 'week' ? 'Semana' : 'Mês'}</p>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  style={{ 
                    background: 'rgba(0,0,0,0.05)', 
                    border: 'none', 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    fontWeight: 'bold',
                    backdropFilter: 'blur(5px)'
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div style={{ padding: '2rem', background: 'white', borderRadius: '28px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: '800', color: '#888', textTransform: 'uppercase', marginBottom: '0.6rem', letterSpacing: '1px' }}>Total do Período</p>
                  <h4 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#007AFF' }}>
                    {activeModal === 'revenue' ? `R$ ${(stats?.revenueToday || 0).toFixed(2)}` : stats?.salesCountToday}
                  </h4>
                </div>
                <div style={{ padding: '2rem', background: 'white', borderRadius: '28px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: '800', color: '#888', textTransform: 'uppercase', marginBottom: '0.6rem', letterSpacing: '1px' }}>Eficiência</p>
                  <h4 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#34C759' }}>94.2%</h4>
                </div>
              </div>

              <div style={{ 
                height: '240px', 
                background: 'rgba(0,122,255,0.03)', 
                borderRadius: '32px', 
                marginBottom: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#007AFF',
                border: '2px dashed rgba(0,122,255,0.1)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <TrendingUp size={40} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                  <p style={{ fontWeight: '800', fontSize: '1.1rem' }}>Gráfico Expansivo de Performance</p>
                  <p style={{ fontWeight: '600', opacity: 0.6 }}>Otimizando renderização...</p>
                </div>
              </div>

              <button 
                onClick={() => setActiveModal(null)}
                className="liquid-glass"
                style={{ width: '100%', height: '64px', borderRadius: '22px', fontSize: '1.2rem', background: '#007AFF' }}
              >
                Retornar ao Painel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
