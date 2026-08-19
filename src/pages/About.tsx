import React from 'react';
import { motion } from 'motion/react';
import { Flag, HeartHandshake, Lightbulb, BadgeCheck } from 'lucide-react';
import { PiInstagramLogo, PiFacebookLogo, PiTiktokLogo } from 'react-icons/pi';
import { storeConfig } from '../config/store';

export function About() {
  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
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
              Our <span style={{ color: 'var(--accent)' }}>Legacy</span>
            </h1>
            <p style={{ maxWidth: '42rem', margin: '0 auto', fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Born from a passion for automotive perfection. We don't just sell products; we provide the tools for automotive mastery.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.05em', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                The <span style={{ color: 'var(--accent)' }}>Standard</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <p>Detail Corner was established with a singular vision: to bridge the gap between professional-grade detailing results and the everyday enthusiast.</p>
                <p>We spent years testing formulations, analyzing surface reactions, and refining application techniques to curate a selection of products that deliver unrivaled performance, protection, and gloss.</p>
                <div style={{ paddingTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: '0.5rem' }}>10k+</div>
                    <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)' }}>Vehicles Protected</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: '0.5rem' }}>500+</div>
                    <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)' }}>Pro Partners</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {[
                { icon: Flag, title: "Local Pride", desc: "Proudly South African. All our products are locally manufactured." },
                { icon: HeartHandshake, title: "Customer Focused", desc: "Our customers are at the heart of everything we do. We\'re here to help you succeed." },
                { icon: Lightbulb, title: "Innovation", desc: "Constantly improving and developing new solutions for car care challenges." },
                { icon: BadgeCheck, title: "Quality", desc: "We never compromise on quality. Every product is tested to meet the highest standards." }
              ].map((item, i) => (
                <div key={i} className="brand-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                  <item.icon size={32} style={{ height: '2rem', width: '2rem', color: 'var(--accent)', marginBottom: '1.5rem' }} />
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-primary)', marginBottom: '0.5rem', fontStyle: 'italic' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Team Section */}
      <section style={{ paddingBottom: '4rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.05em', color: 'var(--text-primary)' }}>
              The <span style={{ color: 'var(--accent)' }}>Core Team</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Automotive specialists dedicated to surface perfection.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            {[
              { name: "Ashley Andrews", role: "Master Detailer & Founder", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200" },
              { name: "Sarah Meyer", role: "Technical Specialist", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200" },
              { name: "David Kriel", role: "Product Development", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200" }
            ].map((member, i) => (
              <div key={i} className="brand-card" style={{ padding: '1.5rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ width: '6rem', height: '6rem', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 1.5rem auto', border: '2px solid var(--accent)' }}>
                  <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.25rem', fontStyle: 'italic', textTransform: 'uppercase' }}>{member.name}</h3>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{member.role}</p>
              </div>
            ))}
          </div>

          {/* Social Community Block */}
          <div className="brand-card" style={{ marginTop: '3.5rem', padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', background: 'radial-gradient(circle at center, var(--accent-glow) 0%, var(--surface) 80%)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Follow Our <span style={{ color: 'var(--accent)' }}>Detailing Journey</span>
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '32rem', margin: '0 auto 1.5rem auto' }}>
              Watch paint transformations, new product releases, and behind-the-scenes application techniques across our official social channels.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
              <a
                href={storeConfig.SOCIAL_INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                style={{ padding: '0.6rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}
                aria-label="Follow on Instagram"
                title="Instagram (@detail_corner2022)"
              >
                <PiInstagramLogo size={18} />
                <span>Instagram</span>
              </a>
              <a
                href={storeConfig.SOCIAL_FACEBOOK}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                style={{ padding: '0.6rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}
                aria-label="Follow on Facebook"
                title="Facebook (Detail Corner)"
              >
                <PiFacebookLogo size={18} />
                <span>Facebook</span>
              </a>
              <a
                href={storeConfig.SOCIAL_TIKTOK}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                style={{ padding: '0.6rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}
                aria-label="Follow on TikTok"
                title="TikTok (@detailcorner2022)"
              >
                <PiTiktokLogo size={18} />
                <span>TikTok</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
