import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus,
  Banknote,
  Package,
  Loader2,
  QrCode,
  X,
  ThumbsUp,
  CreditCard,
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
import GlassCard from '../components/GlassCard';
import { useSettingsStore } from '../store/settingsStore';

interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  trackStock: boolean;
  imageUrl?: string;
  category?: Category;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const LucideIconMap: Record<string, React.ReactNode> = {
  Utensils: <Utensils size={18} />,
  Coffee: <Coffee size={18} />,
  Beer: <Beer size={18} />,
  Pizza: <Pizza size={18} />,
  IceCream: <IceCream size={18} />,
  Wine: <Wine size={18} />,
  Apple: <Apple size={18} />,
  Croissant: <Croissant size={18} />,
  Dessert: <Dessert size={18} />,
  Milk: <Milk size={18} />,
  Drumstick: <Drumstick size={18} />,
  Fish: <Fish size={18} />,
  Cookie: <Cookie size={18} />,
  Beef: <Beef size={18} />,
  Cake: <Cake size={18} />,
  Sandwich: <Sandwich size={18} />,
  Tags: <Tags size={18} />
};

const POS: React.FC = () => {
  const { settings, fetchSettings } = useSettingsStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<number | 'all'>('all');
  const cartRef = useRef<HTMLDivElement>(null);
  const categoriesWrapperRef = useRef<HTMLDivElement>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'PIX'>('CASH');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isConfirmingCheckout, setIsConfirmingCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, []);

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

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 4000);
  };

  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); 
      oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioContext.currentTime + 0.1); 
      
      const volume = (settings?.audio_volume ?? 50) / 500;
      
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        if (product.trackStock && existing.quantity >= product.stock) return prevCart;
        return prevCart.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prevCart) => prevCart.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        if (item.product.trackStock && newQty > item.product.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const setExactQuantity = (productId: number, qtyString: string) => {
    const newQty = parseInt(qtyString, 10);
    if (isNaN(newQty)) {
      setCart((prevCart) => prevCart.map(item => item.product.id === productId ? { ...item, quantity: '' as unknown as number } : item));
      return;
    }
    setCart((prevCart) => prevCart.map(item => {
      if (item.product.id === productId) {
        if (newQty <= 0) return { ...item, quantity: 1 };
        if (item.product.trackStock && newQty > item.product.stock) return { ...item, quantity: item.product.stock };
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleQuantityBlur = (productId: number, currentQty: number | string) => {
    if (currentQty === '' || isNaN(Number(currentQty)) || Number(currentQty) <= 0) {
      setExactQuantity(productId, '1');
    }
  };

  const openCheckout = () => {
    setIsConfirmingCheckout(false);
    setIsCheckoutModalOpen(true);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    
    try {
      const payload = {
        items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity })),
        paymentMethod: paymentMethod,
        paymentStatus: 'PAID'
      };

      const response = await api.post('/sale', payload);
      
      if (response.status === 201 || response.status === 200) {
        playSuccessSound();
        setShowSuccessAnimation(true);
        setTimeout(() => {
          setCart([]);
          setIsCheckoutModalOpen(false);
          setShowSuccessAnimation(false);
          setTimeout(() => setIsConfirmingCheckout(false), 500);
          fetchData(); 
        }, 1500);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      showError(err.response?.data?.message || 'Erro ao processar a venda');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryTab === 'all' || p.category?.id === selectedCategoryTab;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    const aOutOfStock = a.trackStock && a.stock <= 0;
    const bOutOfStock = b.trackStock && b.stock <= 0;
    if (aOutOfStock && !bOutOfStock) return 1;
    if (!aOutOfStock && bOutOfStock) return -1;
    return 0;
  });

  return (
    <>
      <div className="animate-fade-in" style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 4.5rem)' }}>
        {/* Products Selection Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--black)' }}>PDV</h1>
          <p style={{ color: '#666' }}>Selecione os produtos para o carrinho.</p>
        </header>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
            <input 
              type="text" 
              placeholder="Buscar produtos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                paddingLeft: '48px', 
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(0,0,0,0.05)',
                borderRadius: '20px',
                height: '52px'
              }}
            />
          </div>
        </div>

        {/* Categories Tab */}
        <div 
          ref={categoriesWrapperRef} 
          style={{ 
            overflow: 'hidden', 
            marginBottom: '1.5rem', 
            width: '100%', 
            cursor: 'grab'
          }}
        >
          <style>{`.app-hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
          <motion.div 
            className="app-hide-scrollbar" 
            drag="x"
            dragConstraints={categoriesWrapperRef}
            dragElastic={0.15}
            style={{ display: 'flex', gap: '8px', width: 'max-content', padding: '4px' }}
          >
             <motion.button 
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setSelectedCategoryTab('all')}
               style={{ 
                 position: 'relative',
                 background: 'transparent',
                 color: selectedCategoryTab === 'all' ? 'white' : '#666',
                 whiteSpace: 'nowrap',
                 borderRadius: '16px',
                 padding: '10px 24px',
                 fontWeight: '800',
                 border: 'none',
                 cursor: 'pointer',
                 transition: 'color 0.3s ease'
               }}
             >
               {selectedCategoryTab === 'all' && (
                 <motion.div 
                   layoutId="pos-category-lens"
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
             {categories.map(c => (
                <motion.button 
                  key={c.id} 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategoryTab(c.id)}
                  style={{ 
                    position: 'relative',
                    background: 'transparent',
                    color: selectedCategoryTab === c.id ? 'white' : '#666',
                    whiteSpace: 'nowrap',
                    borderRadius: '16px',
                    padding: '10px 24px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.3s ease'
                  }}
                >
                  {selectedCategoryTab === c.id && (
                    <motion.div 
                      layoutId="pos-category-lens"
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
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: c.color || 'var(--blue)',
                      boxShadow: selectedCategoryTab === c.id ? `0 0 12px ${c.color || 'var(--blue)'}` : 'none',
                      transition: 'all 0.3s'
                    }} />
                    {LucideIconMap[c.icon || 'Tags']}
                    {c.name}
                  </div>
                </motion.button>
              ))}
          </motion.div>
        </div>

        <div className="app-scroll" style={{ flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <Loader2 className="animate-spin" size={40} color="var(--blue)" />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              {filteredProducts.map(p => {
                const isOutOfStock = p.trackStock && p.stock <= 0;
                const cartItem = cart.find(item => item.product.id === p.id);
                const isInCart = !!cartItem;
                
                return (
                  <motion.div 
                    key={p.id} 
                    whileHover={!isOutOfStock ? { y: -5, scale: 1.02, zIndex: 10 } : {}} 
                    whileTap={!isOutOfStock ? { scale: 0.95 } : {}}
                    onClick={() => !isOutOfStock && addToCart(p)}
                    drag={!isOutOfStock}
                    dragSnapToOrigin
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                      if (!isOutOfStock && cartRef.current) {
                        const rect = cartRef.current.getBoundingClientRect();
                        if (
                          info.point.x > rect.left && 
                          info.point.x < rect.right && 
                          info.point.y > rect.top && 
                          info.point.y < rect.bottom
                        ) {
                          addToCart(p);
                        }
                      }
                    }}
                    style={{ cursor: isOutOfStock ? 'not-allowed' : 'grab', opacity: isOutOfStock ? 0.7 : 1, filter: isOutOfStock ? 'grayscale(80%)' : 'none', position: 'relative' }}
                  >
                    <GlassCard 
                      style={{ 
                        padding: '0', 
                        overflow: 'hidden', 
                        height: '100%', 
                        borderRadius: '24px', 
                        position: 'relative', 
                        pointerEvents: 'none',
                        border: isInCart ? '3px solid var(--blue)' : '1px solid rgba(0,0,0,0.05)',
                        boxShadow: isInCart ? '0 10px 30px rgba(0,63,130,0.2)' : 'none',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {/* Quantity Badge */}
                      {isInCart && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'var(--blue)',
                            color: 'white',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '900',
                            fontSize: '1rem',
                            zIndex: 20,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            pointerEvents: 'none'
                          }}
                        >
                          {cartItem.quantity}
                        </motion.div>
                      )}

                      {/* Out of stock overlay */}
                      {isOutOfStock && (
                        <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(2px)' }}>
                          <span style={{ background: '#FF3B30', color: 'white', padding: '6px 16px', borderRadius: '12px', fontWeight: '800', fontSize: '0.9rem', transform: 'rotate(-5deg)', boxShadow: '0 4px 12px rgba(255,59,48,0.3)' }}>Esgotado</span>
                        </div>
                      )}
                      
                      <div style={{ height: '120px', background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p.imageUrl ? <img src={p.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} alt={p.name} /> : <Package size={40} color="#CCC" />}
                      </div>
                      
                      <div style={{ padding: '12px' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#333' }}>{p.name}</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                          <span style={{ fontWeight: '900', color: 'var(--blue)' }}>R$ {Number(p.price).toFixed(2)}</span>
                          {p.trackStock && <span style={{ fontSize: '0.7rem', color: isOutOfStock ? '#FF3B30' : '#888', fontWeight: '800' }}>Estoque: {p.stock}</span>}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div style={{ width: '380px', display: 'flex', flexDirection: 'column' }} ref={cartRef}>
        <GlassCard style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem', borderRadius: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              style={{ 
                width: '48px', 
                height: '48px', 
                background: 'linear-gradient(135deg, var(--blue), var(--sub-yellow))', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white',
                boxShadow: '0 8px 24px rgba(0, 63, 130, 0.25), inset 0 2px 4px rgba(255,255,255,0.4)',
                border: '1px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)', pointerEvents: 'none' }} />
              <ShoppingCart size={22} style={{ position: 'relative', zIndex: 1 }} />
            </motion.div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--black)' }}>Carrinho</h2>
          </div>

          <div className="app-scroll" style={{ flex: 1, overflowX: 'hidden' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5, fontWeight: '700' }}>Vazio</div>
            ) : (
              <AnimatePresence>
                {cart.map(item => (
                  <motion.div 
                    key={item.product.id} 
                    layout
                    initial={{ opacity: 0, x: 20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.9 }}
                    style={{ background: '#F8F9FA', padding: '12px', borderRadius: '16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '800', fontSize: '0.85rem' }}>{item.product.name}</p>
                      <p style={{ fontWeight: '900', color: 'var(--blue)' }}>R$ {(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', padding: '4px', borderRadius: '10px', border: '1px solid #EEE' }}>
                        <button onClick={() => updateQuantity(item.product.id, -1)} style={{ padding: '0', minHeight: 'auto', background: 'transparent', color: 'black', width: '24px', height: '24px', flexShrink: 0 }}><Minus size={14} /></button>
                        <input 
                          type="number" 
                          value={item.quantity === '' as unknown as number ? '' : item.quantity}
                          onChange={(e) => setExactQuantity(item.product.id, e.target.value)}
                          onBlur={(e) => handleQuantityBlur(item.product.id, e.target.value)}
                          style={{ width: '30px', textAlign: 'center', background: 'transparent', border: 'none', outline: 'none', fontWeight: '800', fontSize: '0.9rem', padding: 0 }}
                          min="1"
                        />
                        <button onClick={() => updateQuantity(item.product.id, 1)} style={{ padding: '0', minHeight: 'auto', background: 'transparent', color: 'black', width: '24px', height: '24px', flexShrink: 0 }}><Plus size={14} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id)} style={{ padding: '0', minHeight: 'auto', background: 'transparent', color: '#FF3B30' }}><Trash2 size={18} /></button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <div style={{ marginTop: '1rem', borderTop: '2px dashed #EEE', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '900', marginBottom: '1rem' }}>
              <span>Total</span>
              <span>R$ {cartTotal.toFixed(2)}</span>
            </div>
            <motion.button 
              layoutId="checkout-modal"
              className="liquid-glass" 
              style={{ width: '100%', height: '56px', borderRadius: '18px', border: 'none', color: 'white', fontWeight: '800' }}
              disabled={cart.length === 0}
              onClick={() => {
                openCheckout();
              }}
            >
              Fechar Venda
            </motion.button>
          </div>
        </GlassCard>
      </div>
    </div>

      {/* Checkout Modal */}
      {createPortal(
        <AnimatePresence>
          {isCheckoutModalOpen && (
            <div style={{ position: 'fixed', inset: 0, top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div layoutId="checkout-modal" style={{ width: '100%', maxWidth: '450px' }}>
                <GlassCard style={{ background: 'white', padding: '2.5rem', borderRadius: '32px' }}>
                  {!isConfirmingCheckout ? (
                    <>
                      <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: '800', marginBottom: '2rem' }}>Pagamento</h2>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '2rem' }}>
                        {[
                          { id: 'CASH' as const, icon: <Banknote size={24} />, label: 'Dinheiro' },
                          { id: 'CARD' as const, icon: <CreditCard size={24} />, label: 'Cartão', disabled: true },
                          { id: 'PIX' as const, icon: <QrCode size={24} />, label: 'PIX', disabled: true }
                        ].map((method) => (
                          <motion.div 
                            key={method.id}
                            whileHover={!method.disabled ? { scale: 1.05, y: -4 } : {}}
                            whileTap={!method.disabled ? { scale: 0.95 } : {}}
                            onClick={() => !method.disabled && setPaymentMethod(method.id)}
                            style={{ 
                              padding: '20px 12px', 
                              borderRadius: '24px', 
                              border: '2px solid', 
                              borderColor: paymentMethod === method.id ? 'var(--blue)' : 'rgba(0,0,0,0.05)', 
                              background: paymentMethod === method.id 
                                ? 'linear-gradient(135deg, rgba(0, 63, 130, 0.1), rgba(0, 63, 130, 0.05))' 
                                : 'rgba(255, 255, 255, 0.6)', 
                              backdropFilter: 'blur(10px)',
                              WebkitBackdropFilter: 'blur(10px)',
                              cursor: method.disabled ? 'not-allowed' : 'pointer', 
                              textAlign: 'center',
                              opacity: method.disabled ? 0.5 : 1,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '8px',
                              boxShadow: paymentMethod === method.id 
                                ? '0 12px 24px rgba(0, 63, 130, 0.15), inset 0 2px 4px rgba(255,255,255,0.8)'
                                : '0 4px 12px rgba(0,0,0,0.03)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                          >
                            {paymentMethod === method.id && (
                              <motion.div 
                                layoutId="payment-active-glow"
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  background: 'linear-gradient(135deg, transparent, rgba(255,255,255,0.4), transparent)',
                                  zIndex: 0
                                }}
                              />
                            )}
                            <div style={{ 
                              color: paymentMethod === method.id ? 'var(--blue)' : '#888',
                              position: 'relative',
                              zIndex: 1
                            }}>
                              {method.icon}
                            </div>
                            <span style={{ 
                              fontSize: '0.85rem', 
                              fontWeight: '800', 
                              color: paymentMethod === method.id ? 'var(--blue)' : '#888',
                              position: 'relative',
                              zIndex: 1 
                            }}>
                              {method.label}
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      <div style={{ background: '#F8F9FA', padding: '1.5rem', borderRadius: '20px', marginBottom: '2rem', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span style={{ color: '#666', fontWeight: '700' }}>Subtotal</span>
                          <span style={{ fontWeight: '800' }}>R$ {cartTotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #DDD', paddingTop: '10px', marginTop: '10px' }}>
                          <span style={{ fontWeight: '800' }}>Total Geral</span>
                          <span style={{ fontWeight: '900', fontSize: '1.4rem', color: 'var(--blue)' }}>R$ {cartTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                          onClick={() => setIsCheckoutModalOpen(false)} 
                          className="liquid-glass-red"
                          style={{ flex: 1, height: '54px', borderRadius: '16px' }}
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={() => setIsConfirmingCheckout(true)}
                          className="liquid-glass" 
                          style={{ flex: 2, height: '54px', background: 'var(--black)', borderRadius: '16px' }}
                        >
                          Avançar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Confirmar Venda?</h2>
                      <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>Deseja confirmar o recebimento e finalizar esta venda?</p>

                      <div style={{ background: '#F8F9FA', padding: '1.5rem', borderRadius: '20px', marginBottom: '2rem', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
                        <p style={{ fontWeight: '800', fontSize: '1rem', color: '#333', marginBottom: '8px' }}>Valor a receber</p>
                        <p style={{ fontWeight: '900', fontSize: '2rem', color: 'var(--blue)' }}>R$ {cartTotal.toFixed(2)}</p>
                        <div style={{ marginTop: '10px', display: 'inline-block', padding: '4px 12px', background: 'rgba(0,122,255,0.1)', color: 'var(--blue)', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800' }}>
                          {paymentMethod === 'CASH' ? 'Dinheiro' : paymentMethod}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                          onClick={() => setIsConfirmingCheckout(false)} 
                          disabled={isSubmitting || showSuccessAnimation} 
                          className="liquid-glass"
                          style={{ flex: 1, height: '54px', background: 'rgba(0,0,0,0.05)', color: '#333', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '16px' }}
                        >
                          Voltar
                        </button>
                        <motion.button 
                          onClick={handleCheckout} 
                          disabled={isSubmitting || showSuccessAnimation} 
                          className="liquid-glass" 
                          animate={{ 
                            background: showSuccessAnimation ? '#34C759' : 'var(--black)',
                          }}
                          transition={{ duration: 0.3 }}
                          style={{ flex: 2, height: '54px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', borderRadius: '16px', fontWeight: '800' }}
                        >
                          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 
                           showSuccessAnimation ? (
                             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                               <ThumbsUp size={20} /> Finalizada!
                             </motion.div>
                           ) : 'Finalizar'
                          }
                        </motion.button>
                      </div>
                    </>
                  )}
                </GlassCard>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Notifications */}
      {createPortal(
        <AnimatePresence>
          {errorToast && (
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: '#FF3B30', color: 'white', padding: '12px 24px', borderRadius: '12px', zIndex: 10000, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 30px rgba(255,59,48,0.3)', fontWeight: '800' }}>
              <X size={18} /> {errorToast}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </>
  );
};

export default POS;
