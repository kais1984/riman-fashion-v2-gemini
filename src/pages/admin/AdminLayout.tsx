import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Calendar, FileText, Settings, LogOut, ChevronRight, CalendarCheck, X, Images } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';

const adminNav = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { label: "Bookings", path: "/admin/bookings", icon: Calendar },
  { label: "Appointments", path: "/admin/appointments", icon: CalendarCheck },
  { label: "Content", path: "/admin/content", icon: FileText },
  { label: "Gallery", path: "/admin/gallery", icon: Images },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

function SidebarContent({ onNav }: { onNav: () => void }) {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <div className="p-6 border-b border-stone-800">
        <Link to="/" onClick={onNav} className="font-heading text-xl tracking-[0.2em] uppercase text-gold block">
          Riman Admin
        </Link>
        <p className="text-[8px] tracking-[0.3em] text-stone-500 uppercase mt-2">Boutique Management</p>
      </div>

      <nav className="flex-grow py-6 px-4 space-y-1 overflow-y-auto">
        {adminNav.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNav}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-xs tracking-widest uppercase transition-colors duration-200",
                isActive ? "bg-gold text-onyx font-bold" : "text-stone-400 hover:text-ivory hover:bg-stone-800"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-stone-800">
        <button onClick={async () => { await signOut(); navigate('/auth'); }} aria-label="Sign out"
          className="w-full flex items-center gap-3 px-4 py-3 text-xs tracking-widest uppercase text-stone-400 hover:text-rose-400 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </>
  );
}

export default function AdminLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  useEffect(() => { setMobileSidebarOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen bg-pearl">
      {/* Desktop sidebar — collapsible */}
      <aside className={cn(
        "hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 bg-onyx text-ivory z-40 transition-transform duration-300",
        desktopSidebarOpen ? "lg:translate-x-0" : "lg:-translate-x-full"
      )}>
        <SidebarContent onNav={() => {}} />
      </aside>

      {/* Mobile sidebar — drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)}>
          <div className="absolute inset-0 bg-onyx/50" />
        </div>
      )}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-onyx text-ivory flex flex-col transition-transform duration-300 lg:hidden",
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex justify-end p-4">
          <button onClick={() => setMobileSidebarOpen(false)} className="p-1 text-stone-400 hover:text-ivory" aria-label="Close sidebar">
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent onNav={() => setMobileSidebarOpen(false)} />
      </aside>

      {/* Main content — scrolls at top level so fixed children (modals) overlay sidebar correctly */}
      <main className={cn(
        "h-screen flex flex-col transition-all duration-300 overflow-y-auto",
        desktopSidebarOpen ? "lg:ml-64" : "lg:ml-0"
      )}>
        <header className="h-16 bg-ivory border-b border-stone-200 px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="p-2 lg:hidden text-stone-600 hover:text-stone-800 hover:bg-stone-100 transition-colors" aria-label="Open sidebar">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M3 9h18"/></svg>
            </button>
            <button
              onClick={() => setDesktopSidebarOpen(prev => !prev)}
              className="hidden lg:flex p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
              aria-label={desktopSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("transition-transform duration-300", desktopSidebarOpen ? "" : "rotate-180")}>
                <rect width="18" height="18" x="3" y="3" rx="2"/>
                <path d="M9 3v18"/>
                <path d="m14 9-3 3 3 3"/>
              </svg>
            </button>
            <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-stone-400">
              <span className="hidden sm:inline">Admin</span>
              <ChevronRight className="w-3 h-3 hidden sm:inline" />
              <span className="text-stone-800 font-bold truncate max-w-[200px]">{adminNav.find(n => n.path === location.pathname)?.label || 'Overview'}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-stone-800 uppercase tracking-wider">{user?.name || 'Admin'}</p>
              <p className="text-[8px] text-stone-400 uppercase tracking-widest">{user?.role === 'admin' ? 'Administrator' : 'Manager'}</p>
            </div>
            <div className="w-10 h-10 bg-ivory border border-stone-200 flex items-center justify-center text-gold font-heading font-bold text-sm">
              {(user?.name || 'R')[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}