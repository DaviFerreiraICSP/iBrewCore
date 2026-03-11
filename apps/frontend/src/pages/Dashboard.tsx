import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, AlertTriangle, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import GlassCard from '../components/GlassCard';

interface DashboardStats {
  revenueToday: number;
  salesCountToday: number;
  topProducts: any[];
  lowStock: any[];
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>{t('common.loading')}</div>;

  const kpiData = [
    { label: t('dashboard.revenue'), value: `R$ ${stats?.revenueToday.toFixed(2)}`, icon: <DollarSign />, color: '#2EA7F2' },
    { label: t('dashboard.sales'), value: stats?.salesCountToday, icon: <TrendingUp />, color: '#F2CA7E' },
    { label: t('dashboard.lowStock'), value: stats?.lowStock.length, icon: <AlertTriangle />, color: '#FF3B30' },
  ];

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>{t('dashboard.title')}</h1>
        <p style={{ color: '#666' }}>{t('dashboard.subtitle')}</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {kpiData.map((kpi, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <GlassCard style={{ padding: '1.5rem', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  background: `${kpi.color}20`, 
                  color: kpi.color, 
                  padding: '12px', 
                  borderRadius: '12px' 
                }}>
                  {kpi.icon}
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>{kpi.label}</p>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{kpi.value}</h3>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <GlassCard style={{ minHeight: '300px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Destaques da Semana</h3>
          <div style={{ color: '#888', textAlign: 'center', paddingTop: '4rem' }}>
            Gráfico em desenvolvimento...
          </div>
        </GlassCard>

        <GlassCard>
          <h3 style={{ marginBottom: '1.5rem' }}>Top Produtos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats?.topProducts.map((product, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Package size={16} color="#888" />
                  <span style={{ fontWeight: '500' }}>{product.name}</span>
                </div>
                <span style={{ background: 'var(--sub-yellow)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700' }}>
                  {product.totalQuantity} vendidos
                </span>
              </div>
            ))}
            {stats?.topProducts.length === 0 && <p style={{ color: '#999', fontSize: '0.9rem' }}>Nenhuma venda registrada.</p>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
