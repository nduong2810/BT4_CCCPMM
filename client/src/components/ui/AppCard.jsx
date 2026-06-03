export default function AppCard({ title, subtitle, children, rightSlot }) {
  return (
    <section className="rounded-[1.75rem] border border-white/80 bg-white/95 p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100 sm:p-8">
      {(title || subtitle || rightSlot) && (
        <header className="mb-7 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h2 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h2>}
            {subtitle && <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>}
          </div>
          {rightSlot}
        </header>
      )}
      {children}
    </section>
  );
}
