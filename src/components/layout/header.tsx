"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useTheme } from "next-themes"
import { Loader2, LogOut, Menu, Moon, Settings, Sun } from "lucide-react"
import { logoutAction } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AuthUser } from "@/types/auth"
import { Brand } from "@/components/brand"
import { SidebarContent } from "./nav-content"

export function Header({ user }: { user: AuthUser }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, startSignOut] = useTransition()
  const { resolvedTheme, setTheme } = useTheme()

  const displayName = user.fullName ?? user.email
  const initial = displayName.charAt(0).toUpperCase() || "A"

  function handleSignOut() {
    startSignOut(async () => {
      await logoutAction()
    })
  }

  return (
    <header className='sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 lg:px-6'>
      <div className='flex items-center gap-2'>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              aria-label='Ouvrir la navigation'
              className='lg:hidden'>
              <Menu className='size-5' />
            </Button>
          </SheetTrigger>
          <SheetContent side='left' className='w-72 gap-0 p-0'>
            <SheetTitle className='sr-only'>Navigation</SheetTitle>
            <div className='flex h-16 shrink-0 items-center border-b border-border px-6'>
              <Brand />
            </div>
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="flex items-center lg:hidden">
          <Brand compact />
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='icon' aria-label='Changer de thème'>
              {resolvedTheme === 'dark' ? (
                <Moon className='size-4' />
              ) : (
                <Sun className='size-4' />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => setTheme('light')}>Clair</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              Sombre
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              Système
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              aria-label='Menu du compte'
              className='rounded-full'>
              <span className='flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white'>
                {initial}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className='size-4' />
                Paramètres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={signingOut}
              onSelect={(event) => {
                event.preventDefault()
                handleSignOut()
              }}>
              {signingOut ? (
                <Loader2 className='size-4 animate-spin' aria-hidden='true' />
              ) : (
                <LogOut className='size-4' />
              )}
              {signingOut ? 'Déconnexion…' : 'Déconnexion'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}