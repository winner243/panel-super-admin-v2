import {
  Activity,
  BadgeDollarSign,
  Bell,
  Boxes,
  Building2,
  CreditCard,
  Database,
  FileText,
  Flag,
  Gauge,
  Key,
  LayoutDashboard,
  ListChecks,
  Lock,
  Mail,
  Puzzle,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
  Webhook,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  title: string
  href?: string
  icon?: LucideIcon
  disabled?: boolean
  children?: NavItem[]
}

export interface NavSection {
  heading: string
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    heading: '',
    items: [{ title: 'Dashboard', href: '/', icon: LayoutDashboard }],
  },
  {
    heading: 'Management',
    items: [
      { title: 'Users', href: '/users', icon: Users },
      { title: 'Organizations', href: '/organizations', icon: Building2 },
      { title: 'Roles', href: '/roles', icon: ShieldCheck },
      { title: 'Permissions', href: '/permissions', icon: Lock },
    ],
  },
  {
    heading: 'Billing',
    items: [
      { title: 'Plans', icon: Boxes, disabled: true },
      { title: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
      { title: 'Payments', href: '/payments', icon: BadgeDollarSign },
      { title: 'Revenue', href: '/revenue', icon: BadgeDollarSign },
      { title: 'Invoices', icon: FileText, disabled: true },
    ],
  },
  {
    heading: 'Product',
    items: [
      { title: 'Usage', icon: Gauge, disabled: true },
      { title: 'Analytics', href: '/analytics', icon: Activity },
      { title: 'Feature Flags', href: '/feature-flags', icon: Flag },
    ],
  },
  {
    heading: 'Communication',
    items: [
      { title: 'Notifications', href: '/notifications', icon: Bell },
      { title: 'Emails', icon: Mail, disabled: true },
    ],
  },
  {
    heading: 'Infrastructure',
    items: [
      { title: 'Storage', icon: Database, disabled: true },
      { title: 'Webhooks', href: '/webhooks', icon: Webhook },
      { title: 'Jobs', href: '/jobs', icon: ListChecks },
      { title: 'System Health', href: '/system-health', icon: Activity },
    ],
  },
  {
    heading: 'Security',
    items: [
      { title: 'Audit Logs', href: '/audit', icon: ScrollText },
      { title: 'Security', icon: Lock, disabled: true },
    ],
  },
  {
    heading: 'Developer',
    items: [
      { title: 'API', href: '/api-keys', icon: Key },
      { title: 'Integrations', icon: Puzzle, disabled: true },
    ],
  },
  {
    heading: '',
    items: [{ title: 'Settings', href: '/settings', icon: Settings }],
  },
]