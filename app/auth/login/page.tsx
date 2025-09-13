"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { loginWithPin } from "./actions"

export default function Page() {
  const [pin, setPin] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await loginWithPin(pin)

      if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.error || "Ein Fehler ist aufgetreten.")
      }
    } catch (error: unknown) {
      console.log("[v0] Login error:", error)
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="w-full max-w-[350px]">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center">Anmelden</CardTitle>
            <CardDescription className="text-center text-sm">Geben Sie Ihre PIN ein</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pin" className="text-sm">
                    PIN
                  </Label>
                  <Input
                    id="pin"
                    type="number"
                    placeholder="0000"
                    required
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.slice(0, 4))}
                    className="text-center text-lg tracking-widest"
                  />
                </div>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                <Button type="submit" className="w-full h-12" disabled={isLoading || pin.length !== 4}>
                  {isLoading ? "Anmelden..." : "Anmelden"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
