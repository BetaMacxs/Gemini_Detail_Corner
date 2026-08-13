import React from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Sparkles, Award } from 'lucide-react';

export function About() {
  return (
    <div className="bg-brand-bg min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden border-b border-brand-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--brand-accent-glow)_0%,_transparent_70%)] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-brand-text-primary mb-6 leading-none">
                Our <span className="text-brand-accent">Legacy</span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-brand-text-secondary leading-relaxed">
                Born from a passion for automotive perfection. We don't just sell products; we provide the tools for automotive mastery.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-brand-text-primary mb-8">
                The <span className="text-brand-accent">Standard</span>
              </h2>
              <div className="space-y-6 text-brand-text-secondary leading-relaxed">
                <p>Detail Corner was established with a singular vision: to bridge the gap between professional-grade detailing results and the everyday enthusiast.</p>
                <p>We spent years testing formulations, analyzing surface reactions, and refining application techniques to curate a selection of products that deliver unrivaled performance, protection, and gloss.</p>
                <div className="pt-8 grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-4xl font-black text-brand-text-primary italic mb-2">10k+</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Vehicles Protected</div>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-brand-text-primary italic mb-2">500+</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Pro Partners</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, title: "Protection", desc: "Military grade barriers for every surface." },
                { icon: Zap, title: "Speed", desc: "Engineered for efficient application." },
                { icon: Sparkles, title: "Gloss", desc: "Depth and clarity that turns heads." },
                { icon: Award, title: "Quality", desc: "Tested in the harshest conditions." }
              ].map((item, i) => (
                <div key={i} className="bg-brand-surface border border-brand-border p-8 rounded-3xl hover:border-brand-accent/50 transition-all duration-300">
                  <item.icon className="h-8 w-8 text-brand-accent mb-6" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-brand-text-primary mb-2 italic">{item.title}</h3>
                  <p className="text-xs text-brand-text-secondary leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
