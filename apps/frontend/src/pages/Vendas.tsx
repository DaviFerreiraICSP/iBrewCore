import React, { useEffect, useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  Banknote, 
  CreditCard, 
  QrCode,
  Package,
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import GlassCard from '../components/GlassCard';

interface SaleItem {
  id: number;
  quantity: number;
  priceAtSale: number;
  product: {
    name: string;
  };
}

interface Sale {
  id: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: SaleItem[];
  user: {
    name: string;
  };
}

const Vendas: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await api.get('/sale');
      // Sort by newest first
      setSales(response.data.sort((a: Sale, b: Sale) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (err) {
      console.error('Failed to fetch sales', err);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'CASH': return <Banknote size={16} />;
      case 'CARD': return <CreditCard size={16} />;
      case 'PIX': return <QrCode size={16} />;
      default: return <History size={16} />;
    }
  };

  const filteredSales = sales.filter(s => 
    s.id.toString().includes(searchTerm) || 
    s.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--black)', marginBottom: '0.5rem' }}>Histórico de Vendas</h1>
        <p style={{ color: '#666' }}>Acompanhe todas as transações realizadas no iBranch.</p>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
          <input 
            type="text" 
            placeholder="Buscar por ID ou Vendedor..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              paddingLeft: '48px', 
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(0,0,0,0.05)',
              borderRadius: '20px',
              height: '52px',
              width: '100%'
            }}
          />
        </div>
        <button style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '0 24px', 
          background: 'rgba(255,255,255,0.7)', 
          borderRadius: '20px',
          fontWeight: '700',
          color: '#666',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <Filter size={18} /> Filtrar
        </button>
      </div>

      <GlassCard style={{ flex: 1, padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="app-scroll" style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
             <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
               <Loader2 className="animate-spin" size={40} color="var(--blue)" />
             </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '1.5rem', fontSize: '0.85rem', fontWeight: '800', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '1.5rem', fontSize: '0.85rem', fontWeight: '800', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Data</th>
                  <th style={{ textAlign: 'left', padding: '1.5rem', fontSize: '0.85rem', fontWeight: '800', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Vendedor</th>
                  <th style={{ textAlign: 'left', padding: '1.5rem', fontSize: '0.85rem', fontWeight: '800', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Pagamento</th>
                  <th style={{ textAlign: 'left', padding: '1.5rem', fontSize: '0.85rem', fontWeight: '800', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Total</th>
                  <th style={{ textAlign: 'right', padding: '1.5rem', fontSize: '0.85rem', fontWeight: '800', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <motion.tr 
                    key={sale.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ background: 'rgba(0,0,0,0.02)' }}
                    style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer' }}
                    onClick={() => setSelectedSale(sale)}
                  >
                    <td style={{ padding: '1.5rem', fontWeight: '700', color: '#333' }}>#{sale.id}</td>
                    <td style={{ padding: '1.5rem', color: '#666', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} style={{ opacity: 0.5 }} />
                        {new Date(sale.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem', color: '#333', fontWeight: '600' }}>{sale.user?.name}</td>
                    <td style={{ padding: '1.5rem' }}>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '6px 12px', 
                        background: sale.paymentMethod === 'CASH' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(0, 122, 255, 0.1)', 
                        color: sale.paymentMethod === 'CASH' ? '#34C759' : '#007AFF', 
                        borderRadius: '10px',
                        fontSize: '0.8rem',
                        fontWeight: '800'
                      }}>
                        {getPaymentIcon(sale.paymentMethod)}
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td style={{ padding: '1.5rem', fontWeight: '900', color: 'var(--black)', fontSize: '1.1rem' }}>
                      R$ {Number(sale.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                      <button style={{ minHeight: 'auto', padding: '8px', background: 'rgba(0,0,0,0.04)', borderRadius: '10px', color: '#666' }}>
                        <Eye size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </GlassCard>

      {/* Sale Detail Modal */}
      <AnimatePresence>
        {selectedSale && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setSelectedSale(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              style={{ width: '100%', maxWidth: '500px' }}
              onClick={e => e.stopPropagation()}
            >
              <GlassCard style={{ padding: '2.5rem', background: '#FFF', borderRadius: '32px', position: 'relative' }}>
                <button 
                  onClick={() => setSelectedSale(null)}
                  style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.05)', borderRadius: '50%', padding: '8px', minHeight: 'auto' }}
                >
                  <X size={20} color="#666" />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ width: '64px', height: '64px', background: 'rgba(52, 199, 89, 0.1)', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34C759', margin: '0 auto 1rem' }}>
                    <Package size={32} />
                  </div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: '8400', color: 'var(--black)' }}>Venda #{selectedSale.id}</h2>
                  <p style={{ color: '#888', marginTop: '4px' }}>{new Date(selectedSale.createdAt).toLocaleString('pt-BR')}</p>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: '800', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Itens do Pedido</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedSale.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '24px', height: '24px', background: '#F0F0F0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800' }}>{item.quantity}x</span>
                          <span style={{ fontWeight: '700', color: '#333' }}>{item.product.name}</span>
                        </div>
                        <span style={{ color: '#666', fontWeight: '600' }}>R$ {(item.priceAtSale * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.02)', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#666', fontWeight: '600' }}>Método</span>
                    <span style={{ fontWeight: '700', color: 'var(--black)' }}>{selectedSale.paymentMethod}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #DDD', paddingTop: '12px', marginTop: '8px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--black)' }}>Total</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--blue)' }}>R$ {Number(selectedSale.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Vendas;
