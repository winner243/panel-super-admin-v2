'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Lock } from 'lucide-react'
import { navSections } from './nav-items'
import { cn } from '@/lib/utils'

export function SidebarContent() {
  const pathname = usePathname()

  return (
    <nav className='flex-1 overflow-y-auto px-3 py-4'>
      {navSections.map((section, index) => (
        <div key={index} className='mb-6'>
          {section.heading ? (
            <p className='mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              {section.heading}
            </p>
          ) : null}
          <ul className='space-y-1'>
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = !item.disabled && item.href === pathname

              if (item.href && !item.disabled) {
                return (
                  <li key={item.title}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}>
                      {Icon ? <Icon className='size-4 shrink-0' /> : null}
                      {item.title}
                    </Link>
                  </li>
                )
              }

              return (
                <li
                  key={item.title}
                  className='flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground opacity-60'>
                  {Icon ? <Icon className='size-4 shrink-0' /> : null}
                  {item.title}
                  {item.disabled ? (
                    <Lock
                      aria-hidden='true'
                      className='ms-auto size-3 shrink-0'
                    />
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}