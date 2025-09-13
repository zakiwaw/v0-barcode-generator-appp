"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { QrCode, LayoutDashboard, LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const authenticated = localStorage.getItem("authenticated") === "true"
    setIsAuthenticated(authenticated)
  }, [])

  const handleSignOut = () => {
    try {
      localStorage.removeItem("authenticated")
      localStorage.removeItem("savedBarcodes")
      setIsAuthenticated(false)

      toast({
        title: "Erfolg",
        description: "Erfolgreich abgemeldet!",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Abmeldung fehlgeschlagen",
        variant: "destructive",
      })
    }
  }

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            <span className="font-bold text-base">Barcode Generator</span>
          </div>

          <div className="flex items-center gap-1">
            <Button variant={pathname === "/" ? "default" : "ghost"} size="sm" asChild className="h-9 px-3">
              <Link href="/">
                <QrCode className="w-4 h-4 mr-1" />
                Generator
              </Link>
            </Button>
            <Button variant={pathname === "/dashboard" ? "default" : "ghost"} size="sm" asChild className="h-9 px-3">
              <Link href="/dashboard">
                <LayoutDashboard className="w-4 h-4 mr-1" />
                Dashboard
              </Link>
            </Button>

            {isAuthenticated ? (
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-9 px-3 ml-2">
                <LogOut className="w-4 h-4 mr-1" />
                Abmelden
              </Button>
            ) : (
              <Button variant="ghost" size="sm" asChild className="h-9 px-3 ml-2">
                <Link href="/auth/login">Anmelden</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
