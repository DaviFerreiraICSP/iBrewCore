import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  dark?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', style, dark = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`${dark ? 'glass-dark' : 'glass'} ${className}`}
      style={{ padding: '2rem', ...style }}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
