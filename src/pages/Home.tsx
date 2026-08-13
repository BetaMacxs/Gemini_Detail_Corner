import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Star, Shield, Zap, Sparkles, Droplets, Trophy, Car } from 'lucide-react';
import { useProductsStore } from '../features/products/store';
import { storeConfig } from '../config/store';

export function Home() {
  const { products, fetchProducts, isLoading } = useProductsStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const featuredProducts = products.filter(p => p.featured).slice(0, 4);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price);
  };

  return (
    <div className="bg-brand-bg">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=2000" 
            alt="Premium Detailing" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/80 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="flex items-center space-x-2 text-brand-accent mb-6">
              <div className="h-px w-8 bg-brand-accent"></div>
              <span className="text-xs font-black uppercase tracking-[0.3em]">The Art of Perfection</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-brand-text-primary leading-[0.9] tracking-tighter uppercase italic mb-8">
              Premium <br />
              <span className="text-brand-accent">Detailing</span> <br />
              Supplies
            </h1>
            <p className="text-brand-text-secondary text-xl mb-10 max-w-lg leading-relaxed">
              Elevate your car care routine with professional-grade products designed for those who demand nothing but perfection.
            </p>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link 
                to="/products" 
                className="group w-full sm:w-auto flex items-center justify-center space-x-3 px-10 py-5 bg-brand-accent text-white font-black uppercase italic tracking-wider rounded-xl hover:bg-brand-accent-hover transition-all duration-300 shadow-xl shadow-brand-accent/20"
              >
                <span>Explore Shop</span>
                <ArrowRight className="h-5 w-5 transform transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                to="/gallery" 
                className="w-full sm:w-auto flex items-center justify-center px-10 py-5 border border-brand-border text-brand-text-primary font-black uppercase italic tracking-wider rounded-xl hover:bg-brand-surface transition-all duration-300"
              >
                Our Gallery
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-12 right-12 hidden lg:flex flex-col space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="bg-brand-surface/80 backdrop-blur-md p-4 rounded-2xl border border-brand-border flex items-center space-x-4"
          >
            <div className="bg-brand-accent/20 p-3 rounded-xl">
              <Trophy className="h-6 w-6 text-brand-accent" />
            </div>
            <div>
              <div className="text-sm font-black uppercase tracking-wider">#1 Rated</div>
              <div className="text-xs text-brand-text-secondary">In Car Care 2024</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 border-y border-brand-border bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, label: "Premium Quality", desc: "Professional Grade" },
              { icon: Zap, label: "Fast Shipping", desc: "Within 24 Hours" },
              { icon: Sparkles, label: "Expert Support", desc: "Detailing Pros" },
              { icon: Droplets, label: "pH Neutral", desc: "Safe for all Finishes" }
            ].map((badge, idx) => (
              <div key={idx} className="flex items-center space-x-4">
                <badge.icon className="h-8 w-8 text-brand-accent shrink-0" />
                <div>
                  <div className="text-sm font-black uppercase tracking-wider">{badge.label}</div>
                  <div className="text-xs text-brand-text-secondary">{badge.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="flex items-center space-x-2 text-brand-accent mb-4">
                <div className="h-px w-6 bg-brand-accent"></div>
                <span className="text-xs font-black uppercase tracking-widest">Collection</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                Featured <span className="text-brand-accent">Products</span>
              </h2>
            </div>
            <Link to="/products" className="group flex items-center space-x-2 text-brand-text-secondary hover:text-brand-accent transition-colors font-bold uppercase tracking-widest text-xs">
              <span>View All Products</span>
              <ArrowRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-brand-surface border border-brand-border rounded-2xl h-96 animate-pulse"></div>
              ))
            ) : (
              featuredProducts.map((product) => (
                <motion.div 
                  key={product.id}
                  whileHover={{ y: -10 }}
                  className="group relative bg-brand-surface border border-brand-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-brand-accent/50"
                >
                  <Link to={`/product/${product.slug}`} className="block">
                    <div className="aspect-[4/5] overflow-hidden bg-brand-bg relative">
                      <img 
                        src={product.images?.[0]?.storage_path || `/${product.slug.toLowerCase()}.png`} 
                        alt={product.name}
                        className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23333333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
                          e.currentTarget.className = "h-full w-full object-contain p-12 opacity-50";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center space-x-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < 4 ? 'fill-brand-gold text-brand-gold' : 'text-brand-text-secondary/30'}`} />
                        ))}
                      </div>
                      <h3 className="text-lg font-black uppercase italic tracking-tight mb-2 group-hover:text-brand-accent transition-colors truncate">
                        {product.name}
                      </h3>
                      <div className="text-xl font-black text-brand-text-primary">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-accent/5 opacity-50"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 text-brand-accent mb-6">
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Join the Community</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-8 leading-[0.9]">
            Ready to give your car <br />
            The <span className="text-brand-accent underline decoration-4 underline-offset-8">Ultimate Shine?</span>
          </h2>
          <p className="text-brand-text-secondary text-xl mb-12 max-w-2xl mx-auto">
            Sign up for our newsletter to receive exclusive detailing tips, early access to new products, and special offers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="w-full sm:w-96 px-6 py-4 bg-brand-surface border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-accent outline-none transition-all"
            />
            <button className="w-full sm:w-auto px-10 py-4 bg-brand-accent text-white font-black uppercase italic tracking-wider rounded-xl hover:bg-brand-accent-hover transition-all duration-300">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
