import { useToast } from '../contexts/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const COLORS = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-rose-50 border-rose-200 text-rose-800',
  info: 'bg-stone-50 border-stone-200 text-stone-800',
};

const ICON_COLORS = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  info: 'text-stone-500',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => {
          const Icon = ICONS[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "pointer-events-auto border p-4 shadow-xl flex items-start gap-3",
                COLORS[toast.type]
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", ICON_COLORS[toast.type])} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-widest">{toast.title}</p>
                {toast.message && <p className="text-[10px] mt-0.5 opacity-70">{toast.message}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 opacity-40 hover:opacity-100 transition-opacity"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
