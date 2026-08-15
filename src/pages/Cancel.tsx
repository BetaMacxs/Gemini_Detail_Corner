import { Link } from 'react-router-dom';
import { XCircle, ShoppingCart, ArrowLeft, MessageSquare, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function Cancel() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card-bg border border-white/5 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden"
      >
        {/* Subtle background element */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
        
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-8">
          <XCircle className="h-12 w-12 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-text-primary sm:text-4xl mb-4">
          Payment Cancelled
        </h1>
        
        <div className="space-y-4 mb-10">
          <p className="text-lg text-text-secondary leading-relaxed">
            Your payment session was not completed, and no funds were deducted from your account.
          </p>
          
          <div className="flex items-start gap-3 text-left p-4 bg-white/5 rounded-xl border border-white/5">
            <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-sm text-text-secondary">
              <span className="font-bold text-text-primary">Good news!</span> Your shopping cart is still exactly as you left it. You can return to checkout whenever you're ready.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/checkout" className="btn btn-primary flex items-center justify-center gap-2">
            <ShoppingCart className="h-4 w-4" /> Return to Checkout
          </Link>
          <Link to="/products" className="btn btn-outline flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Continue Shopping
          </Link>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-sm text-text-secondary mb-4">Having trouble with your payment?</p>
          <Link to="/contact" className="inline-flex items-center gap-2 text-accent hover:underline font-bold text-sm">
            <MessageSquare className="h-4 w-4" /> Contact Support for Assistance
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
