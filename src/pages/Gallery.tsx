import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { PiInstagramLogo, PiFacebookLogo, PiTiktokLogo } from 'react-icons/pi';
import { storeConfig } from '../config/store';

export function Gallery() {
  const defaultImages = [
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1599256621730-535171e28e50?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1597404294360-feeeda04612e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"
  ];

  const [galleryItems, setGalleryItems] = useState<string[]>(defaultImages);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadGallery() {
      let urls: string[] = [];
      try {
        const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          urls = data.map((item: any) => item.url).filter(Boolean);
        }
      } catch (e) {
        console.warn("Gallery fetch notice:", e);
      }

      try {
        const local = JSON.parse(localStorage.getItem('gallery') || '[]');
        if (local && local.length > 0) {
          const localUrls = local.map((item: any) => item.url).filter(Boolean);
          urls = Array.from(new Set([...urls, ...localUrls]));
        }
      } catch (e) {
        console.warn("Local gallery notice:", e);
      }

      if (urls.length > 0) {
        setGalleryItems(urls);
      }
    }

    loadGallery();
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              backgroundColor: 'rgba(0,0,0,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              cursor: 'zoom-out'
            }}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={selectedImage}
              alt="Detailing result full screen"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 'var(--radius-md)', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }}
            />
            <button
              style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section style={{ position: 'relative', paddingTop: '4rem', paddingBottom: '4rem', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)', opacity: 0.2 }} />
        <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.05em', color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1 }}>
              Our <span style={{ color: 'var(--accent)' }}>Gallery</span>
            </h1>
            <p style={{ maxWidth: '42rem', margin: '0 auto', fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Witness the transformation. Our gallery showcases the unrivaled depth, clarity, and protection achieved using Detail Corner's premium formulations.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {galleryItems.map((url, i) => (
            <div
              key={i}
              className="brand-card"
              style={{ aspectRatio: '16/10', overflow: 'hidden', borderRadius: 'var(--radius-lg)', cursor: 'zoom-in' }}
              onClick={() => setSelectedImage(url)}
            >
              <img
                src={url}
                alt={`Detailing result ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </div>
          ))}
        </div>

        {/* Social Video & Transformations Callout */}
        <div className="brand-card" style={{ marginTop: '3.5rem', padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Watch Full Video <span style={{ color: 'var(--accent)' }}>Transformations</span>
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '34rem', margin: '0 auto 1.5rem auto' }}>
            Catch ASMR detailing videos, ceramic coating walk-throughs, and customer rides on our TikTok and Instagram feeds.
          </p>
          <div style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
            <a
              href={storeConfig.SOCIAL_TIKTOK}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              style={{ padding: '0.6rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}
              aria-label="Detail Corner on TikTok"
              title="TikTok (@detailcorner2022)"
            >
              <PiTiktokLogo size={18} />
              <span>TikTok @detailcorner2022</span>
            </a>
            <a
              href={storeConfig.SOCIAL_INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              style={{ padding: '0.6rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}
              aria-label="Detail Corner on Instagram"
              title="Instagram (@detail_corner2022)"
            >
              <PiInstagramLogo size={18} />
              <span>Instagram @detail_corner2022</span>
            </a>
            <a
              href={storeConfig.SOCIAL_FACEBOOK}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              style={{ padding: '0.6rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}
              aria-label="Detail Corner on Facebook"
              title="Facebook (Detail Corner)"
            >
              <PiFacebookLogo size={18} />
              <span>Facebook</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
