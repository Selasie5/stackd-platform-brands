import { createFileRoute } from '@tanstack/react-router'
import {
  Calendar,
  DollarSign,
  Edit3,
  Info,
  Maximize2,
  MoreHorizontal,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/overview')({
  component: OverviewPage,
})

function OverviewPage() {
  const currentDate = formatDashboardDate(new Date())

  return (
    <div className="space-y-5 text-zinc-950">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.03em]">Hey, Fikri</h1>
          <p className="mt-1 text-xs text-zinc-500">{currentDate}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DashboardPill icon={Calendar}>This Month</DashboardPill>
          <DashboardPill icon={RefreshCw}>Compare: Last Month</DashboardPill>
          <DashboardPill icon={Edit3}>Edit Widget</DashboardPill>
        </div>
      </div>

      <section className="grid overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          label="Sales performance"
          value="$23,127"
          delta="+12%"
        />
        <StatCard icon={DollarSign} label="Total Sales" value="1,849" delta="+3%" />
        <StatCard
          icon={ShoppingBag}
          label="Average Revenue"
          value="$15,239"
          delta="+8%"
        />
        <StatCard
          icon={Package}
          label="Average Order"
          value="2,034"
          delta="-3%"
          negative
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.75fr_1fr]">
        <DashboardCard
          title="Total Revenue"
          value="$94,127"
          delta="+9%"
          action="View More"
          className="min-h-[260px]"
        >
          <LineChart
            primary={[
              420, 520, 560, 760, 850, 410, 360, 290, 360, 420, 390, 480, 520,
              650, 740, 520, 780, 710, 910, 760, 690, 880,
            ]}
            secondary={[
              360, 390, 590, 610, 630, 500, 450, 330, 460, 690, 650, 530, 470,
              570, 690, 720, 610, 880, 820, 930, 720, 780,
            ]}
          />
        </DashboardCard>

        <DashboardCard title="Popular Product" action="View More" className="min-h-[260px]">
          <div className="mt-5 space-y-5">
            <ProductBar name="Macbook Air M2 2022 13 Inch" sales="8,172 Sales" value={92} />
            <ProductBar name="Macbook Pro 14 Inch 512GB M1 Pro" sales="6,345 Sales" value={75} />
            <ProductBar name="Apple Mac Mini Pro M2 2023" sales="3,287 Sales" value={58} />
            <ProductBar name="APPLE 13.3 Retina Display XDR" sales="2,456 Sales" value={43} />
          </div>
          <div className="mt-6 flex justify-between text-[10px] text-zinc-400">
            <span>0</span>
            <span>2K</span>
            <span>4K</span>
            <span>6K</span>
            <span>8K</span>
          </div>
        </DashboardCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <DashboardCard title="Average Order Value" value="$992" delta="+2.4%">
          <BarChart
            values={[
              42, 70, 54, 83, 65, 92, 58, 72, 50, 35, 48, 79, 44, 68, 90, 47,
              62, 38, 75, 57, 82, 69, 48, 89,
            ]}
          />
        </DashboardCard>

        <DashboardCard title="Average Sales" value="840" delta="+1.34%">
          <LineChart
            compact
            primary={[
              390, 470, 410, 520, 690, 430, 500, 610, 580, 430, 510, 560, 710,
              640, 760, 810,
            ]}
            secondary={[
              520, 490, 610, 700, 820, 730, 650, 770, 690, 610, 720, 780, 700,
              760, 820, 890,
            ]}
          />
        </DashboardCard>

        <DashboardCard title="Total Sessions" value="11,240" delta="+4%">
          <SessionChart
            values={[
              62, 48, 76, 82, 55, 90, 68, 73, 46, 60, 72, 54, 88, 78, 63, 81,
              70, 57, 86, 67, 74, 52, 79, 69,
            ]}
          />
        </DashboardCard>
      </section>
    </div>
  )
}

function formatDashboardDate(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).formatToParts(date)

  const weekday = parts.find((part) => part.type === 'weekday')?.value
  const day = parts.find((part) => part.type === 'day')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const year = parts.find((part) => part.type === 'year')?.value

  return `${weekday}, ${day} ${month} ${year}`
}

function DashboardPill({
  icon: Icon,
  children,
}: {
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  negative = false,
}: {
  icon: React.ElementType
  label: string
  value: string
  delta: string
  negative?: boolean
}) {
  return (
    <div className="border-zinc-200 p-5 md:border-r last:md:border-r-0">
      <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-4 flex items-end gap-2">
        <span className="text-2xl font-semibold tracking-[-0.04em]">{value}</span>
        <span
          className={`pb-1 text-xs font-semibold ${
            negative ? 'text-red-500' : 'text-emerald-500'
          }`}
        >
          {delta}
        </span>
        <span className="pb-1 text-[10px] text-zinc-400">vs last month</span>
      </div>
    </div>
  )
}

function DashboardCard({
  title,
  value,
  delta,
  action,
  className = '',
  children,
}: {
  title: string
  value?: string
  delta?: string
  action?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <article
      className={`rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {title}
            <Info className="h-3 w-3 text-zinc-400" />
          </div>
          {value && (
            <div className="mt-6 flex items-end gap-2">
              <span className="text-2xl font-semibold tracking-[-0.04em]">{value}</span>
              {delta && (
                <>
                  <span className="pb-1 text-xs font-semibold text-emerald-500">
                    {delta}
                  </span>
                  <span className="pb-1 text-[10px] text-zinc-400">vs last month</span>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {action && (
            <button className="text-xs font-semibold text-blue-700 underline-offset-4 hover:underline">
              {action}
            </button>
          )}
          <button className="inline-flex h-7 items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700">
            <Maximize2 className="h-3.5 w-3.5" />
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {children}
    </article>
  )
}

function LineChart({
  primary,
  secondary,
  compact = false,
}: {
  primary: Array<number>
  secondary: Array<number>
  compact?: boolean
}) {
  return (
    <div className={compact ? 'mt-5' : 'mt-6'}>
      <ChartLegend />
      <div className="relative mt-4 h-[150px] overflow-hidden">
        <ChartGrid />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 420 150" preserveAspectRatio="none">
          <polyline
            fill="none"
            points={makePoints(secondary, 420, 150)}
            stroke="#cbd5e1"
            strokeWidth="2"
          />
          <polyline
            fill="none"
            points={makePoints(primary, 420, 150)}
            stroke="#0F61FF"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
        </svg>
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-zinc-400">
        <span>Feb 01</span>
        <span>Feb 28</span>
      </div>
    </div>
  )
}

function BarChart({ values }: { values: Array<number> }) {
  return (
    <div className="mt-5">
      <div className="relative h-[150px]">
        <ChartGrid />
        <div className="absolute inset-x-0 bottom-0 flex h-full items-end gap-1.5">
          {values.map((value, index) => (
            <div
              key={index}
              className="flex-1 rounded-t bg-blue-500/75"
              style={{ height: `${value}%` }}
            />
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-zinc-400">
        <span>Feb 01</span>
        <span>Feb 28</span>
      </div>
    </div>
  )
}

function SessionChart({ values }: { values: Array<number> }) {
  return (
    <div className="mt-5">
      <ChartLegend />
      <div className="relative mt-4 h-[150px]">
        <ChartGrid />
        <div className="absolute inset-x-0 bottom-0 flex h-full items-end gap-1.5">
          {values.map((value, index) => (
            <div key={index} className="flex flex-1 items-end gap-0.5">
              <div
                className="w-1/2 rounded-t bg-blue-500/75"
                style={{ height: `${value}%` }}
              />
              <div
                className="w-1/2 rounded-t bg-slate-300"
                style={{ height: `${Math.max(24, value - 18)}%` }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-zinc-400">
        <span>Feb 01</span>
        <span>Feb 28</span>
      </div>
    </div>
  )
}

function ProductBar({
  name,
  sales,
  value,
}: {
  name: string
  sales: string
  value: number
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-[11px]">
        <span className="truncate font-semibold">{name}</span>
        <span className="shrink-0 text-zinc-500">{sales}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-zinc-100">
        <div className="h-full rounded-full bg-blue-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function ChartLegend() {
  return (
    <div className="flex justify-end gap-5 text-[10px] text-zinc-400">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        This month
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
        Last month
      </span>
    </div>
  )
}

function ChartGrid() {
  return (
    <div className="absolute inset-0 flex flex-col justify-between">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="border-t border-dashed border-zinc-200" />
      ))}
    </div>
  )
}

function makePoints(values: Array<number>, width: number, height: number) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const padding = 10

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width
      const y = height - padding - ((value - min) / range) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')
}
