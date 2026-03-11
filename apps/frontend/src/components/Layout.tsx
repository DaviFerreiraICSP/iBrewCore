import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  History, 
  LogOut, 
  Tags,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import logo from '../assets/IBrewWhite.png';

const Layout: React.FC = () => {
  const { t } = useTranslation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: t('sidebar.dashboard') },
    { to: '/pos', icon: <ShoppingCart size={20} />, label: t('sidebar.pos') },
    { to: '/produtos', icon: <Package size={20} />, label: t('sidebar.products') },
    { to: '/categorias', icon: <Tags size={20} />, label: t('sidebar.categories') },
    { to: '/vendas', icon: <History size={20} />, label: t('sidebar.sales') },
    { to: '/configuracoes', icon: <Settings size={20} />, label: t('sidebar.settings') },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ 
          x: 0, 
          opacity: 1,
          width: isCollapsed ? '90px' : '280px'
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="sidebar-scroll"
        style={{ 
          margin: '12px', 
          display: 'flex', 
          flexDirection: 'column',
          padding: isCollapsed ? '1.5rem 0.75rem' : '1.5rem',
          height: 'calc(100vh - 24px)',
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '28px',
          boxShadow: '0 32px 64px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(255,255,255,0.7)',
          zIndex: 10,
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative'
        }}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            position: 'absolute',
            top: '24px',
            right: isCollapsed ? '50%' : '16px',
            transform: isCollapsed ? 'translateX(50%)' : 'none',
            zIndex: 20,
            background: 'rgba(255,255,255,0.4)',
            border: '1px solid rgba(255,255,255,0.6)',
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            padding: 0,
            color: 'var(--blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: '2rem', 
          padding: '0 8px',
          opacity: isCollapsed ? 0 : 1,
          height: isCollapsed ? '20px' : 'auto',
          transition: 'all 0.3s ease',
          pointerEvents: isCollapsed ? 'none' : 'auto'
        }}>
          {!isCollapsed && (
            <img 
              src={logo} 
              alt="iBranch" 
              style={{ width: '100%', maxWidth: '200px', height: 'auto' }} 
            />
          )}
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '16px',
                textDecoration: 'none',
                color: isActive ? 'var(--blue)' : '#666',
                fontWeight: isActive ? '800' : '600',
                transition: 'all 0.3s ease',
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="active-sidebar-lens"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(20px) saturate(150%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                        borderRadius: '16px',
                        boxShadow: '0 12px 32px rgba(0, 63, 130, 0.15), inset 0 2px 4px rgba(255,255,255,0.9)',
                        zIndex: 0
                      }}
                    />
                  )}
                  <div style={{ 
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '36px',
                    height: '36px',
                    background: isActive ? 'linear-gradient(135deg, var(--blue), var(--sub-yellow))' : 'transparent',
                    color: isActive ? 'white' : 'var(--blue)', 
                    borderRadius: '12px',
                    boxShadow: isActive ? '0 4px 12px rgba(0, 63, 130, 0.2)' : 'none',
                    transition: 'all 0.3s ease',
                    flexShrink: 0
                  }}>
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ position: 'relative', zIndex: 1, whiteSpace: 'nowrap' }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1.5rem', marginTop: 'auto' }}>
          <div 
            onClick={() => navigate('/perfil')}
            style={{ 
              marginBottom: '1.5rem', 
              padding: isCollapsed ? '12px' : '12px 16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '12px',
              cursor: 'pointer',
              borderRadius: '20px',
              transition: 'background 0.2s',
              background: 'rgba(0,0,0,0.02)'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.05)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.02)')}
          >
            <div style={{ width: '44px', height: '44px', background: 'var(--blue)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 'bold', overflow: 'hidden', flexShrink: 0 }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name?.charAt(0)
              )}
            </div>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ flex: 1, overflow: 'hidden' }}
              >
                <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--black)', whiteSpace: 'nowrap' }}>{user?.name}</p>
                <p style={{ fontSize: '0.75rem', color: '#888', whiteSpace: 'nowrap' }}>{user?.role === 'ADMIN' ? 'Administrador' : 'Operador'}</p>
              </motion.div>
            )}
          </div>
          
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', 
              background: 'rgba(255, 59, 48, 0.05)', 
              color: '#FF3B30',
              padding: isCollapsed ? '12px 0' : '12px',
              boxShadow: 'none',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>{t('sidebar.logout')}</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main 
        className="app-scroll"
        style={{ 
          flex: 1, 
          height: '100vh',
          padding: isCollapsed ? '2rem 1.5rem' : '2rem 3rem',
          position: 'relative',
          transition: 'padding 0.3s ease'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial="hidden"
              animate="show"
              exit="exit"
              variants={{
                hidden: { opacity: 0 },
                show: { 
                  opacity: 1,
                  transition: { 
                    staggerChildren: 0.08,
                    delayChildren: 0.1
                  } 
                },
                exit: { opacity: 0, transition: { duration: 0.2 } }
              }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Layout;
