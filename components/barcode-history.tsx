"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Trash2, Eye, Calendar, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { logout } from "@/app/auth/login/actions"

interface Barcode {
  id: string
  data: string
  format: string
  created_at: string
}

export function BarcodeHistory() {
  const [barcodes, setBarcodes] = useState<Barcode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBarcode, setSelectedBarcode] = useState<Barcode | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  // Load JsBarcode library
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"
    script.async = true
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    loadBarcodes()
  }, [])

  const loadBarcodes = async () => {
    setIsLoading(true)
    try {
      // Get the profile ID (there should only be one)
      const { data: profile } = await supabase.from("profiles").select("id").limit(1).single()

      if (!profile) {
        toast({
          title: "Fehler",
          description: "Profil nicht gefunden. Bitte melden Sie sich erneut an.",
          variant: "destructive",
        })
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase
        .from("barcodes")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setBarcodes(data || [])
    } catch (error) {
      console.error("Load error:", error)
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Barcodes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const viewBarcode = (barcode: Barcode) => {
    if (!window.JsBarcode) {
      toast({
        title: "Fehler",
        description: "Barcode-Bibliothek lädt noch. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      })
      return
    }

    setSelectedBarcode(barcode)

    // Generate barcode on canvas
    setTimeout(() => {
      const canvas = canvasRef.current
      if (canvas) {
        try {
          window.JsBarcode(canvas, barcode.data, {
            format: barcode.format,
            width: 2,
            height: 60, // Reduced height for mobile
            displayValue: true,
            fontSize: 10, // Smaller font for mobile
            margin: 4, // Reduced margin for mobile
          })
        } catch (error) {
          toast({
            title: "Fehler",
            description: "Fehler beim Generieren der Barcode-Vorschau",
            variant: "destructive",
          })
        }
      }
    }, 100)
  }

  const downloadBarcode = (barcode: Barcode) => {
    if (!window.JsBarcode) {
      toast({
        title: "Fehler",
        description: "Barcode-Bibliothek lädt noch. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      })
      return
    }

    try {
      // Create temporary canvas for download
      const tempCanvas = document.createElement("canvas")
      window.JsBarcode(tempCanvas, barcode.data, {
        format: barcode.format,
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 14,
        margin: 10,
      })

      const link = document.createElement("a")
      link.download = `barcode-${barcode.data}-${Date.now()}.png`
      link.href = tempCanvas.toDataURL()
      link.click()

      toast({
        title: "Erfolg",
        description: "Barcode erfolgreich heruntergeladen!",
      })
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Download fehlgeschlagen",
        variant: "destructive",
      })
    }
  }

  const deleteBarcode = async (id: string) => {
    try {
      const { error } = await supabase.from("barcodes").delete().eq("id", id)

      if (error) throw error

      setBarcodes((prev) => prev.filter((b) => b.id !== id))
      if (selectedBarcode?.id === id) {
        setSelectedBarcode(null)
      }
      toast({
        title: "Erfolg",
        description: "Barcode erfolgreich gelöscht!",
      })
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen des Barcodes",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Barcodes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Barcode List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5" />
              Gespeicherte Barcodes ({barcodes.length})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {barcodes.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">Noch keine gespeicherten Barcodes.</p>
              <p className="text-sm text-muted-foreground mt-2">Generieren Sie Barcodes, um sie hier zu sehen.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {barcodes.map((barcode) => (
                <div
                  key={barcode.id}
                  className={`p-3 border border-border rounded-lg transition-colors ${
                    selectedBarcode?.id === barcode.id ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        CODE128
                      </Badge>
                      <span className="font-mono text-sm truncate">{barcode.data}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{formatDate(barcode.created_at)}</span>

                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => viewBarcode(barcode)} className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadBarcode(barcode)}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteBarcode(barcode.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Barcode Preview */}
      {selectedBarcode && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Barcode Vorschau</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-2">
                  <Badge className="text-xs">CODE128</Badge>
                  <span className="font-mono text-sm">{selectedBarcode.data}</span>
                </div>
                <p className="text-xs text-muted-foreground">Erstellt: {formatDate(selectedBarcode.created_at)}</p>
              </div>

              <div className="flex justify-center">
                <div className="border border-border rounded-lg p-2 bg-white">
                  <canvas ref={canvasRef} className="max-w-full h-auto" />
                </div>
              </div>

              <div className="flex justify-center gap-2">
                <Button onClick={() => downloadBarcode(selectedBarcode)} variant="outline" size="sm" className="h-10">
                  <Download className="w-4 h-4 mr-2" />
                  Herunterladen
                </Button>
                <Button onClick={() => deleteBarcode(selectedBarcode.id)} variant="outline" size="sm" className="h-10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Löschen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
