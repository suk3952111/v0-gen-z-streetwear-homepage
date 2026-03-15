import Link from "next/link"

type InfoPageProps = {
  title: string
  description: string
}

export function InfoPage({ title, description }: InfoPageProps) {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-24">
      <section className="px-4 md:px-8 py-16 max-w-4xl mx-auto">
        <div className="border-b-4 border-[#CCFF00] pb-4 mb-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-[#CCFF00] uppercase">{title}</h1>
        </div>
        <p className="text-[#bbbbbb] leading-relaxed text-lg mb-10">{description}</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 border-4 border-[#CCFF00] text-[#CCFF00] font-bold uppercase hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
        >
          Back Home
        </Link>
      </section>
    </main>
  )
}

