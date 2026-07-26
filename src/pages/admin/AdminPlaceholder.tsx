export default function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-ivory border border-dashed border-stone-200">
      <h2 className="font-heading text-2xl text-stone-300 tracking-widest uppercase mb-4">{title}</h2>
      <p className="text-[10px] tracking-[0.3em] text-stone-400 uppercase italic">Management Interface Under Development</p>
    </div>
  );
}
