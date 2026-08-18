import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ShoppingBag, PackageCheck, AlertCircle, Info, X, ArrowRight } from 'lucide-react';
import { useToastStore, ToastItem, ToastType } from '../features/toast/store';

interface ToastCardProps {
  toast: ToastItem;
  key?: React.Key;
}

function ToastCard({ toast }: ToastCardProps) {
  const removeToast = useToastStore((s) => s.removeToast);
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0 || isPaused) return;

    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, isPaused, removeToast]);

  const handleActionClick = () => {
    if (toast.action?.onClick) {
      toast.action.onClick();
    }
    if (toast.action?.href) {
      navigate(toast.action.href);
    }
    removeToast(toast.id);
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'cart':
        return <ShoppingBag className="w-5 h-5" style={{ color: 'var(--accent)' }} />;
      case 'order':
        return <PackageCheck className="w-5 h-5" style={{ color: '#22c55e' }} />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5" style={{ color: '#22c55e' }} />;
      case 'error':
        return <AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} />;
      case 'info':
      default:
        return <Info className="w-5 h-5" style={{ color: '#38bdf8' }} />;
    }
  };

  const getAccentBorder = (type: ToastType) => {
    switch (type) {
      case 'cart':
        return 'rgba(196, 30, 58, 0.4)';
      case 'order':
      case 'success':
        return 'rgba(34, 197, 94, 0.4)';
      case 'error':
        return 'rgba(239, 68, 68, 0.4)';
      case 'info':
      default:
        return 'rgba(56, 189, 248, 0.4)';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.92, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.9, y: -10, filter: 'blur(2px)' }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="status"
      aria-live="polite"
      id={`toast-${toast.id}`}
      style={{
        width: '100%',
        maxWidth: '380px',
        backgroundColor: 'rgba(24, 24, 27, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${getAccentBorder(toast.type)}`,
        borderRadius: 'var(--radius-lg, 16px)',
        boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
        padding: '1rem 1.125rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        position: 'relative',
        overflow: 'hidden',
        color: 'var(--text-primary, #ffffff)',
      }}
    >
      {/* Top row with icon, title, message & close button */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        {toast.image ? (
          <div
            style={{
              width: '2.75rem',
              height: '2.75rem',
              borderRadius: 'var(--radius-md, 10px)',
              overflow: 'hidden',
              backgroundColor: 'var(--bg, #0f0f0f)',
              border: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={toast.image}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div
            style={{
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: 'var(--radius-md, 10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {getIcon(toast.type)}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--text-primary, #ffffff)',
                letterSpacing: '-0.01em',
              }}
            >
              {toast.title}
            </span>
          </div>

          {toast.message && (
            <p
              style={{
                fontSize: '0.8125rem',
                lineHeight: 1.4,
                color: 'var(--text-secondary, #a3a3a3)',
                margin: 0,
                wordBreak: 'break-word',
              }}
            >
              {toast.message}
            </p>
          )}
        </div>

        <button
          onClick={() => removeToast(toast.id)}
          aria-label="Close notification"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary, #a3a3a3)',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: 'var(--radius-sm, 6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary, #a3a3a3)')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action button if provided */}
      {toast.action && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.125rem' }}>
          <button
            onClick={handleActionClick}
            className="btn btn-primary"
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              borderRadius: 'var(--radius-md, 8px)',
              cursor: 'pointer',
            }}
          >
            {toast.action.label}
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Auto-dismiss progress bar indicator */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: isPaused ? '100%' : '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '2px',
            backgroundColor: getAccentBorder(toast.type),
            opacity: 0.8,
          }}
        />
      )}
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      id="global-toast-container"
      style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        pointerEvents: 'none',
        maxWidth: 'calc(100vw - 2.5rem)',
        width: '380px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', pointerEvents: 'auto' }}>
        <AnimatePresence mode="sync">
          {toasts.map((item) => (
            <ToastCard key={item.id} toast={item} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
