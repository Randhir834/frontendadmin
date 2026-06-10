import type { ReactNode } from 'react';

interface AdminAuthSplitShellProps {
  leftTitle: ReactNode;
  leftSubtitle: string;
  centered?: boolean;
  leftImage?: string;
  children: ReactNode;
}

export default function AdminAuthSplitShell({ leftTitle, leftSubtitle, centered = true, leftImage, children }: AdminAuthSplitShellProps) {
  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Mobile-only branding */}
      <div className="md:hidden bg-[#1B8A44] px-6 py-8 text-center">
        <img
          src="/images/navbarlogo.png"
          alt="PlayFit"
          className="h-12 w-auto mx-auto mb-2"
        />
        <p className="text-sm text-white/80">Admin Portal</p>
      </div>

      <div
        className={`relative w-full md:w-[55%] hidden md:flex flex-col justify-between p-6 sm:p-8 md:p-12 lg:p-16 overflow-hidden ${
          leftImage
            ? 'bg-cover bg-center bg-no-repeat bg-emerald-950'
            : 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-950'
        }`}
        style={leftImage ? { backgroundImage: `url("${leftImage}")` } : undefined}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-black/25" />

        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-md">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3 drop-shadow-lg">{leftTitle}</h2>
          <p className="text-xs sm:text-sm text-white/90 mb-6 sm:mb-8 drop-shadow">{leftSubtitle}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 sm:gap-3 mb-6 sm:mb-8 max-w-lg">
            <div className="flex items-center gap-2 sm:gap-2.5 bg-white/90 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 sm:py-2.5 shadow-lg w-full min-h-[44px] sm:min-h-[52px] h-[44px] sm:h-[52px] box-border">
              <div className="w-6 h-6 sm:w-8 sm:h-8 shrink-0 rounded-lg bg-primary-100 flex items-center justify-center">
                <svg width="12" height="12" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="#1B8A44" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                </svg>
              </div>
              <span className="min-w-0 text-xs font-medium text-text-primary text-left leading-snug line-clamp-2">Platform oversight</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5 bg-white/90 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 sm:py-2.5 shadow-lg w-full min-h-[44px] sm:min-h-[52px] h-[44px] sm:h-[52px] box-border">
              <div className="w-6 h-6 sm:w-8 sm:h-8 shrink-0 rounded-lg bg-orange-50 flex items-center justify-center">
                <svg width="12" height="12" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <span className="min-w-0 text-xs font-medium text-text-primary text-left leading-snug line-clamp-2">Users &amp; roles</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5 bg-white/90 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 sm:py-2.5 shadow-lg w-full min-h-[44px] sm:min-h-[52px] h-[44px] sm:h-[52px] box-border">
              <div className="w-6 h-6 sm:w-8 sm:h-8 shrink-0 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg width="12" height="12" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <span className="min-w-0 text-xs font-medium text-text-primary text-left leading-snug line-clamp-2">Course catalog</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5 bg-white/90 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 sm:py-2.5 shadow-lg w-full min-h-[44px] sm:min-h-[52px] h-[44px] sm:h-[52px] box-border">
              <div className="w-6 h-6 sm:w-8 sm:h-8 shrink-0 rounded-lg bg-violet-50 flex items-center justify-center">
                <svg width="12" height="12" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </div>
              <span className="min-w-0 text-xs font-medium text-text-primary text-left leading-snug line-clamp-2">Live classes</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5 bg-white/90 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 sm:py-2.5 shadow-lg w-full min-h-[44px] sm:min-h-[52px] h-[44px] sm:h-[52px] box-border">
              <div className="w-6 h-6 sm:w-8 sm:h-8 shrink-0 rounded-lg bg-pink-50 flex items-center justify-center">
                <svg width="12" height="12" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <span className="min-w-0 text-xs font-medium text-text-primary text-left leading-snug line-clamp-2">Analytics &amp; reports</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`w-full md:w-[45%] flex flex-col items-center px-4 sm:px-6 md:px-8 lg:px-14 no-scrollbar ${centered ? 'h-screen justify-center' : 'min-h-screen md:h-screen md:overflow-y-auto justify-start pt-8 sm:pt-12 md:pt-16'}`}>
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
