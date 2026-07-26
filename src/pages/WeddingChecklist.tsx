export default function WeddingChecklist() {
  const steps = [
    { month: "12 Months Before", task: "Set your wedding date and venue." },
    { month: "11 Months Before", task: "Book your first Riman Atelier consultation." },
    { month: "9 Months Before", task: "Finalize your silhouette and fabric selection." },
    { month: "6 Months Before", task: "First fitting and embroidery details." },
    { month: "3 Months Before", task: "Accessorize with veils and headpieces." },
    { month: "1 Month Before", task: "Final fitting and secure collection." },
  ];

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 max-w-4xl">
      <div className="text-center mb-20">
        <h2 className="heading-editorial text-gold text-[10px] mb-4">The Road to I Do</h2>
        <h1 className="font-heading text-4xl md:text-5xl text-stone-800 tracking-wider mb-6">Wedding Planning Checklist</h1>
        <div className="divider-gold" />
      </div>

      <div className="space-y-12">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-8 group">
            <div className="text-right w-1/4 shrink-0">
              <span className="font-heading text-2xl text-gold/40 group-hover:text-gold transition-colors">{s.month}</span>
            </div>
            <div className="w-px bg-stone-100 relative">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gold" />
            </div>
            <div className="pb-12 border-b border-stone-50 w-full">
              <p className="font-body text-stone-700 tracking-wide leading-relaxed italic">{s.task}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
