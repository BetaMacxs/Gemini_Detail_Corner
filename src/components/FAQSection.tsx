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
    <section style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
          <div>
            <div style={{ position: 'sticky', top: '6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', marginBottom: '1rem' }}>
                <HelpCircle className="h-6 w-6" />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Support</span>
              </div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '1.5rem' }}>
                Common <br />
                <span style={{ color: 'var(--accent)' }}>Questions</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', lineHeight: 1.5 }}>
                Can't find what you're looking for? Contact our support team for personalized assistance.
              </p>
              <div style={{ marginTop: '2rem' }}>
                <a 
                  href="/contact" 
                  className="btn btn-outline"
                  style={{ borderRadius: '9999px', padding: '0.75rem 1.5rem', color: 'var(--accent)', borderColor: 'var(--accent)', display: 'inline-flex', alignItems: 'center' }}
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqData.map((item, index) => (
              <div 
                key={index} 
                style={{
                  border: openIndex === index ? '1px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: openIndex === index ? 'rgba(230, 0, 0, 0.05)' : 'var(--surface)',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <span style={{
                    fontSize: '1.125rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    fontStyle: 'italic',
                    letterSpacing: '-0.025em',
                    color: openIndex === index ? 'var(--accent)' : 'var(--text-primary)',
                    transition: 'color 0.3s ease'
                  }}>
                    {item.question}
                  </span>
                  <div style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: openIndex === index ? 'var(--accent)' : 'var(--bg)',
                    color: openIndex === index ? '#ffffff' : 'var(--text-secondary)',
                    border: openIndex === index ? 'none' : '1px solid var(--border)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ChevronDown 
                      style={{
                        height: '1.25rem',
                        width: '1.25rem',
                        transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }} 
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
                      <div style={{
                        padding: '0 1.5rem 1.5rem 1.5rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        paddingTop: '1rem'
                      }}>
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
