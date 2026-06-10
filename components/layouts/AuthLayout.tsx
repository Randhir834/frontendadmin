import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4 sm:px-0">
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-block">
            <img
              src="/images/navbarlogo.png"
              alt="PlayFit"
              className="h-12 w-auto mx-auto"
            />
          </Link>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 sm:p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
