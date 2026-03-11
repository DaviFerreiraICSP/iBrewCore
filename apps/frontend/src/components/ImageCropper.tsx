import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { getCroppedImg } from '../utils/cropImage';
import GlassCard from './GlassCard';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
  aspect?: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ 
  image, 
  onCropComplete, 
  onCancel,
  aspect = 1
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteInternal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
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
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100000,
        padding: '20px'
      }}
    >
      <GlassCard style={{ 
        width: '100%', 
        maxWidth: '700px', 
        height: '80vh', 
        background: '#FFFFFF', 
        borderRadius: '32px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 50px 100px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Ajustar Imagem</h2>
            <p style={{ fontSize: '0.85rem', color: '#666' }}>Arraste e ajuste o tamanho desejado.</p>
          </div>
          <button 
            onClick={onCancel}
            style={{ 
              background: 'rgba(0,0,0,0.05)', 
              border: 'none', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cropper Container */}
        <div style={{ flex: 1, position: 'relative', background: '#000' }}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteInternal}
            onZoomChange={onZoomChange}
          />
        </div>

        {/* Controls */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#666' }}>Zoom</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <ZoomOut size={16} />
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => onZoomChange(Number(e.target.value))}
                    className="zoom-range"
                    style={{ width: '100px' }}
                  />
                  <ZoomIn size={16} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#666' }}>Rotação</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <RotateCcw size={16} />
                  <input
                    type="range"
                    value={rotation}
                    min={0}
                    max={360}
                    step={1}
                    aria-labelledby="Rotation"
                    onChange={(e) => setRotation(Number(e.target.value))}
                    style={{ width: '100px' }}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', minWidth: '35px' }}>{rotation}°</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={onCancel}
              className="liquid-glass-red"
              style={{ flex: 1, height: '54px', borderRadius: '16px' }}
            >
              Cancelar
            </button>
            <button 
              onClick={handleCrop}
              className="liquid-glass"
              style={{ flex: 2, height: '54px', borderRadius: '16px' }}
            >
              Confirmar e Salvar
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default ImageCropper;
