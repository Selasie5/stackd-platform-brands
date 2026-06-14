import React, { useState } from 'react'
import { Outlet, createFileRoute, Link, useLocation } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Megaphone,
  Trophy,
  Inbox,
  Users,
  Wallet as WalletIcon,
  MessageSquare,
  Settings as SettingsIcon,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  ChevronsUpDown,
  ChevronRight,
  Rocket,
} from 'lucide-react'
import { CreateCampaignButton } from '@/components/create-campaign-button'
import { Button } from '@/components/ui/button'
import { useMe, useLogout } from '@/hooks/use-auth'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

const topNavItems = [
  { name: 'Overview', path: '/dashboard/overview', icon: LayoutDashboard },
  { name: 'Campaigns', path: '/dashboard/campaigns', icon: Megaphone },
  { name: 'Contest board', path: '/dashboard/contest-board', icon: Trophy },
  { name: 'Submissions', path: '/dashboard/submissions', icon: Inbox },
  { name: 'Creators', path: '/dashboard/creators', icon: Users },
]

const operationsNavItems = [
  { name: 'Wallet', path: '/dashboard/wallet', icon: WalletIcon },
  { name: 'Messages', path: '/dashboard/messages', icon: MessageSquare },
]

function NavItem({
  item,
  isCollapsed,
}: {
  item: { name: string; path: string; icon: React.ElementType }
  isCollapsed: boolean
}) {
  const Icon = item.icon
  return (
    <Link
      key={item.name}
      to={item.path}
      className="group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-normal text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 hover:text-black dark:hover:text-white hover:shadow-[inset_0_1px_1px_rgba(0,0,0,0.02)] transition-all duration-150 [&.active]:bg-zinc-200/90 dark:[&.active]:bg-zinc-800/90 [&.active]:text-black dark:[&.active]:text-white [&.active]:font-medium [&.active]:shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"
      activeProps={{ className: 'active' }}
      title={isCollapsed ? item.name : undefined}
    >
      <Icon className="w-4 h-4 text-current shrink-0" />
      {!isCollapsed && <span className="flex-1">{item.name}</span>}
      {!isCollapsed && (
        <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 group-[.active]:opacity-100 group-[.active]:text-zinc-500 dark:group-[.active]:text-zinc-400 transition-opacity duration-150 shrink-0" />
      )}
    </Link>
  )
}

function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()
  const pathname = location.pathname
  const { data: meData, loading: meLoading } = useMe()
  const { logout } = useLogout()

  const user = meData?.me
  const brandName = user?.brand?.brandName ?? 'Brand'
  const userEmail = user?.email ?? ''
  const kycStatus = user?.brand?.kycStatus
  const shouldShowKycBanner =
    !meLoading && Boolean(user?.brand) && !isKycComplete(kycStatus)

  // Generate initials from brand name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Generate dynamic breadcrumbs based on the route path
  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean)
    if (parts.length <= 1) return ['Stackd', 'Overview']
    return [
      'Stackd',
      ...parts.slice(1).map((part) =>
        part
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase())
      ),
    ]
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <div className="flex h-screen w-full bg-[#F4F6F8] dark:bg-zinc-950 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${isCollapsed ? 'w-16' : 'w-64'
          } shrink-0 flex flex-col justify-between py-5 px-3 bg-[#F4F6F8] dark:bg-zinc-950 border-r border-zinc-200/50 dark:border-zinc-850/50 transition-all duration-300 ease-in-out`}
      >
        <div className="flex flex-col gap-6">
          {/* Logo Header Area */}
          <div
            className={
              isCollapsed
                ? 'flex flex-col items-center gap-2 px-1'
                : 'flex items-center justify-between px-2 h-10'
            }
          >
            {!isCollapsed ? (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  <img src="/favicon.svg" alt="Stackd Logo" className="w-8 h-8 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-100 text-[13px] tracking-tight block leading-none">
                      Stackd
                    </span>
                    <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 tracking-wider uppercase block mt-0.5">
                      Brand Platform
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-1.5 rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-600 transition-colors shrink-0"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <img src="/favicon.svg" alt="Stackd Logo" className="w-8 h-8 shrink-0" />
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-1.5 rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-600 transition-colors shrink-0"
                  aria-label="Expand sidebar"
                >
                  <PanelLeft className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Navigation Groups */}
          <div className="space-y-4">
            {/* Top Navigation Group */}
            <div className="space-y-1">
              {topNavItems.map((item) => (
                <NavItem key={item.name} item={item} isCollapsed={isCollapsed} />
              ))}
            </div>

            {/* Operations Group */}
            <div className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Operations
                </div>
              )}
              {operationsNavItems.map((item) => (
                <NavItem key={item.name} item={item} isCollapsed={isCollapsed} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer / Profile Card */}
        <div className="flex flex-col gap-2">
          {/* Settings Nav Item */}
          <div className="space-y-1">
            <NavItem
              item={{ name: 'Settings', path: '/dashboard/settings', icon: SettingsIcon }}
              isCollapsed={isCollapsed}
            />
            <button
              onClick={() => logout()}
              className="group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-normal text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 hover:text-black dark:hover:text-white hover:shadow-[inset_0_1px_1px_rgba(0,0,0,0.02)] transition-all duration-150 w-full text-left"
              title={isCollapsed ? 'Logout' : undefined}
            >
              <LogOut className="w-4 h-4 text-current shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>

          {/* Profile Badge */}
          <div className="border-t border-zinc-200/50 dark:border-zinc-800/60 pt-3 flex items-center gap-2 px-1">
            <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-850 flex items-center justify-center font-semibold text-[10px] text-zinc-650 dark:text-zinc-400 shrink-0">
              {meLoading ? '...' : getInitials(brandName)}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-normal text-zinc-750 dark:text-zinc-200 truncate">
                    {meLoading ? 'Loading...' : brandName}
                  </p>
                  <p className="text-[9px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                    {meLoading ? '' : userEmail}
                  </p>
                </div>
                <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Flush Container */}
      <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-zinc-100 dark:border-zinc-850 flex items-center justify-between px-6 shrink-0 bg-white dark:bg-zinc-900">
          {/* Breadcrumb Replacement for Search */}
          <div className="flex items-center gap-2 text-[12px] font-normal text-zinc-400 dark:text-zinc-500">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-zinc-300 dark:text-zinc-700">/</span>}
                <span
                  className={
                    idx === breadcrumbs.length - 1
                      ? 'text-zinc-800 dark:text-zinc-200 font-medium'
                      : ''
                  }
                >
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-3">
            <CreateCampaignButton />
          </div>
        </header>

        {shouldShowKycBanner && <KycBanner />}

        {/* Scrollable Page Outlet */}
        <main className="flex-1 overflow-y-auto p-6 bg-white dark:bg-zinc-900">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function isKycComplete(status?: string | null) {
  if (!status) return false

  return ['approved', 'complete', 'completed', 'verified'].includes(
    status.toLowerCase()
  )
}

function KycBanner() {
  return (
    <div className="shrink-0 bg-white px-6 pt-4 dark:bg-zinc-900">
      <section className="relative overflow-hidden rounded-lg bg-[linear-gradient(110deg,var(--primary)_0%,var(--primary)_58%,#3d80ff_100%)] px-5 py-3.5 text-white shadow-[0_1px_2px_rgba(15,23,42,0.08)]">
        <div className="pointer-events-none absolute -right-8 -top-12 h-28 w-28 rounded-full bg-white/15" />
        <div className="pointer-events-none absolute right-12 -bottom-16 h-32 w-32 rounded-full bg-white/10" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
              <Rocket className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] font-medium text-white/75">Complete your KYC</p>
              <p className="text-sm font-semibold">
                One step left. Verify your business to unlock your wallet, create campaigns,
                and start receiving creator content.
              </p>
            </div>
          </div>
          <Button
            className="h-8 rounded-md bg-white px-3 text-xs text-primary shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.35),0_1px_2px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/30 hover:bg-blue-50 hover:text-primary"
            onClick={() => {
              window.location.href = '/dashboard/kyc'
            }}
          >
            Complete KYC
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </section>
    </div>
  )
}
