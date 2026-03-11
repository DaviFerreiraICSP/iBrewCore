import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Trash2, 
  Loader2, 
  Package, 
  Image as ImageIcon, 
  DollarSign, 
  Layers,
  Search,
  Pencil,
  CheckCircle2,
  ThumbsUp,
  AlertCircle,
  Filter,
  Sparkles,
  Save,
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
  Tags
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useSettingsStore } from '../store/settingsStore';
import GlassCard from '../components/GlassCard';
import ImageCropper from '../components/ImageCropper';

interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
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

const LucideIconMap: Record<string, any> = {
  Utensils: Utensils,
  Coffee: Coffee,
  Beer: Beer,
  Pizza: Pizza,
  IceCream: IceCream,
  Wine: Wine,
  Apple: Apple,
  Croissant: Croissant,
  Dessert: Dessert,
  Milk: Milk,
  Drumstick: Drumstick,
  Fish: Fish,
  Cookie: Cookie,
  Beef: Beef,
  Cake: Cake,
  Sandwich: Sandwich,
  Tags: Tags
};

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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [transitionId, setTransitionId] = useState<string | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

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

  useEffect(() => {
    if (isModalOpen || isDeleteModalOpen || !!imageToCrop) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isDeleteModalOpen, imageToCrop]);

  const hasChanges = editingProduct ? (
    name !== editingProduct.name ||
    price !== editingProduct.price.toString() ||
    description !== editingProduct.description ||
    stock !== (editingProduct.stock?.toString() || '0') ||
    categoryId !== (editingProduct.category?.id?.toString() || '') ||
    imageUrl !== (editingProduct.imageUrl || '') ||
    trackStock !== (editingProduct.trackStock ?? true)
  ) : (
    name !== '' || price !== '' || description !== '' || categoryId !== '' || imageUrl !== ''
  );

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
      setTransitionId(null);
      fetchData();
      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus('idle');
        setIsModalOpen(false);
        resetForm();
      }, 2000);
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

  const resetForm = () => {
    setEditingProduct(null);
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
    setSaveStatus('idle');
  };

  const handleCreateNew = () => {
    resetForm();
    setIsEditingMode(true);
    setTransitionId('new-product');
    setIsModalOpen(true);
  };

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setPrice(p.price.toString());
    setDescription(p.description || '');
    setStock(p.stock.toString());
    setCategoryId(p.category?.id.toString() || '');
    setImageUrl(p.imageUrl || '');
    setTrackStock(p.trackStock);
    setError('');
    setIsEditingMode(false);
    setTransitionId(`product-${p.id}`);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (file: File | Blob) => {
    const formData = new FormData();
    formData.append('file', file, 'product-image.jpg');

    try {
      setIsSubmitting(true);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Handle the URL from backend which starts with /uploads/
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
      setImageUrl(`${baseUrl}${res.data.url}`);
      setImageToCrop(null);
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
      handleFileUpload(file);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryTab === 'all' || p.category?.id === selectedCategoryTab;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
    <motion.div 
      initial="hidden"
      animate="show"
      variants={{
        show: { transition: { staggerChildren: 0.05 } }
      }}
      style={{ paddingBottom: '4rem' }}
    >
      <motion.header 
        variants={{
          hidden: { opacity: 0, y: -20 },
          show: { opacity: 1, y: 0 }
        }}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          marginBottom: '3.5rem',
          padding: '0 10px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--blue)', marginBottom: '8px' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
              <Sparkles size={18} />
            </motion.div>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>iBranch Inventory</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--black)', letterSpacing: '-1.5px' }}>Produtos</h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>Gerencie seu inventário com precisão e estilo.</p>
        </div>
        
        {(!isModalOpen || transitionId !== 'new-product') && (
          <motion.button 
            layoutId="new-product"
            onClick={handleCreateNew}
            className="liquid-glass" 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ 
              height: '56px',
              borderRadius: '20px', 
              padding: '0 32px', 
              fontSize: '0.95rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Plus size={22} /> Novo Produto
          </motion.button>
        )}
      </motion.header>

      {/* Filters & Search - Premium Row */}
      <motion.div 
        variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0 }
        }}
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr auto', 
          gap: '1.5rem', 
          marginBottom: '3rem',
          alignItems: 'center'
        }}
      >
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, color: 'var(--blue)' }} />
          <input 
            type="text" 
            placeholder="O que você está procurando?" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              paddingLeft: '56px', 
              background: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(0,0,0,0.05)',
              borderRadius: '24px',
              height: '64px',
              width: '100%',
              fontSize: '1rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.target.style.boxShadow = '0 15px 40px rgba(21, 101, 192, 0.1)'}
            onBlur={(e) => e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)'}
          />
        </div>

        <GlassCard style={{ padding: '8px', borderRadius: '24px', display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', borderRight: '1px solid rgba(0,0,0,0.05)' }}>
            <Filter size={18} color="var(--blue)" />
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Categorias</span>
          </div>
          <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingRight: '8px', maxWidth: '500px' }} className="app-scroll-hide">
            {[ { id: 'all', name: 'Todos' }, ...categories].map(cat => (
              <motion.button 
                key={cat.id}
                onClick={() => setSelectedCategoryTab(cat.id as any)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: '16px', 
                  border: 'none', 
                  background: selectedCategoryTab === cat.id ? 'var(--blue)' : 'transparent',
                  color: selectedCategoryTab === cat.id ? 'white' : '#666',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s'
                }}
              >
                {cat.name}
              </motion.button>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 className="animate-spin" size={40} color="var(--blue)" />
        </div>
      ) : (
        <motion.div 
          variants={{
            show: { transition: { staggerChildren: 0.05 } }
          }}
          initial="hidden"
          animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((p) => {
              const isOutOfStock = p.trackStock && p.stock <= 0;
              
              return (
                <motion.div
                  key={p.id}
                  layout
                  layoutId={transitionId === `product-${p.id}` ? undefined : `product-${p.id}`}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                    show: { opacity: 1, y: 0, scale: 1 }
                  }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                >
                  <GlassCard style={{ 
                    overflow: 'hidden', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: '28px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                    background: 'rgba(255,255,255,0.7)',
                    transition: 'box-shadow 0.3s ease'
                  }}>
                    <div 
                      onClick={() => handleEdit(p)}
                      style={{ cursor: 'pointer', height: '140px', width: '100%', background: '#F0F2F5', position: 'relative', overflow: 'hidden' }}
                    >
                      {p.imageUrl ? (
                        <motion.img 
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                          src={p.imageUrl} 
                          alt={p.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CCD1D9' }}>
                          <Package size={56} strokeWidth={1.5} />
                        </div>
                      )}

                      {/* Ultra-Glassy Category Badge - Minimalist */}
                      <div style={{ 
                        position: 'absolute', 
                        top: '10px', 
                        left: '10px', 
                        padding: '4px 8px', 
                        borderRadius: '8px', 
                        fontSize: '0.6rem', 
                        fontWeight: '900',
                        background: 'rgba(255,255,255,0.7)',
                        color: p.category?.color || 'var(--blue)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        zIndex: 10
                      }}>
                        {p.category?.icon && LucideIconMap[p.category.icon] && (
                          React.createElement(LucideIconMap[p.category.icon], { size: 10, strokeWidth: 3 })
                        )}
                        {p.category?.name || 'Geral'}
                      </div>


                      {/* Gradient Overlay for better text readability if needed */}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.02) 100%)', pointerEvents: 'none' }} />
                    </div>

                    <div 
                      onClick={() => handleEdit(p)}
                      style={{ padding: '0.8rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', cursor: 'pointer' }}
                    >
                      <div style={{ marginBottom: '0.2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--black)', marginBottom: '0.2rem', letterSpacing: '-0.5px' }}>
                          {p.name}
                        </h3>
                        {p.description && (
                          <p style={{ 
                            color: '#718096', 
                            fontSize: '0.8rem', 
                            lineHeight: '1.4', 
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            marginBottom: '0.5rem'
                          }}>
                            {p.description}
                          </p>
                        )}
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginTop: 'auto',
                        paddingTop: '0.8rem',
                        borderTop: '1px solid rgba(0,0,0,0.04)'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                           <p style={{ fontSize: '0.6rem', color: '#A0AEC0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Estoque</p>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                             <span style={{ fontSize: '1rem', fontWeight: '900', color: isOutOfStock ? '#FF3B30' : '#2D3748' }}>
                               {p.trackStock ? p.stock : '--'}
                             </span>
                             {isOutOfStock && (
                               <motion.div
                                 animate={{ 
                                   scale: [1, 1.2, 1],
                                   rotate: [0, -10, 10, -10, 0]
                                 }}
                                 transition={{ 
                                   duration: 0.5, 
                                   repeat: Infinity, 
                                   repeatDelay: 1 
                                 }}
                               >
                                 <AlertCircle size={14} color="#FF3B30" />
                               </motion.div>
                             )}
                           </div>
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '0.6rem', color: '#A0AEC0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Preço</p>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--blue)' }}>R$</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: '950', color: 'var(--black)', letterSpacing: '-0.5px' }}>
                              {Number(p.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      </motion.div>

      {/* Modal Novo Produto */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              key="product-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                width: '100vw', 
                height: '100vh', 
                background: 'rgba(0,0,0,0.85)', 
                backdropFilter: 'blur(20px)',
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
                style={{ width: '100%', maxWidth: isEditingMode ? '900px' : '650px', marginBottom: '60px' }}
              >
                <GlassCard style={{ padding: '3rem', background: '#FFFFFF', boxShadow: '0 50px 150px rgba(0,0,0,0.8)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.4)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', position: 'relative' }}>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsModalOpen(false)}
                      style={{ position: 'absolute', right: '-10px', top: '-10px', background: 'rgba(0,0,0,0.05)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
                    </motion.button>

                    <div style={{ width: '56px', height: '56px', background: 'var(--blue)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 10px 25px rgba(21, 101, 192, 0.3)' }}>
                      <Package color="white" size={28} />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--black)', marginBottom: '0.4rem', letterSpacing: '-1px' }}>
                      {editingProduct ? (isEditingMode ? 'Editar Produto' : 'Detalhes do Produto') : 'Novo Produto'}
                    </h2>
                    <p style={{ color: '#666', fontSize: '1rem' }}>
                      {editingProduct 
                        ? (isEditingMode ? 'Refine os detalhes e mantenha seu catálogo atualizado.' : 'Visualize as informações do seu produto.') 
                        : 'Dê o primeiro passo para expandir seu inventário.'}
                    </p>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{ padding: '16px', background: 'rgba(255, 59, 48, 0.08)', color: '#FF3B30', borderRadius: '16px', marginBottom: '2.5rem', textAlign: 'center', fontWeight: '800', border: '1px solid rgba(255,59,48,0.2)' }}>
                      {error}
                    </motion.div>
                  )}

                  {!isEditingMode && editingProduct ? (
                    /* VIEW MODE */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      <div style={{ 
                        height: '350px', 
                        width: '100%', 
                        background: '#F8FAFC', 
                        borderRadius: '24px', 
                        overflow: 'hidden',
                        border: '1px solid rgba(0,0,0,0.05)',
                        position: 'relative'
                      }}>
                        {imageUrl ? (
                          <img src={imageUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E0' }}>
                            <Package size={80} strokeWidth={1} />
                          </div>
                        )}
                        <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
                           <div style={{ 
                             padding: '6px 14px', 
                             borderRadius: '12px', 
                             background: 'rgba(255,255,255,0.9)', 
                             backdropFilter: 'blur(10px)',
                             border: '1px solid rgba(255,255,255,0.5)',
                             fontSize: '0.75rem', 
                             fontWeight: '900', 
                             color: editingProduct.category?.color || 'var(--blue)',
                             textTransform: 'uppercase',
                             letterSpacing: '1px',
                             display: 'flex',
                             alignItems: 'center',
                             gap: '6px',
                             boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                           }}>
                             {editingProduct.category?.icon && LucideIconMap[editingProduct.category.icon] && (
                               React.createElement(LucideIconMap[editingProduct.category.icon], { size: 14, strokeWidth: 3 })
                             )}
                             {editingProduct.category?.name || 'Geral'}
                           </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Informações</label>
                          <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--black)', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>{name}</h3>
                          <p style={{ color: '#718096', fontSize: '1rem', lineHeight: '1.6' }}>{description || 'Sem descrição disponível.'}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', background: '#F8FAFC', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.02)' }}>
                            <div>
                              <p style={{ fontSize: '0.65rem', color: '#A0AEC0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Estoque Atual</p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '1.8rem', fontWeight: '950', color: (trackStock && parseInt(stock) <= 0) ? '#FF3B30' : 'var(--black)' }}>{trackStock ? stock : '--'}</span>
                                {trackStock && parseInt(stock) <= 0 && <AlertCircle size={24} color="#FF3B30" className="animate-pulse" />}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ fontSize: '0.65rem', color: '#A0AEC0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Preço</p>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', justifyContent: 'flex-end' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--blue)' }}>R$</span>
                                <span style={{ fontSize: '1.8rem', fontWeight: '950', color: 'var(--black)' }}>{Number(price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '15px' }}>
                             <motion.button 
                               whileHover={{ scale: 1.02 }}
                               whileTap={{ scale: 0.98 }}
                               onClick={() => setIsEditingMode(true)}
                               className="liquid-glass"
                               style={{ flex: 1, height: '64px', borderRadius: '20px', fontWeight: '900', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                             >
                               <Pencil size={20} strokeWidth={3} /> Editar Produto
                             </motion.button>
                             <motion.button 
                               whileHover={{ scale: 1.05 }}
                               whileTap={{ scale: 0.95 }}
                               onClick={() => setIsModalOpen(false)}
                               style={{ width: '64px', height: '64px', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A5568', cursor: 'pointer' }}
                             >
                               <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
                             </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* EDIT MODE */
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
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
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>Estoque Atual</label>
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
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Descrição</label>
                          <textarea 
                            placeholder="Descreva as características principais..." 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            required 
                            style={{ 
                              minHeight: '140px', 
                              width: '100%', 
                              background: 'rgba(0,0,0,0.03)', 
                              border: '1px solid rgba(0,0,0,0.05)',
                              padding: '16px',
                              borderRadius: '20px',
                              fontSize: '1rem',
                              lineHeight: '1.6',
                              color: 'var(--black)',
                              resize: 'none'
                            }}
                          />
                        </div>
                      </div>

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
                            onChange={handleSelectFile}
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

                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', marginTop: 'auto', alignItems: 'center', width: '100%' }}>
                          <div>
                            {editingProduct && (
                              <motion.button 
                                type="button" 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsDeleteModalOpen(true)}
                                style={{ 
                                  height: '56px', 
                                  padding: '0 24px',
                                  background: 'transparent', 
                                  color: '#FF3B30',
                                  border: '2px solid rgba(255, 59, 48, 0.2)',
                                  borderRadius: '20px',
                                  fontWeight: '900',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}
                              >
                                <Trash2 size={20} /> Excluir
                              </motion.button>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="button" onClick={() => editingProduct ? setIsEditingMode(false) : setIsModalOpen(false)} className="liquid-glass-red" style={{ padding: '0 30px', height: '60px', borderRadius: '20px', fontWeight: '900' }}>
                              {editingProduct ? 'Voltar' : 'Cancelar'}
                            </button>
                            <motion.button 
                              type="submit" 
                              disabled={isSubmitting || (!hasChanges && saveStatus === 'idle')} 
                              className={saveStatus === 'success' ? "" : "liquid-glass"}
                              animate={saveStatus === 'success' ? { backgroundColor: '#34C759', scale: [1, 1.05, 1] } : {}}
                              style={{ 
                                padding: '0 45px', 
                                height: '60px', 
                                borderRadius: '20px',
                                background: saveStatus === 'success' ? '#34C759' : undefined,
                                color: 'white',
                                fontWeight: '900',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                minWidth: '220px',
                                justifyContent: 'center',
                                opacity: (!hasChanges && saveStatus === 'idle') ? 0.5 : 1,
                                cursor: (!hasChanges && saveStatus === 'idle') ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {isSubmitting ? (
                                <Loader2 size={22} className="animate-spin" />
                              ) : saveStatus === 'success' ? (
                                <><ThumbsUp size={22} /> Salvo</>
                              ) : (
                                <><Save size={22} /> {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}</>
                              )}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
                </GlassCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

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
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', background: 'var(--black)', color: 'white', padding: '16px 32px', borderRadius: '20px', zIndex: 10001, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '800' }}
          >
            <CheckCircle2 color="#34C759" size={20} />
            {successToast}
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
                  className="liquid-glass-red"
                  style={{ 
                    flex: 1, 
                    height: '50px', 
                    borderRadius: '15px' 
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
