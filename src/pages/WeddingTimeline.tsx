import { Link } from 'react-router-dom';

export default function WeddingTimeline() { 
  return (
    <div className="pt-40 pb-20 px-6 min-h-[60vh] flex flex-col items-center justify-center text-center bg-ivory">
      <h1 className="font-heading text-4xl md:text-5xl text-stone-800 tracking-wider uppercase mb-4">Wedding Timeline</h1>
      <p className="font-body text-stone-500 text-sm tracking-[0.2em] uppercase mb-12">Planning your journey to I DO</p>
      <div className="divider-gold mb-12" />
      <Link to="/" className="btn-luxury">Return Home</Link>
    </div>
  );
}
