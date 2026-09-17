"use client"

import { Moon, Monitor, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const THEME_OPTIONS = [
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "system", label: "Système", icon: Monitor },
] as const

type ThemeValue = (typeof THEME_OPTIONS)[number]["value"]

const THEME_VALUES: readonly ThemeValue[] = ["light", "dark", "system"]

export function ThemePreference() {
  const { theme, setTheme } = useTheme()

  const activeValue: ThemeValue = THEME_VALUES.includes(theme as ThemeValue)
    ? (theme as ThemeValue)
    : "system"

  return (
    <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Thème d’affichage">
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon
        const isActive = activeValue === option.value

        return (
          <Button
            key={option.value}
            type="button"
            variant="outline"
            aria-checked={isActive}
            role="radio"
            onClick={() => setTheme(option.value)}
            className={cn(
              "h-auto flex-col gap-3 py-6",
              isActive && "border-primary bg-lightprimary text-primary",
            )}>
            <Icon className="size-5" aria-hidden="true" />
            <span className="text-sm font-medium">{option.label}</span>
          </Button>
        )
      })}
    </div>
  )
}