"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Save } from "lucide-react"
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

  const generateBarcode = () => {
    if (!data.trim()) {
      toast({
        title: "Error",
        description: "Please enter data to generate barcode",
        variant: "destructive",
      })
      return
    }

    if (!window.JsBarcode) {
      toast({
        title: "Error",
        description: "Barcode library is still loading. Please try again.",
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
          height: 100,
          displayValue: true,
          fontSize: 14,
          margin: 10,
        })

        toast({
          title: "Success",
          description: "Barcode generated successfully!",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate barcode. Please check your input.",
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
        title: "Error",
        description: "No barcode to download. Please generate one first.",
        variant: "destructive",
      })
      return
    }

    try {
      const link = document.createElement("a")
      link.download = `barcode-${data}-${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()

      toast({
        title: "Success",
        description: "Barcode downloaded successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download barcode.",
        variant: "destructive",
      })
    }
  }

  const saveBarcode = async () => {
    const canvas = canvasRef.current
    if (!canvas || !data.trim()) {
      toast({
        title: "Error",
        description: "No barcode to save. Please generate one first.",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save barcodes.",
      })
      router.push("/auth/login")
      return
    }

    setIsSaving(true)

    try {
      const { error } = await supabase.from("barcodes").insert({
        data: data,
        format: format,
        user_id: user.id,
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Barcode saved successfully!",
      })
    } catch (error) {
      console.error("Save error:", error)
      toast({
        title: "Error",
        description: "Failed to save barcode.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Barcode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Barcode Data</Label>
              <Input
                id="data"
                placeholder="Enter text or numbers"
                value={data}
                onChange={(e) => setData(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generateBarcode()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="format">Barcode Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
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

          <Button onClick={generateBarcode} disabled={isGenerating || !data.trim()} className="w-full md:w-auto">
            {isGenerating ? "Generating..." : "Generate Barcode"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Barcode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <div className="border border-border rounded-lg p-4 bg-white min-h-[140px] flex items-center justify-center">
              <canvas ref={canvasRef} className="max-w-full h-auto" />
            </div>

            <div className="flex gap-2">
              <Button onClick={downloadBarcode} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={saveBarcode} variant="outline" size="sm" disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>

            {!user && (
              <p className="text-sm text-muted-foreground text-center">
                <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/auth/login")}>
                  Sign in
                </Button>{" "}
                to save your barcodes
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
