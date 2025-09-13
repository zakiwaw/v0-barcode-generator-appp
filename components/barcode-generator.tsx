"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

// Import JsBarcode library
declare global {
  interface Window {
    JsBarcode: any
  }
}

export function BarcodeGenerator() {
  const [data, setData] = useState("")
  const [format, setFormat] = useState("CODE128")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
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
      document.head.removeChild(script)
    }
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const generateBarcode = async () => {
    if (!data.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie Daten ein, um einen Barcode zu generieren",
        variant: "destructive",
      })
      return
    }

    if (!window.JsBarcode) {
      toast({
        title: "Fehler",
        description: "Barcode-Bibliothek lädt noch. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const canvas = canvasRef.current
      if (canvas) {
        // Clear previous barcode
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }

        // Generate new barcode
        window.JsBarcode(canvas, data, {
          format: format,
          width: 2,
          height: 80,
          displayValue: true,
          fontSize: 12,
          margin: 8,
        })

        if (user) {
          try {
            const { error } = await supabase.from("barcodes").insert({
              data: data,
              format: format,
              user_id: user.id,
            })

            if (!error) {
              toast({
                title: "Erfolg",
                description: "Barcode generiert und gespeichert!",
              })
            } else {
              toast({
                title: "Erfolg",
                description: "Barcode generiert! (Speichern fehlgeschlagen)",
              })
            }
          } catch (saveError) {
            toast({
              title: "Erfolg",
              description: "Barcode generiert! (Speichern fehlgeschlagen)",
            })
          }
        } else {
          toast({
            title: "Erfolg",
            description: "Barcode erfolgreich generiert!",
          })
        }

        setData("")
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Barcode-Generierung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingabe.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadBarcode = () => {
    const canvas = canvasRef.current
    if (!canvas) {
      toast({
        title: "Fehler",
        description: "Kein Barcode zum Herunterladen. Bitte generieren Sie zuerst einen.",
        variant: "destructive",
      })
      return
    }

    try {
      const link = document.createElement("a")
      link.download = `barcode-${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()

      toast({
        title: "Erfolg",
        description: "Barcode erfolgreich heruntergeladen!",
      })
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Download fehlgeschlagen.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Barcode Generieren</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="data" className="text-sm font-medium">
                Barcode-Daten
              </Label>
              <Input
                id="data"
                placeholder="Text oder Zahlen eingeben"
                value={data}
                onChange={(e) => setData(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generateBarcode()}
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="format" className="text-sm font-medium">
                Barcode-Format
              </Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CODE128">CODE128</SelectItem>
                  <SelectItem value="CODE39">CODE39</SelectItem>
                  <SelectItem value="EAN13">EAN13</SelectItem>
                  <SelectItem value="EAN8">EAN8</SelectItem>
                  <SelectItem value="UPC">UPC</SelectItem>
                  <SelectItem value="ITF14">ITF14</SelectItem>
                  <SelectItem value="MSI">MSI</SelectItem>
                  <SelectItem value="pharmacode">Pharmacode</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={generateBarcode}
            disabled={isGenerating || !data.trim()}
            className="w-full h-12 text-base font-medium"
          >
            {isGenerating ? "Generiere..." : "Barcode Generieren"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Generierter Barcode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <div className="border border-border rounded-lg p-3 bg-white min-h-[120px] w-full flex items-center justify-center">
              <canvas ref={canvasRef} className="max-w-full h-auto" />
            </div>

            <Button onClick={downloadBarcode} variant="outline" className="w-full h-12 text-base bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Herunterladen
            </Button>

            {!user && (
              <p className="text-sm text-muted-foreground text-center px-2">
                <Button variant="link" className="p-0 h-auto text-sm" onClick={() => router.push("/auth/login")}>
                  Anmelden
                </Button>{" "}
                um Ihre Barcodes zu speichern
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
