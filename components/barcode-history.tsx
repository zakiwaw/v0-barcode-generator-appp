"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Trash2, Eye, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

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
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (!user) {
        router.push("/auth/login")
        return
      }

      await loadBarcodes(user.id)
    }
    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadBarcodes(session.user.id)
      } else {
        setBarcodes([])
        router.push("/auth/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  const loadBarcodes = async (userId: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("barcodes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setBarcodes(data || [])
    } catch (error) {
      console.error("Load error:", error)
      toast({
        title: "Error",
        description: "Failed to load barcodes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const viewBarcode = (barcode: Barcode) => {
    if (!window.JsBarcode) {
      toast({
        title: "Error",
        description: "Barcode library is still loading. Please try again.",
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
            height: 100,
            displayValue: true,
            fontSize: 14,
            margin: 10,
          })
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to generate barcode preview",
            variant: "destructive",
          })
        }
      }
    }, 100)
  }

  const downloadBarcode = (barcode: Barcode) => {
    if (!window.JsBarcode) {
      toast({
        title: "Error",
        description: "Barcode library is still loading. Please try again.",
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
        title: "Success",
        description: "Barcode downloaded successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download barcode",
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
        title: "Success",
        description: "Barcode deleted successfully!",
      })
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Error",
        description: "Failed to delete barcode",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to view your saved barcodes.</p>
          <Button onClick={() => router.push("/auth/login")}>Sign In</Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading barcodes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Barcode List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Saved Barcodes ({barcodes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {barcodes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No saved barcodes yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Generate and save barcodes to see them here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {barcodes.map((barcode) => (
                <div
                  key={barcode.id}
                  className={`p-4 border border-border rounded-lg transition-colors ${
                    selectedBarcode?.id === barcode.id ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{barcode.format}</Badge>
                      <span className="font-mono text-sm">{barcode.data}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{formatDate(barcode.created_at)}</span>

                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => viewBarcode(barcode)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => downloadBarcode(barcode)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteBarcode(barcode.id)}>
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
      <Card>
        <CardHeader>
          <CardTitle>Barcode Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedBarcode ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-2">
                  <Badge>{selectedBarcode.format}</Badge>
                  <span className="font-mono">{selectedBarcode.data}</span>
                </div>
                <p className="text-xs text-muted-foreground">Created: {formatDate(selectedBarcode.created_at)}</p>
              </div>

              <div className="flex justify-center">
                <div className="border border-border rounded-lg p-4 bg-white">
                  <canvas ref={canvasRef} className="max-w-full h-auto" />
                </div>
              </div>

              <div className="flex justify-center gap-2">
                <Button onClick={() => downloadBarcode(selectedBarcode)} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={() => deleteBarcode(selectedBarcode.id)} variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select a barcode to preview</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
