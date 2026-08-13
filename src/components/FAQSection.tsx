import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What detailing products do you recommend for beginners?",
    answer: "For beginners, we recommend starting with a high-quality pH-neutral car wash shampoo, a microfiber wash mitt, and two buckets for the 'two-bucket method'. A good spray wax or quick detailer is also great for maintaining shine between deep cleans."
  },
  {
    question: "How long does shipping take?",
    answer: "Orders are typically processed within 1-2 business days. Domestic shipping usually takes 3-5 business days, depending on your location. You will receive a tracking number via email once your order has shipped."
  },
  {
    question: "Do you offer international shipping?",
    answer: "Currently, we only ship within South Africa. We are working on expanding our reach to international customers in the near future."
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for unused and unopened products. If you are not satisfied with your purchase, please contact our support team to initiate a return. Shipping costs for returns are the responsibility of the customer."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order is shipped, we will send you an email with your tracking number and a link to the courier's website where you can monitor your delivery's progress."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/3">
            <div className="sticky top-24">
              <div className="flex items-center space-x-2 text-brand-accent mb-4">
                <HelpCircle className="h-6 w-6" />
                <span className="text-sm font-bold uppercase tracking-widest">Support</span>
              </div>
              <h2 className="text-4xl font-extrabold text-brand-text-primary leading-tight mb-6">
                Common <br />
                <span className="text-brand-accent">Questions</span>
              </h2>
              <p className="text-brand-text-secondary text-lg">
                Can't find what you're looking for? Contact our support team for personalized assistance.
              </p>
              <div className="mt-8">
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 border border-brand-accent text-brand-accent font-semibold rounded-full hover:bg-brand-accent hover:text-white transition-all duration-300"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3 space-y-4">
            {faqData.map((item, index) => (
              <div 
                key={index} 
                className={`group border rounded-2xl transition-all duration-300 ${
                  openIndex === index 
                    ? 'border-brand-accent bg-brand-accent/5' 
                    : 'border-brand-border hover:border-brand-text-secondary/30 bg-black/20'
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className={`text-lg font-semibold transition-colors duration-300 ${
                    openIndex === index ? 'text-brand-accent' : 'text-brand-text-primary'
                  }`}>
                    {item.question}
                  </span>
                  <div className={`p-2 rounded-full transition-all duration-300 ${
                    openIndex === index ? 'bg-brand-accent text-white' : 'bg-brand-border text-brand-text-secondary group-hover:bg-brand-border/50'
                  }`}>
                    <ChevronDown 
                      className={`h-5 w-5 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
                    />
                  </div>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 text-brand-text-secondary leading-relaxed border-t border-brand-accent/10 pt-4">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
