import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Trash2, 
  Loader2, 
  Tags, 
  Edit3, 
  Search, 
  Sparkles,
  Utensils,
  Coffee,
  Beer,
  Pizza,
  IceCream,
  Wine,
  Apple,
  Croissant,
  Dessert,
  Milk,
  Drumstick,
  Fish,
  Cookie,
  Beef,
  Cake,
  Sandwich,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import GlassCard from '../components/GlassCard';

interface Category {
  id: number;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  products?: any[];
}

const LucideIconMap: Record<string, React.ReactNode> = {
  Utensils: <Utensils size={24} />,
  Coffee: <Coffee size={24} />,
  Beer: <Beer size={24} />,
  Pizza: <Pizza size={24} />,
  IceCream: <IceCream size={24} />,
  Wine: <Wine size={24} />,
  Apple: <Apple size={24} />,
  Croissant: <Croissant size={24} />,
  Dessert: <Dessert size={24} />,
  Milk: <Milk size={24} />,
  Drumstick: <Drumstick size={24} />,
  Fish: <Fish size={24} />,
  Cookie: <Cookie size={24} />,
  Beef: <Beef size={24} />,
  Cake: <Cake size={24} />,
  Sandwich: <Sandwich size={24} />,
  Tags: <Tags size={24} />
};

const DynamicSymbol: React.FC<{ delay?: number; top?: string; left?: string; size?: string }> = ({ delay = 0, top, left, size = '100px' }) => (
  <motion.div
    animate={{ 
      y: [0, -15, 0],
      rotate: [0, 5, 0, -5, 0],
      scale: [1, 1.05, 1],
      opacity: [0.1, 0.2, 0.1]
    }}
    transition={{ 
      duration: 8, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay 
    }}
    style={{ 
      position: 'fixed',
      top,
      left,
      width: size,
      height: size,
      background: 'var(--blue)',
      filter: 'blur(50px)',
      borderRadius: '50%',
      zIndex: -1,
      pointerEvents: 'none'
    }}
  />
);

const iconOptions = Object.keys(LucideIconMap);

const colorPalette = [
  '#003f82', // Blue
  '#34C759', // Green
  '#FF9500', // Orange
  '#FF3B30', // Red
  '#AF52DE', // Purple
  '#5856D6', // Indigo
  '#FF2D55', // Pink
  '#5AC8FA', // Sky Blue
  '#1A1A1A', // Black
];

const Categories: React.FC = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [transitionId, setTransitionId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Tags');
  const [selectedColor, setSelectedColor] = useState('#003f82');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  
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

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setTransitionId(`category-${category.id}`);
      setName(category.name);
      setDescription(category.description || '');
      setSelectedIcon(category.icon || 'Tags');
      setSelectedColor(category.color || '#003f82');
    } else {
      setEditingCategory(null);
      setTransitionId('new-category');
      setName('');
      setDescription('');
      setSelectedIcon('Tags');
      setSelectedColor('#003f82');
    }
    setIsColorPickerOpen(false);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = { 
        name, 
        description, 
        icon: selectedIcon, 
        color: selectedColor 
      };
      if (editingCategory) {
        await api.patch(`/category/${editingCategory.id}`, payload);
      } else {
        await api.post('/category', payload);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao processar categoria.');
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

  const filteredIcons = useMemo(() => {
    return iconOptions.filter((icon: string) => icon.toLowerCase().includes(iconSearch.toLowerCase()));
  }, [iconSearch]);

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={{
        show: { transition: { staggerChildren: 0.05 } }
      }}
      style={{ position: 'relative' }}
    >
      <DynamicSymbol top="10%" left="5%" size="150px" delay={0} />
      <DynamicSymbol top="60%" left="85%" size="120px" delay={2} />
      <DynamicSymbol top="80%" left="20%" size="180px" delay={4} />

      <motion.header 
        variants={{
          hidden: { opacity: 0, y: -20 },
          show: { opacity: 1, y: 0 }
        }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--blue)', marginBottom: '8px' }}>
            <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Sparkles size={18} />
            </motion.div>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>{t('sidebar.categories')}</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--black)', letterSpacing: '-1.5px' }}>Gerenciar Categorias</h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>Organize seus produtos com ícones e descrições personalizadas.</p>
        </div>
        
        <motion.button 
          layoutId="new-category"
          onClick={() => openModal()}
          className="liquid-glass" 
          style={{ height: '56px', padding: '0 32px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '20px' }}
        >
          <Plus size={20} /> Nova Categoria
        </motion.button>
      </motion.header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}>
          <Loader2 className="animate-spin" size={48} color="var(--blue)" />
        </div>
      ) : (
        <motion.div 
          variants={{
            show: { transition: { staggerChildren: 0.05 } }
          }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}
        >
          <AnimatePresence>
            {categories.map((category) => (
              <motion.div
                key={category.id}
                layoutId={`category-${category.id}`}
                layout
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.95 },
                  show: { opacity: 1, y: 0, scale: 1 }
                }}
                whileHover={{ y: -8 }}
              >
                <GlassCard style={{ padding: '2rem', borderRadius: '28px', height: '100%', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.3s' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      style={{ 
                        width: '60px', height: '60px', 
                        background: `${category.color || 'var(--blue)'}10`, 
                        backdropFilter: 'blur(10px)',
                        borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        color: category.color || 'var(--blue)', border: `1px solid ${category.color || 'var(--blue)'}20`,
                        boxShadow: `0 8px 16px ${category.color || 'var(--blue)'}10`
                      }}
                    >
                      {LucideIconMap[category.icon || 'Tags'] || <Tags size={28} />}
                    </motion.div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => openModal(category)}
                        style={{ background: 'rgba(0,0,0,0.03)', border: 'none', padding: '10px', color: 'var(--blue)', cursor: 'pointer', borderRadius: '12px' }}
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id)}
                        style={{ background: 'rgba(255, 59, 48, 0.05)', border: 'none', padding: '10px', color: '#FF3B30', cursor: 'pointer', borderRadius: '12px' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '0.75rem', color: 'var(--black)' }}>{category.name}</h3>
                  <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6', flex: 1 }}>{category.description || 'Sem descrição definida.'}</p>
                  
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '0.85rem' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: category.color || 'var(--blue)' }} />
                    {category.products?.length || 0} {t('categories.linked_products')}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
      {isModalOpen && createPortal(
        <AnimatePresence mode="wait">
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
              background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              zIndex: 9999, padding: '20px'
            }}
          >
            <motion.div
              layoutId={transitionId || 'category-modal'}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              style={{ width: '100%', maxWidth: '650px' }}
            >
              <GlassCard style={{ padding: '3rem', background: '#FFFFFF', borderRadius: '40px', boxShadow: '0 50px 100px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ 
                      width: '12px', 
                      height: '40px', 
                      background: selectedColor, 
                      borderRadius: '6px',
                      boxShadow: `0 0 20px ${selectedColor}40`
                    }} />
                    <h2 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>
                      {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                    </h2>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <motion.button 
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                        style={{ 
                          background: selectedColor, 
                          border: 'none', 
                          width: '48px', 
                          height: '48px', 
                          borderRadius: '16px',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          cursor: 'pointer',
                          color: 'white',
                          boxShadow: `0 8px 20px ${selectedColor}40`,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <Palette size={22} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)', pointerEvents: 'none' }} />
                      </motion.button>

                      <AnimatePresence>
                        {isColorPickerOpen && (
                          <>
                            <div 
                              style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
                              onClick={() => setIsColorPickerOpen(false)} 
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: -10 }}
                              style={{
                                position: 'absolute',
                                top: '60px',
                                right: 0,
                                background: 'white',
                                padding: '15px',
                                borderRadius: '24px',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '12px',
                                zIndex: 100,
                                border: '1px solid rgba(0,0,0,0.05)'
                              }}
                            >
                              {colorPalette.map(color => (
                                <motion.button
                                  key={color}
                                  type="button"
                                  whileHover={{ scale: 1.2, rotate: 5 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    setSelectedColor(color);
                                    setIsColorPickerOpen(false);
                                  }}
                                  style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '12px',
                                    background: color,
                                    border: selectedColor === color ? '3px solid white' : 'none',
                                    boxShadow: selectedColor === color ? `0 0 0 2px ${color}40` : '0 4px 10px rgba(0,0,0,0.1)',
                                    cursor: 'pointer',
                                    padding: 0
                                  }}
                                />
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                
                {error && (
                  <div style={{ padding: '16px', background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30', borderRadius: '16px', marginBottom: '2rem', fontSize: '0.95rem', textAlign: 'center', fontWeight: '700' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '900', color: '#999', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px' }}>Nome</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Bebidas" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px', height: '54px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '900', color: '#999', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px' }}>Descrição</label>
                      <textarea 
                        placeholder="Breve descrição..." 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ 
                          background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', 
                          borderRadius: '16px', minHeight: '140px', padding: '16px', resize: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '900', color: '#999', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px' }}>Selecionar Ícone</label>
                    <div style={{ position: 'relative', marginBottom: '12px' }}>
                      <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                      <input 
                        type="text" 
                        placeholder="Buscar ícone..."
                        value={iconSearch}
                        onChange={(e) => setIconSearch(e.target.value)}
                        style={{ height: '44px', paddingLeft: '44px', fontSize: '0.9rem', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px' }}
                      />
                    </div>
                    
                    <div className="sidebar-scroll" style={{ 
                      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', 
                      maxHeight: '220px', overflowY: 'auto', padding: '8px', 
                      background: 'rgba(0,0,0,0.02)', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)'
                    }}>
                      {filteredIcons.map((iconName: string) => (
                        <motion.button
                          key={iconName}
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedIcon(iconName)}
                          style={{ 
                            aspectRatio: '1', borderRadius: '14px', border: '2px solid', 
                            borderColor: selectedIcon === iconName ? 'var(--blue)' : 'transparent',
                            background: selectedIcon === iconName ? 'rgba(0,102,255,0.1)' : 'white',
                            color: selectedIcon === iconName ? 'var(--blue)' : '#888',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                        >
                          {LucideIconMap[iconName]}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="liquid-glass-red" style={{ flex: 1, height: '56px', borderRadius: '18px' }}>Cancelar</button>
                    <button type="submit" className="liquid-glass" disabled={isSubmitting} style={{ flex: 2, height: '56px', borderRadius: '18px' }}>
                      {isSubmitting ? <Loader2 className="animate-spin" /> : (editingCategory ? 'Atualizar Categoria' : 'Criar Categoria')}
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
};

export default Categories;
