import Link from "next/link"

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-24">
      <section className="px-4 md:px-8 py-16 max-w-3xl mx-auto">
        <div className="border-b-4 border-[#CCFF00] pb-4 mb-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-[#CCFF00] uppercase">Sign Up</h1>
        </div>
        <p className="text-[#bbbbbb] leading-relaxed text-lg mb-8">
          Sign up is available through the authentication flow. Continue to login and switch to the signup tab.
        </p>
        <Link
          href="/login?mode=signup"
          className="inline-block px-6 py-3 border-4 border-[#CCFF00] text-[#CCFF00] font-bold uppercase hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
        >
          Go To Login
        </Link>
      </section>
    </main>
  )
}

