'use client'

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BatteryCharging,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleGauge,
  Clock3,
  CloudSun,
  CreditCard,
  Cpu,
  Eye,
  EyeOff,
  Factory,
  Grid2X2,
  HelpCircle,
  Home,
  HousePlug,
  Instagram,
  LineChart,
  Linkedin,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Moon,
  Network,
  PanelTop,
  PanelLeftClose,
  PanelLeftOpen,
  PlugZap,
  Settings,
  ShieldCheck,
  Sun,
  Thermometer,
  User,
  Users,
  Wifi,
  X,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart as ReLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import logoImage from '@/assets/solarshare-logo-512.png'
import { logoutAction } from '@/app/(frontend)/auth-actions'
import type { PublicAppUser } from '@/lib/app-auth'
import type { DashboardData } from '@/lib/dashboard-data'
import { primaryAppRole } from '@/lib/account-roles'
import ProfileSettings from '@/components/ProfileSettings'
import EnergyManagement from '@/components/EnergyManagement'
import DeviceIntegrationSettings from '@/components/DeviceIntegrationSettings'
import ESP32MonitorPage from '@/components/ESP32MonitorPage'

function ImageWithFallback({
  src,
  alt,
  className,
}: {
  src: string | { src: string }
  alt: string
  className?: string
}) {
  return <img src={typeof src === 'string' ? src : src.src} alt={alt} className={className} />
}

type AuthValue = { user: string | null; logout: () => Promise<void> }
const AuthContext = createContext<AuthValue>({ user: null, logout: async () => {} })
const useAuth = () => useContext(AuthContext)

type Theme = 'light' | 'dark'
type ThemeValue = { theme: Theme; toggleTheme: () => void }
const ThemeContext = createContext<ThemeValue>({ theme: 'light', toggleTheme: () => {} })
const useTheme = () => useContext(ThemeContext)

const orange = '#FF8A24'
const blue = '#2589FF'
const green = '#21D6A1'
const BRAND = {
  name: 'SolarShare',
  wordmarkLead: 'SOLAR',
  wordmarkAccent: 'SHARE',
  tagline: 'Power shared smarter.',
  themeStorageKey: 'solarshare-theme',
} as const

function ThemeToggle({ inverse = false }: { inverse?: boolean }) {
  const { theme, toggleTheme } = useTheme()
  const nextTheme = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      className={`theme-toggle relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden border transition ${
        inverse
          ? 'border-white/30 bg-black/10 text-white hover:bg-white/10'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
      }`}
    >
      <Sun
        className={`absolute h-4 w-4 transition-all duration-300 ${theme === 'dark' ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all duration-300 ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`}
      />
    </button>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label={`${BRAND.name} home`}>
      <span className="relative grid h-12 w-12 shrink-0 place-items-center transition-transform duration-500 group-hover:scale-[1.04]">
        <ImageWithFallback
          src={logoImage}
          alt={`${BRAND.name} solar grid emblem`}
          className="h-full w-full object-contain"
        />
      </span>
      {!compact && (
        <span>
          <span className="block text-lg font-extrabold tracking-[-0.04em] text-white">
            {BRAND.wordmarkLead}
            <span className="text-[#FF8A24]">{BRAND.wordmarkAccent}</span>
          </span>
          <span className="block text-[9px] font-semibold uppercase tracking-[0.19em] text-slate-400">
            {BRAND.tagline}
          </span>
        </span>
      )}
    </Link>
  )
}

function Pill({
  children,
  tone = 'blue',
}: {
  children: React.ReactNode
  tone?: 'blue' | 'orange' | 'green'
}) {
  const styles =
    tone === 'orange'
      ? 'border-orange-400/25 bg-orange-400/10 text-orange-300'
      : tone === 'green'
        ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
        : 'border-blue-400/25 bg-blue-400/10 text-blue-300'
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${styles}`}
    >
      {children}
    </span>
  )
}

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        duration: reduceMotion ? 0 : 0.7,
        delay: reduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

type CinematicDirection = 'left' | 'right' | 'bottom'

function CinematicImage({
  src,
  alt,
  direction = 'bottom',
  className = '',
  imageClassName = '',
  parallax = 0,
  delay = 0,
}: {
  src: string
  alt: string
  direction?: CinematicDirection
  className?: string
  imageClassName?: string
  parallax?: number
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [parallax, -parallax],
  )
  const start = reduceMotion
    ? { opacity: 1, x: 0, y: 0, scale: 1 }
    : {
        opacity: 0,
        x: direction === 'left' ? -56 : direction === 'right' ? 56 : 0,
        y: direction === 'bottom' ? 48 : 0,
        scale: 1.025,
      }

  return (
    <motion.div
      ref={ref}
      className={`overflow-hidden ${className}`}
      initial={start}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{
        duration: reduceMotion ? 0 : 1.15,
        delay: reduceMotion ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <motion.div
        className={`h-full w-full will-change-transform ${parallax ? 'scale-[1.08]' : ''}`}
        style={{ y: parallaxY }}
      >
        <ImageWithFallback
          src={src}
          alt={alt}
          className={`h-full w-full object-cover ${imageClassName}`}
        />
      </motion.div>
    </motion.div>
  )
}

function EnergyTicker() {
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-[#08182b] py-3">
      <motion.div
        className="flex w-max items-center gap-12 whitespace-nowrap font-mono text-[10px] font-medium uppercase tracking-[.18em] text-slate-500"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 1].map((copy) => (
          <React.Fragment key={copy}>
            <span className="flex items-center gap-2">
              <Sun className="h-3 w-3 text-orange-300" /> Solar generation{' '}
              <strong className="text-white">4.86 kW</strong>
            </span>
            <span className="flex items-center gap-2">
              <BatteryCharging className="h-3 w-3 text-emerald-300" /> Battery charging{' '}
              <strong className="text-white">78%</strong>
            </span>
            <span className="flex items-center gap-2">
              <Home className="h-3 w-3 text-blue-300" /> Home demand{' '}
              <strong className="text-white">2.14 kW</strong>
            </span>
            <span className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-blue-300" /> Demo telemetry{' '}
              <strong className="text-emerald-300">Live</strong>
            </span>
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  )
}

function InteractiveSystemStory() {
  const [active, setActive] = useState(0)
  const stories = [
    {
      name: 'Generate',
      eyebrow: '01 · Capture',
      title: 'Turn daylight into visible energy.',
      text: 'Follow the solar curve from first light to peak production, with instantaneous power and accumulated energy kept clearly distinct.',
      icon: Sun,
      color: orange,
      values: [8, 16, 31, 56, 78, 94, 82, 62, 34, 12],
    },
    {
      name: 'Store',
      eyebrow: '02 · Preserve',
      title: 'Keep more energy ready for later.',
      text: 'Understand when compatible batteries charge, hold and discharge—without implying control that the connected equipment does not support.',
      icon: BatteryCharging,
      color: green,
      values: [12, 18, 26, 39, 52, 67, 74, 78, 78, 72],
    },
    {
      name: 'Coordinate',
      eyebrow: '03 · Connect',
      title: 'See the network as one living system.',
      text: 'Bring generation, household demand, storage and supported destinations into one calm, coordinated energy view.',
      icon: Network,
      color: blue,
      values: [30, 42, 34, 58, 48, 72, 61, 88, 70, 82],
    },
  ]
  const story = stories[active]
  const Icon = story.icon
  return (
    <section className="relative overflow-hidden bg-[#F4F7FC] py-24 text-[#071426]">
      <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_70%_35%,rgba(37,137,255,.12),transparent_45%)]" />
      <div className="relative mx-auto max-w-[1320px] px-5 lg:px-10">
        <Reveal className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#1675dd]">
              The SolarShare energy system
            </span>
            <h2 className="mt-5 text-4xl font-extrabold tracking-[-0.05em] sm:text-6xl">
              Energy should feel
              <br />
              effortless to understand.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-slate-600">
            A product-led experience inspired by the clarity of modern home-energy platforms: simple
            at first glance, deeply informative when explored.
          </p>
        </Reveal>
        <div className="mt-14 grid overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(7,20,38,.12)] lg:grid-cols-[.8fr_1.2fr]">
          <div className="border-b border-slate-200 p-6 sm:p-9 lg:border-b-0 lg:border-r">
            <div className="flex gap-2 lg:flex-col">
              {stories.map((item, i) => {
                const ItemIcon = item.icon
                return (
                  <motion.button
                    key={item.name}
                    onClick={() => setActive(i)}
                    whileHover={{ x: i === active ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex flex-1 items-center gap-3 rounded-2xl p-3 text-left transition sm:p-4 ${active === i ? 'bg-[#071426] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                      style={{ backgroundColor: `${item.color}18`, color: item.color }}
                    >
                      <ItemIcon className="h-5 w-5" />
                    </span>
                    <span className="hidden text-sm font-extrabold sm:block">{item.name}</span>
                    {active === i && (
                      <motion.span
                        layoutId="story-arrow"
                        className="ml-auto hidden h-2 w-2 rounded-full bg-[#FF8A24] sm:block"
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>
            <motion.div
              key={story.title}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
              className="mt-10"
            >
              <p
                className="font-mono text-[10px] font-bold uppercase tracking-[.18em]"
                style={{ color: story.color }}
              >
                {story.eyebrow}
              </p>
              <h3 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.04em]">
                {story.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{story.text}</p>
              <button
                onClick={() => setActive((active + 1) % stories.length)}
                className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-[#1675dd]"
              >
                Explore next layer <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          </div>
          <div className="relative min-h-[420px] overflow-hidden bg-[#091a2e] p-6 text-white sm:p-10">
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(67,181,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(67,181,255,.12)_1px,transparent_1px)] [background-size:42px_42px]" />
            <div className="relative flex items-center justify-between">
              <Pill tone={active === 0 ? 'orange' : active === 1 ? 'green' : 'blue'}>
                <Icon className="h-3 w-3" /> {story.name} view
              </Pill>
              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500">
                Interactive sample
              </span>
            </div>
            <div className="relative mt-16 flex h-52 items-end gap-2 sm:gap-3">
              {story.values.map((value, i) => (
                <div key={`${active}-${i}`} className="flex h-full flex-1 items-end">
                  <motion.div
                    initial={{ height: 0, opacity: 0.2 }}
                    animate={{ height: `${value}%`, opacity: 1 }}
                    transition={{ duration: 0.65, delay: i * 0.045, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full min-w-2 rounded-t-full"
                    style={{ backgroundColor: story.color }}
                  >
                    <span className="absolute inset-x-0 top-0 h-8 rounded-full bg-white/30 blur-md" />
                  </motion.div>
                </div>
              ))}
            </div>
            <div className="relative mt-5 flex justify-between font-mono text-[9px] uppercase tracking-wider text-slate-600">
              <span>06:00</span>
              <span>Live profile</span>
              <span>21:00</span>
            </div>
            <motion.div
              layout
              className="relative mt-8 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div>
                <p className="text-[10px] text-slate-500">Current reading</p>
                <p className="mt-1 font-mono text-2xl font-bold">
                  {active === 0 ? '4.86 kW' : active === 1 ? '78% SOC' : '4 nodes'}
                </p>
              </div>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
                className="grid h-12 w-12 place-items-center rounded-full border border-dashed"
                style={{ borderColor: story.color, color: story.color }}
              >
                <Icon className="h-5 w-5" />
              </motion.span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PlatformArchitecture() {
  const [role, setRole] = useState(0)
  const roles = [
    {
      name: 'Homeowner',
      icon: Home,
      title: 'Clarity for everyday energy decisions',
      text: 'A simple view of production, storage, household demand and important system events.',
    },
    {
      name: 'Installer',
      icon: PlugZap,
      title: 'Faster context for system support',
      text: 'Installation details, connection state and diagnostic events organised for practical investigation.',
    },
    {
      name: 'Energy manager',
      icon: BarChart3,
      title: 'A coordinated view across supported sites',
      text: 'Comparable histories, alerts and installation records ready for future portfolio-level workflows.',
    },
  ]
  const activeRole = roles[role]
  const RoleIcon = activeRole.icon
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-[#071426] py-24 text-white">
      <div className="absolute -left-32 top-32 h-80 w-80 rounded-full bg-blue-500/10 blur-[100px]" />
      <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
        <Reveal className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <Pill>Edge to insight</Pill>
            <h2 className="mt-5 text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">
              One connected layer from equipment to action.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-400 lg:justify-self-end">
            Inspired by the edge-to-cloud clarity of enterprise energy platforms, SolarShare shows
            how supported field measurements can become useful monitoring, diagnostics and
            analytics—without overstating what has been configured.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <Reveal className="rounded-[28px] border border-white/10 bg-[#0B1D35] p-6 sm:p-9">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[.18em] text-slate-500">
                  System architecture
                </p>
                <h3 className="mt-2 text-xl font-extrabold">Measurement to meaning</h3>
              </div>
              <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Demo pathway
              </span>
            </div>
            <div className="relative mt-8">
              <div className="absolute bottom-10 left-6 top-10 w-px bg-gradient-to-b from-orange-400 via-blue-400 to-emerald-400" />
              {[
                {
                  icon: PanelTop,
                  label: 'Installation edge',
                  text: 'Inverter, meter and compatible gateway measurements',
                  color: orange,
                },
                {
                  icon: Wifi,
                  label: 'Secure data service',
                  text: 'Configurable REST and WebSocket integration layer',
                  color: blue,
                },
                {
                  icon: CircleGauge,
                  label: 'SolarShare intelligence',
                  text: 'Monitoring, alerts, histories and supported sharing views',
                  color: green,
                },
              ].map((item, i) => {
                const ItemIcon = item.icon
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -18 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.14 }}
                    className="relative mb-4 flex items-center gap-4 rounded-2xl border border-white/10 bg-[#08182b] p-4 last:mb-0"
                  >
                    <motion.span
                      whileHover={{ rotate: 8, scale: 1.08 }}
                      className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-xl border"
                      style={{
                        color: item.color,
                        borderColor: `${item.color}55`,
                        backgroundColor: `${item.color}12`,
                      }}
                    >
                      <ItemIcon className="h-5 w-5" />
                    </motion.span>
                    <div>
                      <p className="text-sm font-extrabold">{item.label}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{item.text}</p>
                    </div>
                    <span className="ml-auto hidden font-mono text-[9px] text-slate-600 sm:block">
                      0{i + 1}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </Reveal>
          <Reveal
            delay={0.12}
            className="rounded-[28px] border border-white/10 bg-[#102641] p-6 sm:p-9"
          >
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-slate-500">
              Built around the people using it
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {roles.map((item, i) => {
                const ItemIcon = item.icon
                return (
                  <button
                    key={item.name}
                    onClick={() => setRole(i)}
                    className={`rounded-xl border p-3 text-center transition ${role === i ? 'border-blue-400/50 bg-blue-400/10 text-blue-200' : 'border-white/10 text-slate-500 hover:bg-white/5'}`}
                  >
                    <ItemIcon className="mx-auto h-5 w-5" />
                    <span className="mt-2 hidden text-[10px] font-bold sm:block">{item.name}</span>
                  </button>
                )
              })}
            </div>
            <motion.div
              key={activeRole.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-400/10 text-blue-300">
                <RoleIcon className="h-6 w-6" />
              </span>
              <p className="mt-6 text-xs font-bold uppercase tracking-widest text-[#43B5FF]">
                {activeRole.name}
              </p>
              <h3 className="mt-3 text-2xl font-extrabold tracking-[-0.03em]">
                {activeRole.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{activeRole.text}</p>
            </motion.div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                ['Monitoring', 88],
                ['Diagnostics', 72],
                ['Analytics', 81],
                ['Reporting', 64],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-xl bg-[#071426]/60 p-3">
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    <span>{label}</span>
                    <span>Ready</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#2589FF] to-[#43B5FF]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function PrimaryButton({
  to,
  children,
  className = '',
}: {
  to: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={to}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FF8A24] px-5 py-3 text-sm font-extrabold text-[#071426] shadow-[0_12px_40px_rgba(255,138,36,.22)] transition hover:-translate-y-0.5 hover:bg-[#FFB14A] focus:outline-none focus:ring-2 focus:ring-[#FFB14A] focus:ring-offset-2 focus:ring-offset-[#071426] ${className}`}
    >
      {children}
    </Link>
  )
}

function NetworkScene({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState('Generation')
  const nodes = [
    { name: 'Generation', value: '4.8 kW', x: '12%', icon: Sun, color: 'orange' },
    { name: 'Home demand', value: '2.1 kW', x: '43%', icon: Home, color: 'blue' },
    { name: 'Storage', value: '78%', x: '74%', icon: BatteryCharging, color: 'green' },
  ]
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-[#091a2e] ${compact ? 'min-h-[290px] p-5' : 'min-h-[430px] p-7 md:p-10'}`}
    >
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(67,181,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(67,181,255,.08)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="relative flex items-center justify-between">
        <Pill tone="green">
          <Wifi className="h-3 w-3" /> Network live
        </Pill>
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
          Concept view · sample data
        </span>
      </div>
      <svg
        className="absolute inset-x-[12%] top-[42%] h-24 w-[76%]"
        viewBox="0 0 800 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M25 50 C150 5 230 95 390 50 S650 10 775 50"
          fill="none"
          stroke="#2589FF"
          strokeOpacity=".38"
          strokeWidth="3"
          strokeDasharray="8 8"
        />
        <path
          d="M25 50 C150 5 230 95 390 50"
          fill="none"
          stroke="#FF8A24"
          strokeWidth="3"
          strokeDasharray="90 500"
          className="animate-[dash_3s_linear_infinite]"
        />
        <path
          d="M390 50 C520 12 650 8 775 50"
          fill="none"
          stroke="#43B5FF"
          strokeWidth="3"
          strokeDasharray="90 500"
          className="animate-[dash_3s_linear_infinite]"
        />
      </svg>
      <div className={`relative mt-16 grid grid-cols-3 gap-3 ${compact ? '' : 'md:mt-24'}`}>
        {nodes.map(({ name, value, icon: Icon, color }) => (
          <motion.button
            key={name}
            onClick={() => setSelected(name)}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.97 }}
            className={`group flex min-h-32 flex-col items-center justify-center rounded-2xl border p-3 transition ${selected === name ? 'border-blue-400/60 bg-[#102641] shadow-[0_0_30px_rgba(37,137,255,.13)]' : 'border-white/10 bg-[#0b1d35]/80 hover:border-white/20'}`}
          >
            <motion.span
              animate={selected === name ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.45 }}
              className={`grid h-12 w-12 place-items-center rounded-2xl ${color === 'orange' ? 'bg-orange-400/15 text-orange-300' : color === 'green' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-blue-400/15 text-blue-300'}`}
            >
              <Icon className="h-6 w-6" />
            </motion.span>
            <span className="mt-3 text-xs font-bold text-white md:text-sm">{name}</span>
            <span className="mt-1 font-mono text-[10px] text-slate-400 md:text-xs">{value}</span>
          </motion.button>
        ))}
      </div>
      <div className="relative mt-5 flex items-start gap-3 rounded-xl border border-white/10 bg-[#071426]/80 p-4">
        <CircleGauge className="mt-0.5 h-4 w-4 shrink-0 text-[#43B5FF]" />
        <p className="text-xs leading-5 text-slate-400">
          <strong className="text-white">{selected}:</strong>{' '}
          {selected === 'Generation'
            ? 'Solar is supplying current household demand; surplus destinations depend on configured equipment.'
            : selected === 'Storage'
              ? 'Compatible battery is charging from available solar surplus.'
              : 'Current demand is prioritising available on-site solar.'}
        </p>
      </div>
    </div>
  )
}

const usageCards = [
  {
    title: 'Solar First',
    icon: Sun,
    text: 'Use available solar to supply household demand before other supported destinations.',
    detail:
      'Live routing is represented only when compatible meters expose the required measurements.',
    tone: 'orange',
  },
  {
    title: 'Store for Later',
    icon: BatteryCharging,
    text: 'Charge a compatible battery with excess generation for use after sunset.',
    detail: 'SolarShare monitors charging behaviour; control requires supported battery hardware.',
    tone: 'green',
  },
  {
    title: 'Share Available Energy',
    icon: Network,
    text: 'Visualise supported allocation between participating systems and destinations.',
    detail:
      'Sharing requires suitable electrical infrastructure, metering and regulatory arrangements.',
    tone: 'blue',
  },
  {
    title: 'Monitor Every Watt',
    icon: Activity,
    text: 'See generation, consumption, storage and grid interaction in one view.',
    detail: 'Power is shown in kW; accumulated energy is shown in kWh.',
    tone: 'blue',
  },
]

function LuxuryDashboardPreview() {
  const [range, setRange] = useState('Today')
  const scale = range === 'Today' ? 1 : range === '7 days' ? 0.82 : 0.68
  const data = chartData.map((item) => ({
    ...item,
    solar: item.solar * scale,
    load: item.load * (2 - scale),
  }))
  return (
    <div className="overflow-hidden border border-white/15 bg-[#0A1A2D] shadow-[0_40px_100px_rgba(0,0,0,.28)]">
      <div className="flex h-12 items-center justify-between border-b border-white/10 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#FF8A24]" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[.18em] text-white/40">
          SolarShare · Demonstration data
        </span>
        <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-[#83BFA2]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#83BFA2]" /> Online
        </span>
      </div>
      <div className="grid gap-px bg-white/10 md:grid-cols-[.58fr_1.42fr]">
        <div className="bg-[#0A1A2D] p-5 sm:p-7">
          <p className="text-[10px] uppercase tracking-[.18em] text-white/40">Live network</p>
          <p className="mt-8 font-mono text-4xl font-medium tracking-[-.06em] text-white">4.86</p>
          <p className="mt-1 text-xs text-white/45">kW solar generation</p>
          <div className="mt-9 space-y-5">
            {[
              ['Home demand', '2.14 kW', blue],
              ['Battery', '78%', green],
              ['Grid', '0.00 kW', '#A7B0BA'],
            ].map(([label, value, color]) => (
              <div key={label} className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/45">{label}</span>
                  <span className="font-mono text-white">{value}</span>
                </div>
                <div className="mt-3 h-px bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{
                      width: label === 'Battery' ? '78%' : label === 'Grid' ? '4%' : '44%',
                    }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="h-px"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#0D2139] p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-white">Energy profile</p>
              <p className="mt-1 text-[10px] text-white/35">Power · kW</p>
            </div>
            <div className="flex border border-white/10 p-1">
              {['Today', '7 days', '30 days'].map((item) => (
                <button
                  key={item}
                  onClick={() => setRange(item)}
                  className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider transition ${range === item ? 'bg-white text-[#071426]' : 'text-white/40 hover:text-white'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs key="luxury-chart-definitions">
                  <linearGradient id="luxSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={orange} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={orange} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  key="luxury-chart-grid"
                  stroke="rgba(255,255,255,.07)"
                  vertical={false}
                />
                <XAxis
                  key="luxury-chart-x-axis"
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,.3)', fontSize: 9 }}
                />
                <YAxis key="luxury-chart-y-axis" hide />
                <Tooltip
                  key="luxury-chart-tooltip"
                  contentStyle={{
                    background: '#071426',
                    border: '1px solid rgba(255,255,255,.12)',
                    borderRadius: 0,
                    fontSize: 10,
                  }}
                />
                <Area
                  key="luxury-solar-area"
                  type="monotone"
                  dataKey="solar"
                  stroke={orange}
                  strokeWidth={2}
                  fill="url(#luxSolar)"
                />
                <Line
                  key="luxury-load-line"
                  type="monotone"
                  dataKey="load"
                  stroke="#77A9D9"
                  strokeWidth={1.5}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-5 flex gap-6 text-[9px] uppercase tracking-wider text-white/40">
            <span className="flex items-center gap-2">
              <i className="h-px w-5 bg-[#FF8A24]" /> Solar
            </span>
            <span className="flex items-center gap-2">
              <i className="h-px w-5 bg-[#77A9D9]" /> Demand
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ContactSection() {
  const socials = [
    { label: 'LinkedIn', Icon: Linkedin, mark: '', href: '' },
    { label: 'Instagram', Icon: Instagram, mark: '', href: '' },
    { label: 'X (Twitter)', Icon: null, mark: 'X', href: '' },
    { label: 'Facebook', Icon: null, mark: 'f', href: '' },
    { label: 'WhatsApp', Icon: MessageCircle, mark: '', href: '' },
  ]
  return (
    <section
      id="contact"
      className="contact-section bg-[#0B1D35] px-6 py-8 text-white sm:py-9 lg:px-12"
    >
      <div id="social-channels">
        <Reveal className="mx-auto flex max-w-[1320px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[-.01em]">Stay Connected</p>
            <p className="mt-1 text-xs leading-5 text-white/45">
              Follow SolarShare for updates, insights and a smarter energy future.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-white/55 sm:flex-nowrap">
            {socials.map(({ label, Icon, mark, href }) => (
              <a
                key={label}
                href={href || '#contact'}
                onClick={(event) => {
                  if (!href) {
                    event.preventDefault()
                    alert(`${label} profile is not configured yet.`)
                  }
                }}
                aria-label={`${label}${href ? '' : ' — placeholder, profile not configured'}`}
                title={`${label}${href ? '' : ' — not configured'}`}
                className="group inline-flex items-center justify-center transition hover:-translate-y-0.5 hover:text-[#FF9F52]"
              >
                {Icon ? (
                  <Icon className="h-[19px] w-[19px] transition-transform group-hover:scale-105" />
                ) : (
                  <span className="text-lg font-bold leading-none">{mark}</span>
                )}
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Landing() {
  const [menu, setMenu] = useState(false)
  const [faq, setFaq] = useState<number | null>(0)
  const [story, setStory] = useState(0)
  const heroImage =
    'https://images.unsplash.com/photo-1681264128028-b59ee25012a5?auto=format&fit=crop&w=2400&q=90'
  const houseImage =
    'https://images.unsplash.com/flagged/photo-1566838616838-c3a720672aad?auto=format&fit=crop&w=1800&q=88'
  const architectureImage =
    'https://images.unsplash.com/flagged/photo-1566838803980-56bfa5300e8c?auto=format&fit=crop&w=1800&q=88'
  const stories = [
    {
      label: 'Generate',
      number: '01',
      title: 'Capture the day.',
      text: 'See available solar generation with a precise view of current power and accumulated energy.',
    },
    {
      label: 'Store',
      number: '02',
      title: 'Hold what matters.',
      text: 'Understand compatible battery charge, discharge and state of charge without unnecessary complexity.',
    },
    {
      label: 'Share',
      number: '03',
      title: 'Connect with purpose.',
      text: 'Visualise supported sharing arrangements when the required electrical and metering infrastructure is in place.',
    },
  ]
  const faqs = [
    [
      'What is SolarShare?',
      'A refined energy-management experience for understanding supported solar generation, storage, household demand and connected energy systems.',
    ],
    [
      'Can SolarShare connect to my inverter?',
      'Compatibility depends on the inverter, communication protocol and available integration. Each installation requires assessment.',
    ],
    [
      'Does SolarShare physically share electricity?',
      'No. Energy sharing requires supported electrical infrastructure, metering and applicable arrangements. Software alone cannot interconnect independent homes.',
    ],
    [
      'Is the dashboard showing live hardware?',
      'Not until compatible equipment is connected. Account views label each reading live, historical, demo or unavailable, and never substitute fabricated measurements.',
    ],
  ]
  return (
    <div className="site-shell min-h-screen overflow-x-hidden bg-[#F6F5F1] text-[#071426]">
      <header className="absolute inset-x-0 top-0 z-50 border-b border-white/20 text-white">
        <div className="mx-auto flex h-24 max-w-[1500px] items-center justify-between px-6 lg:px-12">
          <Brand />
          <nav className="hidden items-center gap-10 xl:flex" aria-label="Primary navigation">
            {[
              ['Philosophy', 'philosophy'],
              ['Energy network', 'network'],
              ['Experience', 'experience'],
              ['Questions', 'faq'],
            ].map(([label, id]) => (
              <a
                key={id}
                href={`#${id}`}
                className="text-[11px] font-bold uppercase tracking-[.18em] text-white/75 transition hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-5 sm:flex">
            <ThemeToggle inverse />
            <Link
              href="/login"
              className="text-[11px] font-bold uppercase tracking-[.18em] text-white/75 transition hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="border border-white/60 px-5 py-3 text-[11px] font-bold uppercase tracking-[.16em] transition hover:bg-white hover:text-[#071426]"
            >
              Get started
            </Link>
          </div>
          <button
            onClick={() => setMenu(!menu)}
            className="grid h-11 w-11 place-items-center border border-white/35 xl:hidden"
            aria-label="Toggle navigation"
          >
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menu && (
          <div className="border-t border-white/20 bg-[#071426]/95 px-6 py-6 backdrop-blur-xl xl:hidden">
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                Appearance
              </span>
              <ThemeToggle inverse />
            </div>
            {[
              ['Philosophy', 'philosophy'],
              ['Energy network', 'network'],
              ['Experience', 'experience'],
              ['Questions', 'faq'],
            ].map(([label, id]) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setMenu(false)}
                className="block border-b border-white/10 py-4 text-xs font-bold uppercase tracking-[.16em]"
              >
                {label}
              </a>
            ))}
            <div className="mt-6 flex gap-3">
              <Link
                href="/login"
                className="flex-1 border border-white/30 p-3 text-center text-xs uppercase"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="flex-1 bg-[#FF8A24] p-3 text-center text-xs font-bold uppercase text-[#071426]"
              >
                Get started
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-[#071426] text-white">
          <CinematicImage
            src={heroImage}
            alt="Modern home fitted with rooftop solar panels"
            direction="bottom"
            parallax={30}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,12,23,.72)_0%,rgba(3,12,23,.16)_60%,rgba(3,12,23,.25)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(3,12,23,.7)_0%,transparent_45%)]" />
          <div className="relative z-10 mx-auto w-full max-w-[1500px] px-6 pb-20 lg:px-12 lg:pb-24">
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7 }}
              className="text-[10px] font-bold uppercase tracking-[.28em] text-white/65"
            >
              SolarShare · Power shared smarter.
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.58, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 max-w-5xl text-[clamp(3.5rem,8vw,8.5rem)] font-medium leading-[.84] tracking-[-.065em]"
            >
              Power,
              <br />
              beautifully composed.
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-9 flex flex-col items-start gap-6 sm:flex-row sm:items-center"
            >
              <Link
                href="/register"
                className="group inline-flex items-center gap-8 bg-white px-6 py-4 text-[11px] font-bold uppercase tracking-[.16em] text-[#071426] transition hover:bg-[#FF8A24]"
              >
                Discover SolarShare{' '}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <p className="max-w-sm text-sm leading-6 text-white/65">
                Intelligent solar monitoring, storage insight and connected energy—expressed with
                absolute clarity.
              </p>
            </motion.div>
          </div>
          <a
            href="#philosophy"
            className="absolute bottom-8 right-8 z-10 hidden items-center gap-3 text-[9px] font-bold uppercase tracking-[.22em] text-white/60 md:flex"
          >
            <span className="h-px w-12 bg-white/40" /> Scroll to explore
          </a>
        </section>

        <section id="philosophy" className="px-6 py-28 sm:py-40 lg:px-12">
          <div className="mx-auto max-w-[1320px]">
            <Reveal>
              <p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#A45115]">
                Our philosophy
              </p>
              <h2 className="mt-8 max-w-6xl text-[clamp(2.7rem,6vw,6.5rem)] font-medium leading-[.98] tracking-[-.055em]">
                Energy technology should disappear into the rhythm of life.
              </h2>
            </Reveal>
            <div className="mt-16 grid gap-12 border-t border-[#071426]/15 pt-10 md:grid-cols-3">
              <div className="md:col-start-2">
                <p className="text-lg font-semibold leading-8">
                  One quiet, confident view of the energy moving through your home.
                </p>
              </div>
              <div>
                <p className="text-sm leading-7 text-[#52606D]">
                  SolarShare brings supported generation, battery activity, consumption and network
                  relationships into a considered experience that rewards exploration without
                  demanding attention.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1500px] px-0 sm:px-6 lg:px-12">
          <div className="relative min-h-[70svh] overflow-hidden bg-[#D9DEE1]">
            <CinematicImage
              src={houseImage}
              alt="Contemporary solar-powered residence viewed beneath a clear sky"
              direction="left"
              parallax={26}
              className="absolute inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#071426]/60 via-transparent to-transparent" />
            <Reveal
              delay={0.18}
              className="relative z-10 flex min-h-[70svh] max-w-xl flex-col justify-end p-8 text-white sm:p-14"
            >
              <p className="text-[10px] font-bold uppercase tracking-[.24em] text-white/65">
                Designed around you
              </p>
              <h2 className="mt-5 text-4xl font-medium tracking-[-.045em] sm:text-6xl">
                Insight, without intrusion.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/75">
                Know what your system is producing, storing and using. Move from a single reading to
                the full story, naturally.
              </p>
            </Reveal>
          </div>
        </section>

        <section id="network" className="px-6 py-28 sm:py-40 lg:px-12">
          <div className="mx-auto max-w-[1320px]">
            <Reveal className="grid gap-8 lg:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#A45115]">
                  A considered energy network
                </p>
                <h2 className="mt-7 text-5xl font-medium leading-[1.02] tracking-[-.055em] sm:text-7xl">
                  From sunlight
                  <br />
                  to shared value.
                </h2>
              </div>
              <div className="flex items-end">
                <p className="max-w-lg text-base leading-8 text-[#52606D]">
                  SolarShare reveals how generation, household demand, compatible storage and
                  supported sharing arrangements relate—without implying that software alone
                  controls physical electricity flow.
                </p>
              </div>
            </Reveal>
            <div className="mt-20 grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
              <div className="flex flex-col justify-between border-t border-[#071426]/20">
                {stories.map((item, i) => (
                  <button
                    key={item.label}
                    onClick={() => setStory(i)}
                    className={`group flex items-center gap-5 border-b border-[#071426]/15 py-7 text-left transition ${story === i ? 'text-[#071426]' : 'text-[#8A939B] hover:text-[#071426]'}`}
                  >
                    <span className="font-mono text-[10px]">{item.number}</span>
                    <span className="text-xl font-semibold">{item.label}</span>
                    <ArrowRight
                      className={`ml-auto h-4 w-4 transition ${story === i ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`}
                    />
                  </button>
                ))}
                <motion.div
                  key={story}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-10"
                >
                  <h3 className="text-3xl font-medium tracking-[-.04em]">{stories[story].title}</h3>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-[#52606D]">
                    {stories[story].text}
                  </p>
                </motion.div>
              </div>
              <div className="relative min-h-[520px] overflow-hidden bg-[#D9DEE1]">
                <CinematicImage
                  src={architectureImage}
                  alt="Refined modern home architecture designed for solar living"
                  direction="right"
                  parallax={20}
                  delay={0.1}
                  className="absolute inset-0"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#071426]/75 to-transparent p-8 pt-28 text-white">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-[.2em] text-white/55">
                        Illustrative state
                      </p>
                      <p className="mt-2 font-mono text-2xl">
                        {story === 0 ? '4.86 kW' : story === 1 ? '78% SOC' : '3 destinations'}
                      </p>
                    </div>
                    <motion.div
                      key={`line-${story}`}
                      initial={{ width: 0 }}
                      animate={{ width: '42%' }}
                      className="mb-2 h-px bg-[#FF8A24]"
                    />
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-8 max-w-2xl text-[11px] leading-6 text-[#7A858E]">
              Actual energy sharing depends on electrical infrastructure, metering arrangements,
              regulations and supported equipment. Demonstration readings are illustrative.
            </p>
          </div>
        </section>

        <section
          id="experience"
          className="overflow-hidden bg-[#071426] px-6 py-28 text-white sm:py-40 lg:px-12"
        >
          <div className="mx-auto max-w-[1320px]">
            <Reveal className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#FF9F52]">
                  The SolarShare experience
                </p>
                <h2 className="mt-7 text-5xl font-medium tracking-[-.055em] sm:text-7xl">
                  Complexity,
                  <br />
                  resolved.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-white/55">
                A composed command center that gives every reading room to breathe, while preserving
                the depth required to investigate performance.
              </p>
            </Reveal>
            <Reveal delay={0.15} className="mt-16">
              <LuxuryDashboardPreview />
            </Reveal>
            <div className="mt-12 grid gap-px bg-white/15 sm:grid-cols-3">
              {[
                [
                  '01',
                  'Live understanding',
                  'See current generation, demand and supported storage activity.',
                ],
                ['02', 'Measured history', 'Move through daily and longer-term energy profiles.'],
                [
                  '03',
                  'Meaningful attention',
                  'Surface relevant connection, equipment and system events.',
                ],
              ].map(([n, t, d]) => (
                <div key={n} className="bg-[#071426] py-8 sm:px-8">
                  <p className="font-mono text-[9px] text-[#FF9F52]">{n}</p>
                  <h3 className="mt-8 text-lg font-semibold">{t}</h3>
                  <p className="mt-3 text-xs leading-6 text-white/45">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#ECEDE9] px-6 py-28 sm:py-40 lg:px-12">
          <div className="mx-auto grid max-w-[1320px] gap-16 lg:grid-cols-[1fr_1.3fr]">
            <Reveal>
              <p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#A45115]">
                Precision in every detail
              </p>
              <h2 className="mt-7 text-5xl font-medium tracking-[-.055em] sm:text-6xl">
                One clear view.
                <br />
                Every essential signal.
              </h2>
            </Reveal>
            <div className="grid gap-px bg-[#071426]/15 sm:grid-cols-2">
              {[
                [Sun, 'Generation', 'Current solar power and daily energy.'],
                [BatteryCharging, 'Storage', 'State of charge and battery activity.'],
                [Home, 'Consumption', 'Household demand and historical use.'],
                [Bell, 'Attention', 'Relevant warnings and connection events.'],
              ].map(([Icon, title, text]: any, i) => (
                <motion.div
                  key={title}
                  whileHover={{ opacity: 0.82 }}
                  className="min-h-56 bg-[#ECEDE9] p-7"
                >
                  <span className="font-mono text-[9px] text-[#A45115]">0{i + 1}</span>
                  <Icon className="mt-10 h-5 w-5 stroke-[1.4]" />
                  <h3 className="mt-5 font-semibold">{title}</h3>
                  <p className="mt-2 text-xs leading-6 text-[#66717A]">{text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="bg-white px-6 py-28 sm:py-40 lg:px-12">
          <div className="mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[.7fr_1.3fr]">
            <Reveal>
              <p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#A45115]">
                Questions, answered
              </p>
              <h2 className="mt-7 text-5xl font-medium tracking-[-.05em]">
                Confidence begins with clarity.
              </h2>
            </Reveal>
            <div>
              {faqs.map(([q, a], i) => (
                <div key={q} className="border-b border-[#071426]/15">
                  <button
                    onClick={() => setFaq(faq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-7 text-left text-lg font-semibold"
                  >
                    {q}
                    <span className="relative h-4 w-4 shrink-0">
                      <i className="absolute left-0 top-1/2 h-px w-4 bg-[#071426]" />
                      <i
                        className={`absolute left-1/2 top-0 h-4 w-px bg-[#071426] transition ${faq === i ? 'rotate-90 opacity-0' : ''}`}
                      />
                    </span>
                  </button>
                  {faq === i && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="max-w-xl pb-7 text-sm leading-7 text-[#5F6B74]"
                    >
                      {a}
                    </motion.p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative flex min-h-[64svh] items-end overflow-hidden bg-[#071426] text-white">
          <CinematicImage
            src={heroImage}
            alt="Solar architecture at the heart of a connected energy future"
            direction="bottom"
            parallax={24}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-[#071426]/55" />
          <Reveal
            delay={0.16}
            className="relative z-10 mx-auto w-full max-w-[1320px] px-6 py-20 lg:px-12"
          >
            <p className="text-[10px] font-bold uppercase tracking-[.24em] text-white/60">
              Begin your energy story
            </p>
            <h2 className="mt-6 max-w-4xl text-5xl font-medium leading-none tracking-[-.055em] sm:text-7xl">
              Power shared smarter.
            </h2>
            <Link
              href="/register"
              className="group mt-10 inline-flex items-center gap-10 border border-white/60 px-6 py-4 text-[11px] font-bold uppercase tracking-[.16em] transition hover:bg-white hover:text-[#071426]"
            >
              Get started <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </section>
        <ContactSection />
      </main>

      <footer className="bg-[#06101E] px-6 py-12 text-white lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-10 pb-12 md:grid-cols-[1.3fr_.7fr_.7fr] md:gap-12">
            <div>
              <Brand />
              <p className="mt-4 max-w-sm text-xs leading-6 text-white/40">
                A smarter approach to understanding solar generation, storage, consumption and
                connected energy.
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/30">
                Explore
              </p>
              <div className="mt-4 grid gap-2.5 text-[10px] font-bold uppercase tracking-[.14em] text-white/55">
                <a href="#philosophy" className="transition hover:text-white">
                  Our Philosophy
                </a>
                <a href="#network" className="transition hover:text-white">
                  Energy Network
                </a>
                <a href="#experience" className="transition hover:text-white">
                  Experience
                </a>
                <Link href="/login" className="transition hover:text-white">
                  Client Login
                </Link>
              </div>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/30">
                Get in touch
              </p>
              <div className="mt-4 grid gap-2.5 text-[10px] font-bold uppercase tracking-[.14em] text-white/55">
                <a href="#social-channels" className="transition hover:text-white">
                  Social Channels
                </a>
                <Link href="/register" className="text-[#FF9F52] transition hover:text-[#FFB87A]">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-[9px] uppercase tracking-[.14em] text-white/30 sm:flex-row">
            <span>Â© 2026 SolarShare. All rights reserved.</span>
            <span>Prototype · Demonstration Data Only</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

const chartData = [
  { time: '12a', solar: 0, load: 1.1, battery: 0.4 },
  { time: '3a', solar: 0, load: 0.8, battery: 0.3 },
  { time: '6a', solar: 0.4, load: 1.4, battery: 0.5 },
  { time: '9a', solar: 2.9, load: 1.7, battery: 1.2 },
  { time: '12p', solar: 4.8, load: 2.1, battery: 1.5 },
  { time: '3p', solar: 3.9, load: 1.8, battery: 0.8 },
  { time: '6p', solar: 1.1, load: 2.4, battery: -0.7 },
  { time: '9p', solar: 0, load: 1.7, battery: -0.9 },
]

const navItems: Array<[string, string, LucideIcon]> = [
  ['overview', 'Overview', Grid2X2],
  ['solar', 'Solar Generation', Sun],
  ['battery', 'Battery Storage', BatteryCharging],
  ['consumption', 'Energy Consumption', HousePlug],
  ['sharing', 'Energy Sharing', Network],
  ['analytics', 'Analytics', BarChart3],
  ['alerts', 'Alerts & Notifications', Bell],
  ['payments', 'Payments & Revenue', CreditCard],
  ['energy', 'Energy Management', Zap],
  ['settings', 'System Settings', Settings],
  ['integration', 'Device Integration', PlugZap],
  ['esp32-monitor', 'ESP32 Monitor', Cpu],
]

function ProtectedLayout({
  currentUser,
  dashboardData,
}: {
  currentUser: PublicAppUser
  dashboardData: DashboardData
}) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobile, setMobile] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [profile, setProfile] = useState(false)
  const [notifications, setNotifications] = useState(false)
  if (!user) return null
  const active = pathname.split('/').pop() || 'overview'
  const role = primaryAppRole(currentUser)
  const availableNavItems =
    role === 'solar-owner'
      ? navItems
      : navItems.filter(([id]) => id === 'payments' || id === 'energy' || id === 'settings')
  const activeItem = availableNavItems.find(([id]) => id === active)
  const primarySystem = dashboardData.systems[0]
  const unreadNotifications = dashboardData.notifications.filter(
    (notification) => !notification.readAt,
  )
  const openAlerts = dashboardData.alerts.filter(
    (alert) => alert.status === 'open' || alert.status === 'acknowledged',
  )
  const attentionCount = unreadNotifications.length + openAlerts.length
  useEffect(() => {
    if (!primarySystem || primarySystem.integrationAdapter === 'not-configured') return
    const refresh = window.setInterval(() => router.refresh(), 60_000)
    return () => window.clearInterval(refresh)
  }, [primarySystem, router])
  const doLogout = async () => {
    await logout()
    router.push('/')
    router.refresh()
  }
  return (
    <div className="app-shell flex h-dvh w-full overflow-hidden bg-[#F4F6F8] text-[#071426]">
      {mobile && (
        <button
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobile(false)}
          aria-label="Close navigation overlay"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#071426] text-white transition-all duration-300 lg:relative lg:inset-auto lg:translate-x-0 ${collapsed ? 'w-[84px]' : 'w-[264px]'} ${mobile ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div
          className={`flex h-20 shrink-0 items-center border-b border-white/10 ${collapsed ? 'justify-center px-3' : 'justify-between px-5'}`}
        >
          <Brand compact={collapsed} />
          <button onClick={() => setMobile(false)} className="text-slate-400 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className={`flex min-h-0 flex-1 flex-col pt-5 ${collapsed ? 'px-3' : 'px-4'}`}>
          {!collapsed && (
            <p className="px-3 pb-3 font-mono text-[9px] uppercase tracking-[.2em] text-slate-600">
              Energy workspace
            </p>
          )}
          <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pb-4">
            {availableNavItems.map(([id, label, Icon]: any) => (
              <Link
                title={collapsed ? label : undefined}
                key={id}
                href={`/app/${id}`}
                onClick={() => setMobile(false)}
                className={`group flex h-11 items-center gap-3 border-l-2 px-3 text-[12px] font-semibold transition ${collapsed ? 'justify-center' : ''} ${active === id ? 'border-[#FF8A24] bg-white/8 text-white' : 'border-transparent text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}
              >
                <Icon
                  className={`h-[17px] w-[17px] shrink-0 ${active === id ? (id === 'solar' ? 'text-orange-300' : 'text-blue-300') : ''}`}
                />
                {!collapsed && <span>{label}</span>}
                {id === 'alerts' && !collapsed && attentionCount > 0 && (
                  <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-[#FF8A24] px-1 text-[9px] font-bold text-[#071426]">
                    {attentionCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
        <div className={`shrink-0 border-t border-white/10 p-4 ${collapsed ? 'px-3' : ''}`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mb-3 hidden h-10 w-full items-center justify-center gap-2 border border-white/10 text-[11px] font-semibold text-slate-400 transition hover:border-white/20 hover:text-white lg:flex"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" /> Collapse navigation
              </>
            )}
          </button>
          <div className="relative">
            <button
              onClick={() => setProfile(!profile)}
              className={`flex w-full items-center gap-3 p-2 text-left transition hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#2589FF] text-[10px] font-bold">
                {user
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold">{user}</span>
                    <span className="block truncate text-[9px] text-slate-500">
                      {role === 'solar-owner' ? 'Verified Solar Owner' : 'Verified Customer'}
                    </span>
                  </span>
                  <ChevronDown className="h-3 w-3 text-slate-500" />
                </>
              )}
            </button>
            {profile && (
              <div
                className={`absolute bottom-12 z-20 w-48 border border-white/10 bg-[#10233B] p-2 shadow-2xl ${collapsed ? 'left-12' : 'left-0 right-0'}`}
              >
                <button
                  onClick={() => router.push('/app/settings')}
                  className="flex w-full items-center gap-2 p-2 text-xs hover:bg-white/5"
                >
                  <User className="h-4 w-4" />
                  Profile & settings
                </button>
                <button
                  onClick={doLogout}
                  className="flex w-full items-center gap-2 p-2 text-xs text-red-300 hover:bg-white/5"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
      <div className="flex h-dvh min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl md:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <button
              onClick={() => setMobile(true)}
              className="grid h-10 w-10 shrink-0 place-items-center border border-slate-200 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#071426]">
                {activeItem?.[1] || 'Overview'}
              </p>
              <p className="mt-0.5 hidden text-[10px] text-slate-400 sm:block">
                {primarySystem
                  ? `${primarySystem.name}${primarySystem.siteReference ? ` · ${primarySystem.siteReference}` : ''}`
                  : 'No solar system configured'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden h-10 items-center gap-2 border border-slate-200 px-3 text-[11px] font-semibold text-slate-600 md:flex">
              <CalendarDays className="h-4 w-4" /> Latest records
            </span>
            <span
              className={`hidden items-center gap-2 border-l border-slate-200 pl-4 text-[10px] font-semibold uppercase xl:flex ${
                primarySystem?.operationalStatus === 'connected'
                  ? 'text-emerald-700'
                  : 'text-slate-500'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  primarySystem?.operationalStatus === 'connected'
                    ? 'bg-emerald-500'
                    : 'bg-slate-400'
                }`}
              />{' '}
              {primarySystem?.operationalStatus?.replaceAll('-', ' ') || 'Setup pending'}
            </span>
            <ThemeToggle />
            <div className="relative">
              <button
                onClick={() => setNotifications(!notifications)}
                className="relative grid h-10 w-10 place-items-center border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-[#071426]"
              >
                <Bell className="h-4 w-4" />
                {attentionCount > 0 && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#FF8A24]" />
                )}
              </button>
              {notifications && (
                <div className="absolute right-0 top-12 w-80 border border-slate-200 bg-white p-5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">Notifications</p>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#A45115]">
                      {attentionCount} requiring attention
                    </span>
                  </div>
                  {unreadNotifications.slice(0, 4).map((notification) => (
                    <div key={notification.id} className="mt-4 border-t border-slate-100 pt-4">
                      <p className="text-xs font-semibold">{notification.title}</p>
                      <p className="mt-1 text-[10px] leading-4 text-slate-500">
                        {notification.message}
                      </p>
                    </div>
                  ))}
                  {!attentionCount && (
                    <p className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                      No unread notifications or active system alerts.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
          <SectionPage currentUser={currentUser} dashboardData={dashboardData} />
        </div>
      </div>
    </div>
  )
}

const metrics = [
  {
    label: 'Solar generation',
    value: '18.4',
    unit: 'kWh',
    sub: '4.86 kW current',
    icon: Sun,
    tone: 'orange',
    trend: '+12.4%',
    up: true,
  },
  {
    label: 'Home consumption',
    value: '12.7',
    unit: 'kWh',
    sub: '2.14 kW current',
    icon: Home,
    tone: 'blue',
    trend: '-8.1%',
    up: false,
  },
  {
    label: 'Battery storage',
    value: '78',
    unit: '%',
    sub: '1.24 kW charging',
    icon: BatteryCharging,
    tone: 'green',
    trend: 'Healthy',
    up: true,
  },
  {
    label: 'Grid import / export',
    value: '0.0',
    unit: 'kWh',
    sub: 'No measured exchange',
    icon: Factory,
    tone: 'blue',
    trend: 'Idle',
    up: true,
  },
  {
    label: 'Energy shared',
    value: '—',
    unit: 'kWh',
    sub: 'Infrastructure not configured',
    icon: Network,
    tone: 'blue',
    trend: 'Unavailable',
    up: true,
  },
]

function MetricCard({ item }: { item: (typeof metrics)[number] }) {
  const Icon = item.icon
  const tone =
    item.tone === 'orange'
      ? 'text-[#D76712]'
      : item.tone === 'green'
        ? 'text-emerald-700'
        : 'text-[#1675DD]'
  return (
    <button className="group border-t border-slate-200 bg-white px-5 py-5 text-left transition hover:bg-slate-50 xl:border-l xl:border-t-0 first:xl:border-l-0">
      <div className="flex items-center justify-between">
        <span
          className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] ${tone}`}
        >
          <Icon className="h-3.5 w-3.5" />
          {item.label}
        </span>
        <span
          className={`flex items-center gap-1 text-[9px] font-bold ${item.trend === 'Unavailable' || item.trend === 'Idle' ? 'text-slate-400' : 'text-emerald-700'}`}
        >
          {item.trend}
          {item.trend.includes('%') &&
            (item.up ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            ))}
        </span>
      </div>
      <p className="mt-6 font-mono text-3xl font-medium tracking-[-.05em] text-[#071426]">
        {item.value} <span className="text-xs tracking-normal text-slate-400">{item.unit}</span>
      </p>
      <p className="mt-2 text-[10px] text-slate-500">{item.sub}</p>
    </button>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [range, setRange] = useState('Day')
  const [flow, setFlow] = useState('Inverter')
  const [filter, setFilter] = useState('All')
  const [read, setRead] = useState<number[]>([])
  const displayedData = useMemo(
    () =>
      range === 'Day'
        ? chartData
        : chartData.map((d, i) => ({ ...d, solar: d.solar * (1 + i * 0.06), load: d.load * 0.9 })),
    [range],
  )
  const alerts = [
    { severity: 'Warning', text: 'Battery level below 20%', time: 'Yesterday · 08:15 PM' },
    {
      severity: 'Info',
      text: 'Solar generation lower than expected',
      time: 'Yesterday · 12:32 PM',
    },
    { severity: 'Resolved', text: 'Monitoring gateway back online', time: 'Oct 28 · 09:14 AM' },
  ]
  return (
    <main className="mx-auto max-w-[1600px] p-4 md:p-8 xl:p-10">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="font-mono text-[9px] font-medium uppercase tracking-[.2em] text-[#1675DD]">
            Residential energy command centre
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-.045em] text-[#071426] md:text-4xl">
            Good morning, {user?.split(' ')[0]}.
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Your connected energy system is operating normally.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> System connected
          </span>
          <span className="border border-orange-200 bg-orange-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#A45115]">
            Demo data
          </span>
        </div>
      </div>
      <section className="mt-8 overflow-hidden border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">
            Todayâ€™s energy overview
          </p>
          <p className="font-mono text-[9px] text-slate-400">Updated 12 seconds ago</p>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map((m) => (
            <MetricCard key={m.label} item={m} />
          ))}
        </div>
      </section>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_360px]">
        <section className="overflow-hidden border border-slate-200 bg-[#071426] text-white">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold">Energy flow</p>
                <span className="bg-white/10 px-2 py-1 font-mono text-[8px] uppercase tracking-widest text-slate-400">
                  Interactive demo
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-500">
                Select any node to inspect the simulated current state.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Flow active
            </div>
          </div>
          <EnergyFlow selected={flow} setSelected={setFlow} />
        </section>
        <SystemHealth />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_360px]">
        <section className="border border-slate-200 bg-white p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Energy performance</p>
              <div className="mt-2 flex flex-wrap gap-4 text-[9px] font-semibold text-slate-500">
                <span className="flex items-center gap-2">
                  <i className="h-0.5 w-5 bg-[#FF8A24]" /> Solar production
                </span>
                <span className="flex items-center gap-2">
                  <i className="h-0.5 w-5 bg-[#2589FF]" /> Consumption
                </span>
                <span className="flex items-center gap-2">
                  <i className="h-0.5 w-5 bg-[#21D6A1]" /> Battery
                </span>
              </div>
            </div>
            <div className="flex border border-slate-200">
              {['Day', 'Week', 'Month', 'Year'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-2 text-[9px] font-bold uppercase tracking-wider transition ${range === r ? 'bg-[#071426] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-7 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={displayedData}>
                <CartesianGrid stroke={theme === 'dark' ? '#213A57' : '#E8EDF2'} vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fill: theme === 'dark' ? '#9BB0C9' : '#64748B', fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: theme === 'dark' ? '#9BB0C9' : '#64748B', fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v} kW`}
                />
                <Tooltip
                  contentStyle={{
                    background: theme === 'dark' ? '#102641' : '#FFFFFF',
                    border: `1px solid ${theme === 'dark' ? '#213A57' : '#E2E8F0'}`,
                    borderRadius: 0,
                    fontSize: 10,
                    color: theme === 'dark' ? '#F4F7FC' : '#071426',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="solar"
                  name="Solar generation"
                  stroke={orange}
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="load"
                  name="Household demand"
                  stroke={blue}
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="battery"
                  name="Battery"
                  stroke={green}
                  strokeWidth={2}
                  dot={false}
                />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-sm font-semibold">Alerts & activity</p>
              <p className="mt-1 text-[9px] text-slate-400">Demo system events</p>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-slate-200 bg-white p-2 text-[9px] font-semibold text-slate-600 outline-none"
            >
              <option>All</option>
              <option>Warning</option>
              <option>Info</option>
            </select>
          </div>
          <div>
            {alerts
              .filter((a) => filter === 'All' || a.severity === filter)
              .map((a, i) => (
                <button
                  key={a.text}
                  onClick={() => setRead([...new Set([...read, i])])}
                  className={`flex w-full gap-3 border-b border-slate-100 px-5 py-4 text-left transition last:border-0 hover:bg-slate-50 ${read.includes(i) ? 'opacity-50' : ''}`}
                >
                  <span
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${a.severity === 'Warning' ? 'bg-[#FF8A24]' : a.severity === 'Resolved' ? 'bg-emerald-500' : 'bg-[#2589FF]'}`}
                  />
                  <span>
                    <span className="block text-xs font-semibold text-[#071426]">{a.text}</span>
                    <span className="mt-1 block text-[9px] text-slate-400">
                      {a.time} · {read.includes(i) ? 'Read' : 'Unread'}
                    </span>
                  </span>
                </button>
              ))}
          </div>
          <Link
            href="/app/alerts"
            className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-[10px] font-bold text-[#1675DD]"
          >
            View all activity <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      </div>
      <SharingSummary />
    </main>
  )
}

function EnergyFlow({
  selected,
  setSelected,
}: {
  selected: string
  setSelected: (s: string) => void
}) {
  const items = [
    { n: 'Solar', v: '4.86 kW', Icon: PanelTop, c: orange, x: '50%', y: '8%' },
    { n: 'Home', v: '2.14 kW', Icon: Home, c: blue, x: '50%', y: '42%' },
    { n: 'Battery', v: '78%', Icon: BatteryCharging, c: green, x: '15%', y: '73%' },
    { n: 'Grid', v: '0.00 kW', Icon: Factory, c: '#8FA3BC', x: '50%', y: '78%' },
    { n: 'Connected homes', v: 'Not configured', Icon: Users, c: blue, x: '85%', y: '73%' },
  ]
  return (
    <div>
      <div className="relative hidden h-[430px] overflow-hidden md:block">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1000 430"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <marker
              id="flowArrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="4"
              markerHeight="4"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#FF8A24" />
            </marker>
          </defs>
          <path
            d="M500 92 L500 185"
            stroke="#FF8A24"
            strokeWidth="2"
            strokeDasharray="6 8"
            markerEnd="url(#flowArrow)"
            className="animate-[dash_8s_linear_infinite]"
          />
          <path
            d="M480 245 C390 275 260 280 180 330"
            stroke="#21D6A1"
            strokeWidth="2"
            strokeDasharray="5 8"
            className="animate-[dash_9s_linear_infinite]"
          />
          <path d="M500 245 L500 330" stroke="#8FA3BC" strokeWidth="1.5" strokeDasharray="5 9" />
          <path
            d="M520 245 C610 275 740 280 820 330"
            stroke="#2589FF"
            strokeWidth="1.5"
            strokeDasharray="5 9"
          />
        </svg>
        {items.map(({ n, v, Icon, c, x, y }) => (
          <button
            key={n}
            onClick={() => setSelected(n)}
            style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
            className={`absolute z-10 flex w-40 flex-col items-center border px-3 py-4 transition ${selected === n ? 'border-white/50 bg-[#102641]' : 'border-white/10 bg-[#091A2E] hover:border-white/30'}`}
          >
            <span
              className="grid h-9 w-9 place-items-center border border-white/10"
              style={{ color: c }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="mt-2 text-[10px] font-semibold">{n}</span>
            <span className="mt-1 font-mono text-[8px] text-slate-500">{v}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-2 p-4 md:hidden">
        {items.map(({ n, v, Icon, c }) => (
          <button
            key={n}
            onClick={() => setSelected(n)}
            className={`flex items-center border p-3 text-left ${selected === n ? 'border-white/50 bg-white/10' : 'border-white/10'}`}
          >
            <Icon className="h-4 w-4" style={{ color: c }} />
            <span className="ml-3 text-[10px] font-semibold">{n}</span>
            <span className="ml-auto font-mono text-[8px] text-slate-500">{v}</span>
          </button>
        ))}
      </div>
      <div className="flex items-start gap-3 border-t border-white/10 bg-white/[.03] px-6 py-4 text-[10px] leading-5 text-slate-400">
        <Zap className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" />
        <span>
          <strong className="text-white">{selected} selected.</strong> Values are simulated. Sharing
          remains unavailable until supported infrastructure and metering are connected.
        </span>
      </div>
    </div>
  )
}

function SystemHealth() {
  const systems = [
    ['Inverter', 'Connected', PlugZap],
    ['Battery', 'Healthy', BatteryCharging],
    ['Gateway', 'Online', Wifi],
  ]
  return (
    <section className="border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">System health</p>
            <p className="mt-1 text-[9px] text-slate-400">Compact equipment monitoring</p>
          </div>
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
        </div>
      </div>
      <div>
        {systems.map(([label, status, Icon]: any) => (
          <div key={label} className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <Icon className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold">{label}</span>
            <span className="ml-auto flex items-center gap-2 text-[9px] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {status}
            </span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 border-b border-slate-100">
        <div className="border-r border-slate-100 p-5">
          <p className="text-[9px] uppercase tracking-wider text-slate-400">Inverter temp.</p>
          <p className="mt-2 font-mono text-xl">36Â°C</p>
        </div>
        <div className="p-5">
          <p className="text-[9px] uppercase tracking-wider text-slate-400">Battery health</p>
          <p className="mt-2 font-mono text-xl">96%</p>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start gap-3 border border-orange-100 bg-orange-50 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#D76712]" />
          <div>
            <p className="text-[10px] font-bold text-[#8B4210]">Maintenance forecast</p>
            <p className="mt-1 text-[9px] leading-4 text-[#A45115]">
              Routine inspection suggested in 42 days. Demo notice only.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function SharingSummary() {
  return (
    <section className="mt-6 border border-slate-200 bg-white">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold">Energy sharing network</p>
            <span className="bg-slate-100 px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-slate-500">
              Not configured
            </span>
          </div>
          <p className="mt-1 text-[10px] text-slate-500">
            Actual sharing activity will appear after compatible infrastructure and metering are
            verified.
          </p>
        </div>
        <Link
          href="/app/sharing"
          className="flex items-center gap-2 text-[10px] font-bold text-[#1675DD]"
        >
          Review sharing setup <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Connected households', '0', 'No verified participants'],
          ['Available to share', '— kWh', 'Measurement unavailable'],
          ['Energy received', '— kWh', 'No measured activity'],
          ['Energy distributed', '— kWh', 'No measured activity'],
        ].map(([label, value, note], i) => (
          <div
            key={label}
            className={`p-6 ${i ? 'border-t border-slate-100 sm:border-l lg:border-t-0' : ''}`}
          >
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-4 font-mono text-2xl">{value}</p>
            <p className="mt-2 text-[9px] text-slate-400">{note}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function RecordsEmptyState({
  title,
  message,
  action,
}: {
  title: string
  message: string
  action?: { href: string; label: string }
}) {
  return (
    <section className="mt-8 border border-slate-200 bg-white p-8 md:p-12">
      <span className="grid h-12 w-12 place-items-center border border-blue-100 bg-blue-50 text-[#1675DD]">
        <Activity className="h-5 w-5" />
      </span>
      <h2 className="mt-7 text-2xl font-semibold tracking-[-.03em] text-[#071426]">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">{message}</p>
      <div className="mt-7 border-l-2 border-[#FF8A24] bg-orange-50 px-4 py-3 text-xs leading-6 text-[#8B4210]">
        No placeholder readings are shown. SolarShare displays measurements only after verified
        equipment records are available for this account.
      </div>
      {action && (
        <Link
          href={action.href}
          className="mt-6 inline-flex min-h-11 items-center bg-[#071426] px-5 text-xs font-bold text-white"
        >
          {action.label}
        </Link>
      )}
    </section>
  )
}

function LiveDashboard({ data, user: currentUser }: { data: DashboardData; user: PublicAppUser }) {
  const { user } = useAuth()
  const { theme } = useTheme()
  const snapshot = data.telemetry
  const esp32Systems = data.systems.filter(
    (system) => system.integrationAdapter === 'esp32-monitor',
  )
  const chart = snapshot.powerHistory.map((record) => ({
    time: new Date(record.measuredAt).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    generation: record.generationKW,
    consumption: record.consumptionKW,
  }))
  const display = (value?: number, digits = 2) =>
    value === undefined ? '—' : value.toFixed(digits)
  const cards = [
    {
      label: 'Solar generation',
      value: display(snapshot.solarPower.value),
      unit: 'kW',
      state: snapshot.solarPower.state,
      measuredAt: snapshot.solarPower.measuredAt,
      Icon: Sun,
      color: 'text-[#D76712]',
    },
    {
      label: 'Home consumption',
      value: display(snapshot.consumptionPower.value),
      unit: 'kW',
      state: snapshot.consumptionPower.state,
      measuredAt: snapshot.consumptionPower.measuredAt,
      Icon: Home,
      color: 'text-[#1675DD]',
    },
    {
      label: 'Battery charge',
      value: display(snapshot.batteryStateOfCharge.value, 0),
      unit: '%',
      state: snapshot.batteryStateOfCharge.state,
      measuredAt: snapshot.batteryStateOfCharge.measuredAt,
      Icon: BatteryCharging,
      color: 'text-emerald-700',
    },
    {
      label: `Battery ${snapshot.batteryPower.operatingState}`,
      value: display(snapshot.batteryPower.value),
      unit: 'kW',
      state: snapshot.batteryPower.state,
      measuredAt: snapshot.batteryPower.measuredAt,
      Icon: BatteryCharging,
      color: 'text-emerald-700',
    },
    {
      label: `Grid ${snapshot.gridPower.operatingState}`,
      value: display(snapshot.gridPower.value),
      unit: 'kW',
      state: snapshot.gridPower.state,
      measuredAt: snapshot.gridPower.measuredAt,
      Icon: Factory,
      color: 'text-[#1675DD]',
    },
    {
      label: 'Today generated',
      value: display(snapshot.dailyTotals.generationKWh, 1),
      unit: 'kWh',
      state:
        snapshot.dailyTotals.generationKWh === undefined
          ? ('unavailable' as const)
          : ('historical' as const),
      Icon: BarChart3,
      color: 'text-[#D76712]',
    },
  ]
  return (
    <main className="mx-auto max-w-[1600px] p-4 md:p-8 xl:p-10">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[.2em] text-[#1675DD]">
            Private energy workspace
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-.045em] text-[#071426] md:text-4xl">
            Welcome, {user?.split(' ')[0]}.
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Verified records belonging to your account appear here.
          </p>
        </div>
        <span
          className={`w-fit border px-3 py-2 text-[9px] font-bold uppercase tracking-wider ${
            snapshot.deviceStatus === 'connected'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          {snapshot.deviceStatus}
          {snapshot.lastSuccessfulUpdate
            ? ` · ${new Date(snapshot.lastSuccessfulUpdate).toLocaleString()}`
            : ''}
        </span>
      </div>
      {!data.systems.length && !data.energy.length ? (
        <RecordsEmptyState
          title="Your energy workspace is ready"
          message="No solar system or metering records are connected to this account yet. Once installation and data-source verification are complete, generation, consumption and battery measurements will appear here."
          action={
            currentUser.roles.includes('solar-owner')
              ? { href: '/app/energy', label: 'Complete solar-system setup' }
              : undefined
          }
        />
      ) : (
        <>
          <section className="mt-8 grid overflow-hidden border border-slate-200 bg-white sm:grid-cols-2 xl:grid-cols-3">
            {cards.map(({ label, value, unit, Icon, color, state, measuredAt }, index) => (
              <div
                key={label}
                className={`p-6 ${index ? 'border-t border-slate-200 sm:border-l xl:border-t-0' : ''}`}
              >
                <div
                  className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] ${color}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  <span
                    className={`ml-auto text-[8px] ${
                      state === 'live'
                        ? 'text-emerald-700'
                        : state === 'demo'
                          ? 'text-[#A45115]'
                          : 'text-slate-400'
                    }`}
                  >
                    {state}
                  </span>
                </div>
                <p className="mt-6 font-mono text-3xl text-[#071426]">
                  {value} <span className="text-xs text-slate-400">{unit}</span>
                </p>
                <p className="mt-2 text-[9px] text-slate-400">
                  {measuredAt
                    ? `Measured ${new Date(measuredAt).toLocaleString()}`
                    : 'No valid measurement available'}
                </p>
              </div>
            ))}
          </section>
          <section className="mt-6 grid overflow-hidden border border-slate-200 bg-white sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Generation today', snapshot.dailyTotals.generationKWh],
              ['Consumption today', snapshot.dailyTotals.consumptionKWh],
              ['Grid import today', snapshot.dailyTotals.gridImportKWh],
              ['Grid export today', snapshot.dailyTotals.gridExportKWh],
            ].map(([label, value], index) => (
              <div
                key={String(label)}
                className={`p-5 ${index ? 'border-t border-slate-200 sm:border-l xl:border-t-0' : ''}`}
              >
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {label}
                </p>
                <p className="mt-3 font-mono text-xl text-[#071426]">
                  {typeof value === 'number' ? value.toFixed(1) : '—'}{' '}
                  <span className="text-[10px] text-slate-400">kWh</span>
                </p>
              </div>
            ))}
          </section>

          {/* ESP32 ENERGY MONITOR WIDGETS */}
          {esp32Systems.length > 0 && (
            <section className="mt-8">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[.2em] text-[#1675DD]">
                    Device telemetry
                  </p>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight text-[#071426]">
                    ESP32 Energy Monitor
                  </h2>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Latest gateway measurements · Informational data only
                  </p>
                </div>
                <Link
                  href="/app/esp32-monitor"
                  className="text-[10px] font-semibold text-[#1675DD] transition hover:text-[#FF8A24]"
                >
                  Open full monitor →
                </Link>
              </div>

              <div className="grid gap-5">
                {esp32Systems.map((system) => {
                  const reading = data.esp32Readings.find((item) => {
                    const readingSystemId =
                      typeof item.system === 'object' ? item.system.id : item.system

                    return readingSystemId === system.id
                  })

                  return (
                    <article
                      key={system.id}
                      className="overflow-hidden border border-slate-200 bg-white"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                        <div>
                          <h3 className="text-sm font-semibold text-[#071426]">
                            {system.name}
                          </h3>
                          <p className="mt-1 font-mono text-[10px] text-slate-400">
                            Gateway: {system.gatewayReference || 'Not specified'}
                          </p>
                        </div>

                        {reading ? (
                          <div className="flex flex-wrap gap-2">
                            <span className="border border-slate-200 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                              {reading.mode}
                            </span>
                            <span className="border border-amber-200 bg-amber-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                              {reading.quality}
                            </span>
                          </div>
                        ) : (
                          <span className="border border-slate-200 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            Awaiting readings
                          </span>
                        )}
                      </div>

                      {reading ? (
                        <>
                          <div className="grid gap-3 p-4 md:grid-cols-2">
                            {[
                              {
                                title: 'Load 1',
                                voltage: reading.voltage1,
                                current: reading.current1,
                                power: reading.power1VA,
                                relay: reading.relay1,
                              },
                              {
                                title: 'Load 2',
                                voltage: reading.voltage2,
                                current: reading.current2,
                                power: reading.power2VA,
                                relay: reading.relay2,
                              },
                            ].map((load) => (
                              <div
                                key={load.title}
                                className="border border-slate-100 bg-slate-50/60 p-4"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="text-xs font-semibold text-[#071426]">
                                    {load.title}
                                  </h4>
                                  <span
                                    className={`text-[9px] font-bold uppercase tracking-wider ${
                                      typeof load.relay === 'boolean'
                                        ? load.relay
                                          ? 'text-emerald-600'
                                          : 'text-slate-500'
                                        : 'text-amber-600'
                                    }`}
                                  >
                                    {typeof load.relay === 'boolean'
                                      ? load.relay
                                        ? 'Relay ON'
                                        : 'Relay OFF'
                                      : 'Relay unknown'}
                                  </span>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-2">
                                  {[
                                    ['Voltage', load.voltage, 'V'],
                                    ['Current', load.current, 'A'],
                                    ['Apparent power', load.power, 'VA'],
                                  ].map(([label, value, unit]) => (
                                    <div key={String(label)}>
                                      <p className="text-[8px] uppercase tracking-wider text-slate-400">
                                        {label}
                                      </p>
                                      <p className="mt-2 font-mono text-base text-[#071426]">
                                        {typeof value === 'number'
                                          ? value.toFixed(2)
                                          : '—'}
                                        <span className="ml-1 text-[9px] text-slate-400">
                                          {unit}
                                        </span>
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 px-5 py-3 text-[9px] text-slate-400">
                            <span>
                              Measured {new Date(reading.measuredAt).toLocaleString()}
                            </span>
                            <span>
                              Received {new Date(reading.receivedAt).toLocaleString()}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="p-6">
                          <p className="text-xs font-semibold text-[#071426]">
                            No ESP32 readings received yet
                          </p>
                          <p className="mt-1 text-[10px] leading-5 text-slate-500">
                            Measurements will appear here after this gateway sends
                            its first accepted telemetry event.
                          </p>
                        </div>
                      )}

                      <div className="border-t border-amber-100 bg-amber-50/60 px-5 py-3">
                        <p className="text-[9px] leading-5 text-amber-800">
                          These ESP32 measurements are unverified. Apparent power is
                          shown in VA and is excluded from verified energy totals and billing.
                        </p>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )}

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_360px]">
            <section className="border border-slate-200 bg-white p-6">
              <div>
                <h2 className="text-sm font-semibold">Power history</h2>
                <p className="mt-1 text-[10px] text-slate-500">
                  Generation and consumption · kW · verified or estimated readings
                </p>
              </div>
              {chart.length ? (
                <div className="mt-7 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReLineChart data={chart}>
                      <CartesianGrid
                        stroke={theme === 'dark' ? '#213A57' : '#E8EDF2'}
                        vertical={false}
                      />
                      <XAxis dataKey="time" hide />
                      <YAxis
                        tick={{ fill: '#64748B', fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip />
                      <Line
                        connectNulls
                        type="monotone"
                        dataKey="generation"
                        stroke={orange}
                        strokeWidth={2.5}
                        dot={false}
                      />
                      <Line
                        connectNulls
                        type="monotone"
                        dataKey="consumption"
                        stroke={blue}
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </ReLineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="mt-8 border border-dashed border-slate-200 p-8 text-sm text-slate-500">
                  No measured energy records are available.
                </p>
              )}
            </section>
            <section className="border border-slate-200 bg-white">
              <div className="border-b border-slate-100 p-5">
                <h2 className="text-sm font-semibold">Registered systems</h2>
              </div>
              {data.systems.length ? (
                data.systems.map((system) => (
                  <div key={system.id} className="border-b border-slate-100 p-5 last:border-0">
                    <p className="text-xs font-semibold">{system.name}</p>
                    <p className="mt-2 text-[10px] text-slate-500">
                      {system.locationLabel || 'Location not provided'} ·{' '}
                      {system.capacityKW ? `${system.capacityKW} kW` : 'Capacity pending'}
                    </p>
                    <p className="mt-2 text-[9px] uppercase tracking-wider text-slate-400">
                      {system.operationalStatus || 'pending'} ·{' '}
                      {system.lastTelemetryAt
                        ? `Last telemetry ${new Date(system.lastTelemetryAt).toLocaleString()}`
                        : 'No telemetry received'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="p-5 text-xs text-slate-500">No systems registered.</p>
              )}
            </section>
          </div>
          <section className="mt-6 border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-5">
              <h2 className="text-sm font-semibold">Recent notifications</h2>
            </div>
            {data.notifications.length ? (
              data.notifications.slice(0, 6).map((notification) => (
                <div
                  key={notification.id}
                  className="flex gap-3 border-b border-slate-100 p-5 last:border-0"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.severity === 'critical' || notification.severity === 'warning' ? 'bg-[#FF8A24]' : notification.severity === 'resolved' ? 'bg-emerald-500' : 'bg-[#2589FF]'}`}
                  />
                  <div>
                    <p className="text-xs font-semibold">{notification.title}</p>
                    <p className="mt-1 text-[10px] leading-5 text-slate-500">
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-5 text-xs text-slate-500">No notifications for this account.</p>
            )}
          </section>
        </>
      )}
    </main>
  )
}

function DataSection({ section, data }: { section: string; data: DashboardData }) {
  const item = navItems.find(([id]) => id === section)
  if (!item) return null
  const [, title, Icon] = item
  const records =
    section === 'sharing'
      ? data.sharing
      : section === 'alerts'
        ? data.alerts
        : data.energy.filter((record) =>
            section === 'solar'
              ? record.kind === 'generation'
              : section === 'consumption'
                ? record.kind === 'consumption'
                : section === 'battery'
                  ? record.kind.startsWith('battery-')
                  : true,
          )
  return (
    <main className="mx-auto max-w-[1600px] p-4 md:p-8 xl:p-10">
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[.2em] text-[#1675DD]">
          Private SolarShare records
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-.045em] text-[#071426]">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Only records owned by your authenticated account are shown. Unverified measurements are
          identified by their source metadata and excluded from overview totals.
        </p>
      </div>
      {records.length ? (
        <section className="mt-8 overflow-hidden border border-slate-200 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-100 p-5">
            <Icon className="h-5 w-5 text-[#1675DD]" />
            <h2 className="text-sm font-semibold">Recent records</h2>
            <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-slate-400">
              {records.length} available
            </span>
          </div>
          <div>
            {records.slice(0, 50).map((record) => (
              <div
                key={record.id}
                className="grid gap-2 border-b border-slate-100 p-5 text-xs last:border-0 sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-semibold">
                    {'description' in record
                      ? `${record.severity} ${record.category} alert`
                      : 'kind' in record
                        ? record.kind.replaceAll('-', ' ')
                        : `${record.direction} allocation`}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {'description' in record
                      ? record.description
                      : new Date(record.recordedAt).toLocaleString()}
                  </p>
                </div>
                {'value' in record && (
                  <span className="font-mono">
                    {record.value} {record.unit} · {record.telemetryStatus || 'historical'} ·{' '}
                    {record.quality || 'unverified'}
                  </span>
                )}
                {'energyKWh' in record && (
                  <span className="font-mono">
                    {record.energyKWh} kWh · {record.status}
                  </span>
                )}
                {'description' in record && (
                  <span className="font-mono capitalize">{record.status}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <RecordsEmptyState
          title={`No ${title.toLowerCase()} records yet`}
          message="This account has no verified records in this category. Data will appear after a supported source has been connected and ownership has been confirmed."
        />
      )}
    </main>
  )
}

function SectionPage({
  currentUser,
  dashboardData,
}: {
  currentUser: PublicAppUser
  dashboardData: DashboardData
}) {
  const pathname = usePathname()
  const section = pathname.split('/').pop() || 'overview'
  if (section === 'overview') return <LiveDashboard data={dashboardData} user={currentUser} />
  if (section === 'energy' || section === 'payments') {
    return <EnergyManagement user={currentUser} data={dashboardData.commerce} />
  }
  if (section === 'settings') return <ProfileSettings user={currentUser} />
  if (section === 'esp32-monitor') {
    return <ESP32MonitorPage readings={dashboardData.esp32Readings} />
  }
  if (section === 'integration') {
    return <DeviceIntegrationSettings systems={dashboardData.systems} />
  }
  return <DataSection section={section} data={dashboardData} />
}

export default function SolarShareApp({
  currentUser,
  dashboardData,
}: {
  currentUser?: PublicAppUser | null
  dashboardData?: DashboardData
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [theme, setTheme] = useState<Theme>('light')
  const [themeReady, setThemeReady] = useState(false)
  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    setThemeReady(true)
  }, [])
  useEffect(() => {
    if (!themeReady) return
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
    localStorage.setItem(BRAND.themeStorageKey, theme)
  }, [theme, themeReady])
  const value = useMemo<AuthValue>(
    () => ({
      user: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : null,
      logout: async () => {
        await logoutAction()
        router.refresh()
      },
    }),
    [currentUser, router],
  )
  const themeValue = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  )
  const content =
    pathname.startsWith('/app') && currentUser && dashboardData ? (
      <ProtectedLayout currentUser={currentUser} dashboardData={dashboardData} />
    ) : (
      <Landing />
    )
  return (
    <ThemeContext.Provider value={themeValue}>
      <AuthContext.Provider value={value}>{content}</AuthContext.Provider>
    </ThemeContext.Provider>
  )
}
