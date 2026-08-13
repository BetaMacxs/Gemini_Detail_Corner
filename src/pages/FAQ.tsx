import React from 'react';
import { FAQSection } from '../components/FAQSection';

export function FAQ() {
  return (
    <div className="bg-brand-bg min-h-screen">
      {/* Hero Header */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-accent/10 via-transparent to-transparent opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-brand-text-primary mb-6">
            How can we <span className="text-brand-accent">Help?</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-brand-text-secondary">
            Find answers to common questions about our detailing products, shipping, and more.
          </p>
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <FAQSection />
      </div>

      {/* Still Need Help? Section */}
      <div className="bg-black/40 border-y border-brand-border py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-brand-text-primary mb-4">Still have questions?</h3>
          <p className="text-brand-text-secondary mb-8">
            Our team of detailing experts is ready to help you with any specific queries you might have.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="mailto:info@detailcorner.co.za" 
              className="w-full sm:w-auto px-8 py-3 bg-brand-accent text-white font-bold rounded-xl hover:bg-brand-accent-hover transition-colors"
            >
              Email Us
            </a>
            <a 
              href="tel:0215559876" 
              className="w-full sm:w-auto px-8 py-3 border border-brand-border text-brand-text-primary font-bold rounded-xl hover:bg-brand-bg transition-colors"
            >
              Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
