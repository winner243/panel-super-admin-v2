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
  LayoutDashboard,
  ListChecks,
  Lock,
  Mail,
  Plug,
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
      { title: 'Subscriptions', icon: CreditCard, disabled: true },
      { title: 'Payments', icon: BadgeDollarSign, disabled: true },
      { title: 'Invoices', icon: FileText, disabled: true },
    ],
  },
  {
    heading: 'Product',
    items: [
      { title: 'Usage', icon: Gauge, disabled: true },
      { title: 'Feature Flags', icon: Flag, disabled: true },
    ],
  },
  {
    heading: 'Communication',
    items: [
      { title: 'Notifications', icon: Bell, disabled: true },
      { title: 'Emails', icon: Mail, disabled: true },
    ],
  },
  {
    heading: 'Infrastructure',
    items: [
      { title: 'Storage', icon: Database, disabled: true },
      { title: 'Webhooks', icon: Webhook, disabled: true },
      { title: 'Jobs', icon: ListChecks, disabled: true },
      { title: 'System Health', icon: Activity, disabled: true },
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
      { title: 'API', icon: Plug, disabled: true },
      { title: 'Integrations', icon: Puzzle, disabled: true },
    ],
  },
  {
    heading: '',
    items: [{ title: 'Settings', href: '/settings', icon: Settings }],
  },
]