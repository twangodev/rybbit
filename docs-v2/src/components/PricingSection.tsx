import Link from "next/link";

export function PricingSection() {
  return (
    <section className="py-16 md:py-24 w-full">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block bg-emerald-900/30 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium mb-4">
            Simple Pricing
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Pricing that scales with you</h2>
          <p className="mt-4 text-base md:text-xl text-neutral-300 max-w-2xl mx-auto">
            Start free and upgrade as you grow
          </p>
        </div>
        
        <div className="flex justify-center">
          <Link href="/pricing" className="text-emerald-400 hover:text-emerald-300">
            View full pricing details →
          </Link>
        </div>
      </div>
    </section>
  );
}