import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User, ShoppingBag } from 'lucide-react';
import { cn } from '../lib/utils';
import { useCart } from '../contexts/CartContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const { totalItems } = useCart();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Wishlist', path: '/wishlist', icon: Heart },
    { label: 'Cart', path: '/checkout', icon: ShoppingBag, badge: totalItems },
    { label: 'You', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-ivory border-t border-stone-100 z-[100] grid grid-cols-5 md:hidden h-16 safe-area-bottom">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <Link 
            key={item.path} 
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-colors relative",
              isActive ? "text-gold" : "text-stone-400"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-tighter font-black">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute top-2 right-4 bg-gold text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full leading-none font-bold">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
