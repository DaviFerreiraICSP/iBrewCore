import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, Tags, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import GlassCard from '../components/GlassCard';

interface Category {
  id: number;
  name: string;
  description: string;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const response = await api.get('/category');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/category', { name, description });
      setName('');
      setDescription('');
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar categoria.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    
    try {
      await api.delete(`/category/${id}`);
      fetchCategories();
    } catch (err) {
      alert('Erro ao excluir categoria. Verifique se existem produtos vinculados a ela.');
    }
  };

  return (
    <>
      <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--black)', marginBottom: '0.5rem' }}>Categorias</h1>
          <p style={{ color: '#666' }}>Organize seu cardápio e estoque por grupos.</p>
        </div>
        <div style={{ height: '56px', display: 'flex', alignItems: 'center' }}>
          {!isModalOpen && (
            <motion.button 
              layoutId="category-modal"
              onClick={() => setIsModalOpen(true)}
              className="liquid-glass" 
              style={{ width: 'auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '20px' }}
            >
              <Plus size={20} /> Nova Categoria
            </motion.button>
          )}
        </div>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 className="animate-spin" size={40} color="var(--blue)" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <AnimatePresence>
            {categories.map((category) => (
              <motion.div
                key={category.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <GlassCard style={{ padding: '1.5rem', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', background: 'rgba(0,0,0,0.03)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)' }}>
                      <Tags size={24} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleDelete(category.id)}
                        style={{ background: 'none', border: 'none', padding: '8px', color: '#FF3B30', cursor: 'pointer', borderRadius: '10px', transition: 'background 0.2s' }}
                        onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)')}
                        onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>{category.name}</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', flex: 1 }}>{category.description || 'Sem descrição definida.'}</p>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      </div>

      {/* Modal Nova Categoria */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              width: '100vw', 
              height: '100vh', 
              background: 'rgba(0,0,0,0.6)', 
              backdropFilter: 'blur(12px)',
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'flex-start',
              zIndex: 9999,
              padding: '60px 20px',
              overflowY: 'auto'
            }}
          >
            <motion.div
              layoutId="category-modal"
              style={{ width: '100%', maxWidth: '500px', marginBottom: '60px' }}
            >
              <GlassCard style={{ padding: '2.5rem', background: '#FFFFFF', boxShadow: '0 30px 100px rgba(0,0,0,0.6)', borderRadius: '32px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', textAlign: 'center' }}>Adicionar Categoria</h2>
                
                {error && (
                  <div style={{ padding: '12px', background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>Nome da Categoria</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Tags size={18} style={{ position: 'absolute', left: '14px', opacity: 0.5 }} />
                      <input 
                        type="text" 
                        placeholder="Ex: Bebidas, Sobremesas..." 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ paddingLeft: '44px', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.1)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>Descrição (Opcional)</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start' }}>
                      <Info size={18} style={{ position: 'absolute', left: '14px', top: '14px', opacity: 0.5 }} />
                      <textarea 
                        placeholder="Descreva brevemente o propósito deste grupo de produtos..." 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ 
                          paddingLeft: '44px', 
                          minHeight: '120px', 
                          width: '100%', 
                          background: 'rgba(0,0,0,0.02)', 
                          border: '1px solid rgba(0,0,0,0.08)',
                          padding: '16px 16px 16px 44px',
                          borderRadius: '16px',
                          fontSize: '0.95rem',
                          lineHeight: '1.5',
                          color: 'var(--black)',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="liquid-glass-red"
                      style={{ flex: 1, height: '54px' }}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="liquid-glass"
                      disabled={isSubmitting}
                      style={{ flex: 2, height: '54px' }}
                    >
                      {isSubmitting ? 'Salvando...' : 'Salvar Categoria'}
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Categories;
