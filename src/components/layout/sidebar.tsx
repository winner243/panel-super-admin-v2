import { Brand } from '@/components/brand'
import { SidebarContent } from './nav-content'

export function Sidebar() {
  return (
    <aside className='fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex'>
      <div className='flex h-16 shrink-0 items-center border-b border-border px-6'>
        <Brand />
      </div>
      <SidebarContent />
    </aside>
  )
}