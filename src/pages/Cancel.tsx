import { Link } from 'react-router-dom';
import { XCircle, ShoppingCart, ArrowLeft, MessageSquare, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function Cancel() {
  return (
    <div className="cancel-page">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="cancel-card"
      >
        {/* Subtle background element */}
        <div className="cancel-bg-blur" />
        
        <div className="cancel-icon-wrapper">
          <XCircle className="cancel-icon" />
        </div>
        
        <h1 className="cancel-title">
          Payment Cancelled
        </h1>
        
        <div className="cancel-content">
          <p className="cancel-text">
            Your payment session was not completed, and no funds were deducted from your account.
          </p>
          
          <div className="cancel-alert">
            <AlertCircle className="cancel-alert-icon" />
            <p className="cancel-alert-text">
              <span className="cancel-alert-text-bold">Good news!</span> Your shopping cart is still exactly as you left it. You can return to checkout whenever you're ready.
            </p>
          </div>
        </div>
        
        <div className="cancel-actions">
          <Link to="/checkout" className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
            <ShoppingCart className="cancel-btn-icon" /> Return to Checkout
          </Link>
          <Link to="/products" className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
            <ArrowLeft className="cancel-btn-icon" /> Continue Shopping
          </Link>
        </div>
        
        <div className="cancel-footer">
          <p className="cancel-footer-text">Having trouble with your payment?</p>
          <Link to="/contact" className="cancel-support-link">
            <MessageSquare className="cancel-support-icon" /> Contact Support for Assistance
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
