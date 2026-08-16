import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Megaphone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Announcement {
  id: string;
  title: string;
  category: string;
  visible: boolean;
}

export function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('visible', true)
          .lte('start_date', now)
          .order('created_at', { ascending: false });

        if (!error && data) {
          // Filter out expired announcements in JS for reliability
          const activeAnnouncements = data.filter(a => !a.end_date || new Date(a.end_date) >= new Date());
          setAnnouncements(activeAnnouncements);
        }
      } catch (e) {
        console.warn("Error fetching announcements:", e);
      }
    }

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [announcements]);

  if (!isVisible || announcements.length === 0) return null;

  const current = announcements[currentIndex];

  return (
    <div style={{ backgroundColor: 'var(--accent)', color: 'white', overflow: 'hidden', position: 'relative' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '2.5rem', padding: '0.25rem 2.5rem' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'center' }}
          >
            <span style={{ 
              fontSize: '10px', 
              fontWeight: 900, 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              padding: '0.15rem 0.5rem', 
              borderRadius: '9999px',
              letterSpacing: '0.05em'
            }}>
              {current.category}
            </span>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, margin: 0, letterSpacing: '0.01em' }}>
              {current.title}
            </p>
          </motion.div>
        </AnimatePresence>
        
        <button 
          onClick={() => setIsVisible(false)}
          style={{ 
            position: 'absolute', 
            right: '1rem', 
            background: 'none', 
            border: 'none', 
            color: 'white', 
            opacity: 0.7, 
            cursor: 'pointer',
            padding: '0.25rem'
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
