import React, { useEffect, useState } from 'react'
import { Outlet, createFileRoute, Link, useLocation, useRouterState } from '@tanstack/react-router'
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
} from 'lucide-react'
import { KycDashboardBanner } from '@/components/kyc/kyc-dashboard-banner'
import { DeviceTokenSync } from '@/components/auth/device-token-sync'
import { CreateCampaignButton } from '@/components/create-campaign-button'
import { WalletProvider } from '@/contexts/wallet-context'
import { useMe, useLogout } from '@/hooks/use-auth'
import { useMyKycApplication } from '@/hooks/use-kyc'
import { isKycComplete, resolveEffectiveKycStatus } from '@/lib/kyc'
import type { KycStatus } from '@/lib/kyc'
import type { KycApplication } from '@/hooks/use-kyc'

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

const CAMPAIGN_TYPE_BREADCRUMBS: Record<string, string> = {
  UGC: 'UGC',
  CPM: 'CPM Deal',
  Contest: 'Contest',
}

function getCampaignCreateBreadcrumb(pathname: string, searchStr: string) {
  if (pathname !== '/dashboard/campaigns') return null

  const params = new URLSearchParams(searchStr)
  if (params.get('action') !== 'create') return null

  const campaignType = params.get('campaign_type')
  if (campaignType && CAMPAIGN_TYPE_BREADCRUMBS[campaignType]) {
    return CAMPAIGN_TYPE_BREADCRUMBS[campaignType]
  }

  return 'Create'
}

function getBreadcrumbs(pathname: string, searchStr: string) {
  const parts = pathname.split('/').filter(Boolean)
  const crumbs =
    parts.length <= 1
      ? ['Stackd', 'Overview']
      : [
          'Stackd',
          ...parts.slice(1).map((part) =>
            part.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
          ),
        ]

  const campaignCrumb = getCampaignCreateBreadcrumb(pathname, searchStr)
  if (campaignCrumb) {
    crumbs.push(campaignCrumb)
  }

  return crumbs
}

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
  const searchStr = useRouterState({ select: (state) => state.location.searchStr })
  const { data: meData, loading: meLoading } = useMe()
  const { data: kycData, loading: kycLoading } = useMyKycApplication()
  const { logout } = useLogout()

  const user = meData?.me
  const brandName = user?.brand?.brandName ?? 'Brand'
  const userEmail = user?.email ?? ''
  const kycApplication = kycData?.myKycApplication
  const effectiveKycStatus = resolveEffectiveKycStatus(
    user?.brand?.kycStatus,
    kycApplication?.status
  )
  const shouldShowKycBanner =
    !meLoading &&
    !kycLoading &&
    Boolean(user?.brand) &&
    !isKycComplete(effectiveKycStatus)

  // Generate initials from brand name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const breadcrumbs = getBreadcrumbs(pathname, searchStr)

  return (
    <WalletProvider
      skip={
        meLoading ||
        kycLoading ||
        !user?.brand ||
        !isKycComplete(effectiveKycStatus)
      }
    >
      <DeviceTokenSync />
      <div className="fixed inset-0 flex overflow-hidden bg-[#F4F6F8] font-sans dark:bg-zinc-950">
      {/* Sidebar */}
      <aside
        className={`${
          isCollapsed ? 'w-16' : 'w-64'
        } flex h-full shrink-0 flex-col justify-between overflow-hidden border-r border-zinc-200/50 bg-[#F4F6F8] px-3 py-5 transition-all duration-300 ease-in-out dark:border-zinc-850/50 dark:bg-zinc-950`}
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
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-zinc-900">
        {/* Header */}
        <header className="h-14 border-b border-zinc-100 dark:border-zinc-850 flex items-center justify-between px-6 shrink-0 bg-white dark:bg-zinc-900">
          {/* Breadcrumb Replacement for Search */}
          <div className="flex items-center gap-2 text-[12px] font-normal text-zinc-400 dark:text-zinc-500">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <ChevronRight
                    className="h-3.5 w-3.5 shrink-0 text-zinc-300 dark:text-zinc-700"
                    aria-hidden="true"
                  />
                )}
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

        {shouldShowKycBanner && (
          <KycBanner
            status={effectiveKycStatus}
            application={kycApplication}
            pathname={pathname}
          />
        )}

        {/* Scrollable Page Outlet */}
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white p-6 dark:bg-zinc-900">
          <Outlet />
        </main>
      </div>
    </div>
    </WalletProvider>
  )
}

function KycBanner({
  status,
  application,
  pathname,
}: {
  status: KycStatus
  application?: KycApplication | null
  pathname: string
}) {
  const { refetch: refetchMe } = useMe()
  const { refetch: refetchKyc } = useMyKycApplication()

  useEffect(() => {
    void refetchMe()
    void refetchKyc()
  }, [pathname, refetchMe, refetchKyc])

  return <KycDashboardBanner status={status} application={application} />
}
