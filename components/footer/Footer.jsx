import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[var(--color-surface)] border-t border-[var(--color-border)] pt-12 pb-6 md:pt-16 md:pb-8 mt-auto">
      {/* Əsas Grid: Mobildə tək sütun və kiçik boşluqlar, ekrana görə böyüyür */}
      <div className="w-[min(1180px,calc(100%-32px))] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
        
        {/* 1. Brand Section */}
        <div className="flex flex-col gap-3 md:gap-4">
          <Link href="/" className="inline-flex items-center gap-2 font-extrabold text-xl md:text-2xl text-[var(--color-ink)] transition-transform hover:scale-[1.02]">
            <div className="relative w-8 h-8 md:w-9 md:h-9 flex items-center justify-center">
              <Image 
                src="/logo.png" 
                alt="Loopin Logo" 
                width={36} 
                height={36} 
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <span>Loopin</span>
          </Link>
          <p className="text-[var(--color-muted)] text-xs md:text-sm leading-relaxed max-w-[280px]">
            Discover events, connect with people, and create unforgettable experiences.
          </p>
          <span className="text-[10px] md:text-xs font-semibold text-[var(--color-teal)] tracking-wide uppercase">
            #LoopIntoYourCommunity
          </span>
        </div>

        {/* 2. Navigation Section (Explore) */}
        <div className="flex flex-col gap-3 md:gap-4">
          <h4 className="font-bold text-xs md:text-sm uppercase tracking-wider text-[var(--color-ink)] opacity-90">
            Explore
          </h4>
          <ul className="flex flex-col gap-2 md:gap-3 text-xs md:text-sm">
            <li>
              <Link href="/" className="text-[var(--color-muted)] hover:text-[var(--color-teal)] transition-colors duration-200">
                Home
              </Link>
            </li>
            <li>
              <Link href="/events" className="text-[var(--color-muted)] hover:text-[var(--color-teal)] transition-colors duration-200">
                Events
              </Link>
            </li>
            <li>
              <Link href="/activities" className="text-[var(--color-muted)] hover:text-[var(--color-teal)] transition-colors duration-200">
                Activities
              </Link>
            </li>
          </ul>
        </div>

        {/* 3. Contact Section */}
        <div className="flex flex-col gap-3 md:gap-4">
          <h4 className="font-bold text-xs md:text-sm uppercase tracking-wider text-[var(--color-ink)] opacity-90">
            Contact Us
          </h4>
          <ul className="flex flex-col gap-2 md:gap-3 text-xs md:text-sm text-[var(--color-muted)]">
            <li className="flex items-center gap-2.5 hover:text-[var(--color-ink)] transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-coral)] md:w-4 md:h-4">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <a href="mailto:support@loopinapp.com" className="break-all">support@loopinapp.com</a>
            </li>
            <li className="flex items-center gap-2.5 hover:text-[var(--color-ink)] transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-coral)] md:w-4 md:h-4">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <a href="tel:+994505555555">+994 50 555 55 55</a>
            </li>
            <li className="flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-coral)] md:w-4 md:h-4">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Baku, Azerbaijan</span>
            </li>
          </ul>
        </div>

        {/* 4. Social Media Section */}
        <div className="flex flex-col gap-3 md:gap-4">
          <h4 className="font-bold text-xs md:text-sm uppercase tracking-wider text-[var(--color-ink)] opacity-90">
            Follow Us
          </h4>
          <p className="text-[var(--color-muted)] text-[11px] md:text-xs">Join our growing digital community.</p>
          <div className="flex items-center gap-2.5 md:gap-3">
            {/* İkonlar mobildə w-8 h-8, desktopda w-9 h-9 olur */}
            {/* Instagram */}
            <a href="#" aria-label="Instagram" className="w-8 h-8 md:w-9 md:h-9 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-muted)] hover:text-white hover:bg-[var(--color-teal)] hover:border-[var(--color-teal)] transition-all duration-300 hover:-translate-y-1 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-[18px] md:h-[18px]">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>

            {/* LinkedIn */}
            <a href="#" aria-label="LinkedIn" className="w-8 h-8 md:w-9 md:h-9 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-muted)] hover:text-white hover:bg-[var(--color-teal)] hover:border-[var(--color-teal)] transition-all duration-300 hover:-translate-y-1 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-[18px] md:h-[18px]">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>

            {/* GitHub */}
            <a href="#" aria-label="GitHub" className="w-8 h-8 md:w-9 md:h-9 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-muted)] hover:text-white hover:bg-[var(--color-teal)] hover:border-[var(--color-teal)] transition-all duration-300 hover:-translate-y-1 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-[18px] md:h-[18px]">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                <path d="M9 18c-4.51 2-5-2-7-2"/>
              </svg>
            </a>
            
            {/* Facebook */}
            <a href="#" aria-label="Facebook" className="w-8 h-8 md:w-9 md:h-9 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-muted)] hover:text-white hover:bg-[var(--color-teal)] hover:border-[var(--color-teal)] transition-all duration-300 hover:-translate-y-1 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-[18px] md:h-[18px]">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>

      {/* 5. Bottom Footer Bar: Mobildə alt-alta mərkəzlənir, desktopda yan-yana olur */}
      <div className="w-[min(1180px,calc(100%-32px))] mx-auto border-t border-[var(--color-border)] mt-12 pt-6 md:mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] md:text-xs text-[var(--color-muted)]">
        <div className="text-center md:text-left">
          © {currentYear} Loopin. All rights reserved.
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/privacy" className="hover:text-[var(--color-ink)] transition-colors duration-200">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-[var(--color-ink)] transition-colors duration-200">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}