'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell, Mail, Loader2, Menu, X, LogOut,
  LayoutDashboard, GraduationCap, Users, BookOpen, PlusCircle,
  CreditCard, FileText, Video, BarChart3, User as UserIcon, LucideIcon
} from 'lucide-react';
import { userService, UserProfile } from '@/services/userService';
import GlobalSearch from '@/components/GlobalSearch';
import PageTransition from '@/components/PageTransition';

const menuItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Students', href: '/admin/students', icon: GraduationCap },
  { label: 'Instructors', href: '/admin/instructors', icon: Users },
  { label: 'Courses', href: '/admin/courses', icon: BookOpen },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Assignments', href: '/admin/assignments', icon: FileText },
  { label: 'Quizzes/Tests', href: '/admin/quizzes', icon: BookOpen },
  { label: 'Attendance', href: '/admin/attendance', icon: FileText },
  { label: 'Live Classes', href: '/admin/live-class-management', icon: Video },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Profile', href: '/admin/profile-settings', icon: UserIcon },
];

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await userService.getProfile();
        setUser(profile);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setUserLoading(false);
      }
    };
    
    if (mounted) {
      fetchUser();
    }
  }, [mounted]);

  const displayName = user?.name || 'Admin';
  const avatarUrl = user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1B8A44&color=fff&size=128`;

  const handleLogout = () => {
    userService.logout();
  };

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[#0F172A]/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Left Sidebar — mobile drawer, desktop fixed */}
      <aside
        className={`bg-white border-r border-[#E2E8F0] flex flex-col z-50
          fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:flex
          w-64 lg:w-[12.5rem]
        `}
      >
        {/* Logo */}
        <div className="relative border-b border-[#E2E8F0] lg:border-none flex items-center justify-center px-3 py-4 sm:px-4 sm:py-5 lg:px-5 lg:py-6 shrink-0">
          <div className="relative flex items-center justify-center shrink-0 transition-all duration-300 w-full h-12 sm:h-14 md:h-16 lg:h-20">
            <img
              src="/images/navbarlogo.png"
              alt="PlayFit"
              className="w-full h-full object-contain max-w-full max-h-full"
            />
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute right-4 top-4 lg:hidden p-1.5 rounded-md hover:bg-[#F1F5F9] text-[#64748B]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          {/* Navigation */}
          <nav className="px-2 sm:px-3 lg:px-3 space-y-0.5 lg:space-y-1">
            {menuItems.map((item, index) => {
              const isActive = item.href === '/admin'
                ? pathname === '/admin'
                : pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 lg:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm transition-colors ${
                    isActive
                      ? 'bg-[#F0FDF4] text-[#1B8A44] font-medium'
                      : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#1B8A44]'
                  }`}
                >
                  <item.icon size={16} className="shrink-0 sm:size-[18px]" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[12.5rem] lg:h-screen lg:overflow-y-auto no-scrollbar">
        {/* Top Header */}
        <header className="bg-white border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 py-1 lg:py-1.5 sticky top-0 z-20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-[#F1F5F9] text-[#64748B]"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              {/* Desktop collapse toggle removed */}
              <div className="hidden lg:block w-4" />
              {/* Global Search */}
              <GlobalSearch className="flex-1 max-w-4xl" />
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <button className="relative p-2 text-[#64748B] hover:text-[#1B8A44] transition-colors hidden sm:block">
                <Bell size={20} />
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#DC2626] text-white text-xs rounded-full flex items-center justify-center font-medium">3</span>
              </button>
              <button className="relative p-2 text-[#64748B] hover:text-[#1B8A44] transition-colors hidden sm:block">
                <Mail size={20} />
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#DC2626] text-white text-xs rounded-full flex items-center justify-center font-medium">2</span>
              </button>

              {/* Profile Display */}
              <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-[#E2E8F0] py-1">
                {userLoading ? (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-200 animate-pulse" />
                ) : (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover"
                  />
                )}
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-[#1E293B]">{displayName}</p>
                  <p className="text-xs text-[#64748B]">Admin</p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="sm:hidden p-2 rounded-lg border border-[#FECACA] bg-white text-[#DC2626] hover:text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#FECACA] bg-white text-[#DC2626] text-sm font-semibold hover:bg-[#FEF2F2] transition-colors"
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content with Transition */}
        <main className="flex-1 relative">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
