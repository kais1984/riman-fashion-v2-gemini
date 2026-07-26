import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

export default function NotFound() { 
  return (
    <>
      <SEOHead title="Page Not Found" noIndex />
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-ivory px-6 py-20">
        <span className="text-[200px] md:text-[280px] font-heading text-stone-100 leading-none select-none">404</span>
        <div className="-mt-16 mb-8">
          <h1 className="font-heading text-3xl md:text-5xl text-stone-800 tracking-[0.15em] uppercase mb-4">Beyond Our Collection</h1>
          <p className="font-body text-stone-400 text-sm tracking-[0.2em] uppercase max-w-md mx-auto">The page you are looking for does not exist or has been moved to a new location within our atelier.</p>
        </div>

        <div className="divider-gold mb-12" />

        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/" className="btn-luxury px-10">Return Home</Link>
          <Link to="/search" className="btn-luxury-outline px-10">Browse Collection</Link>
          <Link to="/contact" className="btn-luxury-outline px-10">Contact Atelier</Link>
        </div>
      </div>
    </>
  );
}
