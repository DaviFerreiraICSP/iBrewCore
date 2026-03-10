import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Loader2, 
  Package, 
  Image as ImageIcon, 
  DollarSign, 
  Layers,
  Search,
  Edit2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useSettingsStore } from '../store/settingsStore';
import GlassCard from '../components/GlassCard';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  trackStock: boolean;
  imageUrl?: string;
  category?: Category;
}

const Products: React.FC = () => {
  const { settings, fetchSettings } = useSettingsStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<number | 'all'>('all');

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [trackStock, setTrackStock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [transitionId, setTransitionId] = useState<string | null>(null);
  const categoriesWrapperRef = React.useRef<HTMLDivElement>(null);

  const playSuccessSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioContext.currentTime + 0.1); // C6
    
    const volume = (settings?.audio_volume ?? 50) / 500; // Max volume 0.2 at 100%
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    if (settings?.audio_enabled) {
      playSuccessSound();
    }
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/product'),
        api.get('/category')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const productData = {
      name, 
      price: parseFloat(price), 
      description, 
      stock: parseInt(stock), 
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      imageUrl,
      trackStock
    };

    try {
      if (editingProduct) {
        await api.patch(`/product/${editingProduct.id}`, productData);
      } else {
        await api.post('/product', productData);
      }
      resetForm();
      setIsModalOpen(false);
      fetchData();
      showSuccess(editingProduct ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao processar produto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/product/${id}`);
      fetchData();
      showSuccess('Produto excluído com sucesso!');
      return true;
    } catch (err) {
      showSuccess('Erro ao excluir produto. Tente novamente.'); // Use toast for error too
      return false;
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setTransitionId(`product-${product.id}`);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setStock(product.stock?.toString() || '0');
    setCategoryId(product.category?.id?.toString() || '');
    setImageUrl(product.imageUrl || '');
    setTrackStock(product.trackStock ?? true);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingProduct(null);
    setTransitionId('new-product');
    setName('');
    setDescription('');
    setPrice('');
    setStock('0');
    setCategoryId('');
    setImageUrl('');
    setTrackStock(true);
    setError('');
    setIsDragging(false);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null); // Reset editing product state
    setTransitionId(null);
    setName('');
    setPrice('');
    setDescription('');
    setStock('0');
    setCategoryId('');
    setImageUrl('');
    setTrackStock(true);
    setError('');
    setIsDragging(false);
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsSubmitting(true);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Handle the URL from backend which starts with /uploads/
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
      setImageUrl(`${baseUrl}${res.data.url}`);
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

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryTab === 'all' || p.category?.id === selectedCategoryTab;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (p: Product) => {
    if (!p.trackStock) return { label: 'Serviço', color: '#666', bg: 'rgba(0,0,0,0.05)' };
    if (p.stock <= 0) return { label: 'Esgotado', color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.1)' };
    if (p.stock <= 10) return { label: 'Estoque Baixo', color: '#FF9500', bg: 'rgba(255, 149, 0, 0.1)' };
    return { label: 'Em Estoque', color: '#34C759', bg: 'rgba(52, 199, 89, 0.1)' };
  };

  return (
    <>
      <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--black)', marginBottom: '0.5rem' }}>Produtos</h1>
          <p style={{ color: '#666' }}>Gerencie seu inventário e precificação.</p>
        </div>
        <div style={{ height: '56px', display: 'flex', alignItems: 'center' }}>
          {(!isModalOpen || transitionId !== 'new-product') && (
            <motion.button 
              layoutId="new-product"
              onClick={handleCreateNew}
              className="liquid-glass" 
              style={{ 
                borderRadius: '20px', 
                padding: '12px 24px', 
                fontSize: '0.9rem' 
              }}
            >
              <Plus size={22} /> Novo Produto
            </motion.button>
          )}
        </div>
      </header>

      {/* Filters & Tabs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
          <input 
            type="text" 
            placeholder="Buscar produto por nome..." 
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

        <div 
          ref={categoriesWrapperRef} 
          style={{ 
            overflow: 'hidden', 
            marginBottom: '1rem', 
            width: '100%', 
            cursor: 'grab'
          }}
        >
          <motion.div 
            className="app-scroll" 
            drag="x"
            dragConstraints={categoriesWrapperRef}
            dragElastic={0.15}
            style={{ 
              display: 'flex', 
              gap: '8px', 
              width: 'max-content',
              padding: '4px'
            }}
          >
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategoryTab('all')}
              style={{ 
                position: 'relative',
                padding: '10px 24px', 
                borderRadius: '16px', 
                border: 'none', 
                background: 'transparent',
                color: selectedCategoryTab === 'all' ? 'white' : '#666',
                fontWeight: '800',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color 0.3s ease'
              }}
            >
              {selectedCategoryTab === 'all' && (
                <motion.div 
                  layoutId="product-category-lens"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(15px)',
                    WebkitBackdropFilter: 'blur(15px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255,255,255,0.2)',
                    zIndex: -1
                  }}
                />
              )}
              Todos
            </motion.button>
            {categories.map(cat => (
              <motion.button 
                key={cat.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategoryTab(cat.id)}
                style={{ 
                  position: 'relative',
                  padding: '10px 24px', 
                  borderRadius: '16px', 
                  border: 'none', 
                  background: 'transparent',
                  color: selectedCategoryTab === cat.id ? 'white' : '#666',
                  fontWeight: '800',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.3s ease'
                }}
              >
                {selectedCategoryTab === cat.id && (
                  <motion.div 
                    layoutId="product-category-lens"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0, 0, 0, 0.75)',
                      backdropFilter: 'blur(15px)',
                      WebkitBackdropFilter: 'blur(15px)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255,255,255,0.2)',
                      zIndex: -1
                    }}
                  />
                )}
                {cat.name}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 className="animate-spin" size={40} color="var(--blue)" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <AnimatePresence>
            {filteredProducts.map((p) => {
              const status = getStockStatus(p);
              return (
                <motion.div
                  key={p.id}
                  layout
                  layoutId={transitionId === `product-${p.id}` ? undefined : `product-${p.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <GlassCard style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease', cursor: 'default' }}>
                    <div style={{ height: '160px', width: '100%', background: '#F8F9FA', position: 'relative' }}>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DDD' }}>
                          <Package size={48} />
                        </div>
                      )}
                      
                      {/* Floating Category Badge */}
                      <div style={{ 
                        position: 'absolute', 
                        top: '12px', 
                        left: '12px', 
                        padding: '4px 10px', 
                        borderRadius: '8px', 
                        fontSize: '0.65rem', 
                        fontWeight: '800',
                        background: 'rgba(255,255,255,0.9)',
                        color: 'var(--blue)',
                        textTransform: 'uppercase',
                        backdropFilter: 'blur(4px)',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                      }}>
                        {p.category?.name || 'Geral'}
                      </div>

                      {/* Stock Status */}
                      <div style={{ 
                        position: 'absolute', 
                        bottom: '12px', 
                        left: '12px', 
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        fontSize: '0.65rem', 
                        fontWeight: '700',
                        background: status.bg,
                        color: status.color,
                        backdropFilter: 'blur(10px)'
                      }}>
                        {status.label}
                      </div>

                      {/* Quick Actions Overlay */}
                      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={() => handleEdit(p)}
                          style={{ 
                            background: 'rgba(255,255,255,0.9)', 
                            border: 'none', 
                            padding: '8px', 
                            borderRadius: '10px', 
                            cursor: 'pointer',
                            color: '#666',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--black)', marginBottom: '0.4rem' }}>
                        {p.name}
                      </h3>
                      
                      <p style={{ 
                        color: '#666', 
                        fontSize: '0.85rem', 
                        lineHeight: '1.5', 
                        marginBottom: '1rem', 
                        flex: 1, 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        opacity: 0.8
                      }}>
                        {p.description}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '1rem', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                           <p style={{ fontSize: '0.65rem', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Estoque</p>
                           <p style={{ fontSize: '0.85rem', fontWeight: '700', color: p.stock > 10 ? '#444' : '#FF9500' }}>
                             {p.trackStock ? p.stock : '--'}
                           </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#999', marginRight: '4px' }}>R$</span>
                          <span style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--black)', letterSpacing: '-0.5px' }}>
                            {Number(p.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      </div>

      {/* Modal Novo Produto */}
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
              layoutId={transitionId || 'modal-transform'}
              style={{ width: '100%', maxWidth: '900px', marginBottom: '60px' }}
            >
              <GlassCard style={{ padding: '3rem', background: '#FFFFFF', boxShadow: '0 50px 150px rgba(0,0,0,0.8)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.4)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                  <div style={{ width: '64px', height: '64px', background: 'var(--blue)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 10px 25px rgba(21, 101, 192, 0.3)' }}>
                    <Package color="white" size={32} />
                  </div>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--black)', marginBottom: '0.4rem' }}>
                    {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                  </h2>
                  <p style={{ color: '#666', fontSize: '1rem' }}>
                    {editingProduct ? 'Atualize as informações do seu item.' : 'Preencha os dados do item para o inventário.'}
                  </p>
                </div>

                {error && (
                  <div style={{ padding: '12px', background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  {/* Coluna Esquerda: Dados Básicos */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>Nome do Produto</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Package size={18} style={{ position: 'absolute', left: '14px', opacity: 0.5 }} />
                        <input type="text" placeholder="Ex: Café 250ml" value={name} onChange={(e) => setName(e.target.value)} required style={{ paddingLeft: '44px', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.1)' }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>Preço de Venda</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <DollarSign size={18} style={{ position: 'absolute', left: '14px', opacity: 0.5 }} />
                          <input type="number" step="0.01" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ paddingLeft: '44px', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.1)' }} />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>Estoque Inicial</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <Layers size={18} style={{ position: 'absolute', left: '14px', opacity: 0.5 }} />
                          <input type="number" placeholder="0" value={stock} onChange={(e) => setStock(e.target.value)} required style={{ paddingLeft: '44px', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.1)' }} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>Categoria</label>
                      <select 
                        value={categoryId} 
                        onChange={(e) => setCategoryId(e.target.value)} 
                        required
                        style={{ width: '100%', padding: '14px', borderRadius: '16px', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.1)', fontSize: '1rem', outline: 'none' }}
                      >
                        <option value="">Selecione uma categoria...</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>Descrição</label>
                      <textarea 
                        placeholder="Descreva as características principais, ingredientes ou diferenciais do produto..." 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        required 
                        style={{ 
                          minHeight: '130px', 
                          width: '100%', 
                          background: 'rgba(0,0,0,0.02)', 
                          border: '1px solid rgba(0,0,0,0.08)',
                          padding: '16px',
                          borderRadius: '16px',
                          fontSize: '0.95rem',
                          lineHeight: '1.5',
                          color: 'var(--black)',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  </div>

                  {/* Coluna Direita: Imagem e Visibilidade */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={onDrop}
                      onClick={() => fileInputRef.current?.click()}
                      style={{ 
                        flex: 1, 
                        minHeight: '280px', 
                        background: isDragging ? 'rgba(21, 101, 192, 0.05)' : 'rgba(0,0,0,0.02)', 
                        borderRadius: '24px', 
                        border: isDragging ? '2px solid var(--blue)' : '2px dashed rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        position: 'relative'
                      }}>
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
                      {imageUrl ? (
                        <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <>
                           <div style={{ width: '64px', height: '64px', background: 'rgba(21, 101, 192, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                             <ImageIcon size={32} color="var(--blue)" />
                           </div>
                           <p style={{ color: 'var(--blue)', fontSize: '1rem', fontWeight: '700', marginBottom: '4px' }}>
                             {isDragging ? 'Solte a imagem' : 'Selecionar Imagem'}
                           </p>
                           <p style={{ color: '#999', fontSize: '0.75rem' }}>Clique ou arraste um arquivo</p>
                        </>
                      )}
                    </div>

                    <div style={{ 
                      padding: '1.2rem', 
                      background: 'rgba(var(--blue-rgb), 0.05)', 
                      borderRadius: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={trackStock} 
                        onChange={(e) => setTrackStock(e.target.checked)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                      <div>
                        <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>Rastrear Estoque</p>
                        <p style={{ fontSize: '0.75rem', color: '#666' }}>Diminuir estoque automaticamente nas vendas.</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: 'auto', alignItems: 'center', width: '100%' }}>
                      <div style={{ minWidth: '120px' }}>
                        {editingProduct && (
                          <button 
                            type="button" 
                            onClick={() => setIsDeleteModalOpen(true)}
                            style={{ 
                              height: '56px', 
                              padding: '0 24px',
                              background: 'rgba(255, 59, 48, 0.08)', 
                              color: '#FF3B30',
                              border: 'none',
                              borderRadius: '20px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'all 0.3s'
                            }}
                          >
                            Excluir Produto
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '12px', flex: 1, justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="liquid-glass-red" style={{ padding: '0 32px', height: '56px' }}>Cancelar</button>
                        <button type="submit" className="liquid-glass" disabled={isSubmitting} style={{ padding: '0 40px', height: '56px' }}>
                          {isSubmitting ? 'Salvando...' : editingProduct ? 'Salvar Alterações' : 'Salvar Produto'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              boxShadow: '0 20px 40px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.5)',
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

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {isDeleteModalOpen && (
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
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10001,
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                width: '100%',
                maxWidth: '400px',
                background: '#FFFFFF',
                borderRadius: '28px',
                padding: '2rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                textAlign: 'center'
              }}
            >
              <div style={{ 
                width: '60px', 
                height: '60px', 
                background: 'rgba(255, 59, 48, 0.1)', 
                color: '#FF3B30', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 1.5rem' 
              }}>
                <Trash2 size={30} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1rem' }}>Excluir Produto?</h3>
              <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '2rem' }}>
                Tem certeza que deseja remover este item? Esta ação <strong style={{ color: '#FF3B30' }}>não poderá ser desfeita</strong> e o produto será apagado permanentemente.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  style={{ 
                    flex: 1, 
                    height: '50px', 
                    borderRadius: '15px', 
                    border: '1px solid #EEE', 
                    background: '#FFF', 
                    color: 'var(--black)',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={async () => {
                    if (editingProduct) {
                      const success = await handleDelete(editingProduct.id);
                      if (success) {
                        setIsDeleteModalOpen(false);
                        setIsModalOpen(false);
                      }
                    }
                  }}
                  className="liquid-glass-red"
                  style={{ flex: 1, height: '50px', borderRadius: '15px' }}
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Products;
