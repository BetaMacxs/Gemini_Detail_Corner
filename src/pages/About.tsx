import React from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Sparkles, Award } from 'lucide-react';

export function About() {
  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{ position: 'relative', paddingTop: '6rem', paddingBottom: '6rem', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)', opacity: 0.2 }} />
        <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.05em', color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1 }}>
              Our <span style={{ color: 'var(--accent)' }}>Legacy</span>
            </h1>
            <p style={{ maxWidth: '42rem', margin: '0 auto', fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Born from a passion for automotive perfection. We don't just sell products; we provide the tools for automotive mastery.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.05em', color: 'var(--text-primary)', marginBottom: '2rem' }}>
                The <span style={{ color: 'var(--accent)' }}>Standard</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <p>Detail Corner was established with a singular vision: to bridge the gap between professional-grade detailing results and the everyday enthusiast.</p>
                <p>We spent years testing formulations, analyzing surface reactions, and refining application techniques to curate a selection of products that deliver unrivaled performance, protection, and gloss.</p>
                <div style={{ paddingTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: '0.5rem' }}>10k+</div>
                    <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)' }}>Vehicles Protected</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: '0.5rem' }}>500+</div>
                    <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)' }}>Pro Partners</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {[
                { icon: Shield, title: "Protection", desc: "Military grade barriers for every surface." },
                { icon: Zap, title: "Speed", desc: "Engineered for efficient application." },
                { icon: Sparkles, title: "Gloss", desc: "Depth and clarity that turns heads." },
                { icon: Award, title: "Quality", desc: "Tested in the harshest conditions." }
              ].map((item, i) => (
                <div key={i} className="brand-card" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                  <item.icon className="h-8 w-8 text-brand-accent mb-6" style={{ height: '2rem', width: '2rem', color: 'var(--accent)', marginBottom: '1.5rem' }} />
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-primary)', marginBottom: '0.5rem', fontStyle: 'italic' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
