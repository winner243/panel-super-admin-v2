import Link from 'next/link'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Page introuvable',
  description: 'La page demandée n’existe pas.',
}

export default function NotFound() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-background px-4'>
      <div className='text-center'>
        <p className='text-6xl font-semibold text-primary'>404</p>
        <h1 className='mt-4 text-2xl font-semibold tracking-tight'>
          Page introuvable
        </h1>
        <p className='mt-2 text-sm text-muted-foreground'>
          La page que vous recherchez n’existe pas ou a été déplacée.
        </p>
        <Button asChild className='mt-6'>
          <Link href='/'>Retour au tableau de bord</Link>
        </Button>
      </div>
    </div>
  )
}