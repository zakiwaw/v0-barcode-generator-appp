"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginWithPin(pin: string) {
  try {
    console.log("[v0] Login attempt with PIN:", pin)

    if (pin !== "0000") {
      console.log("[v0] Invalid PIN provided")
      return { success: false, error: "Ungültige PIN" }
    }

    const supabase = await createClient()
    console.log("[v0] Supabase client created")

    // Check if any profile exists
    const { data: existingProfiles, error: selectError } = await supabase.from("profiles").select("id").limit(1)

    console.log("[v0] Profile check result:", { existingProfiles, selectError })

    if (selectError) {
      console.log("[v0] Error checking profiles:", selectError)
      return { success: false, error: "Datenbankfehler beim Überprüfen des Profils" }
    }

    if (!existingProfiles || existingProfiles.length === 0) {
      console.log("[v0] No profile found, creating new one")

      // Create a profile entry with detailed error logging
      const { data: insertData, error: insertError } = await supabase
        .from("profiles")
        .insert([{ pin_hash: "0000" }])
        .select()

      console.log("[v0] Profile creation result:", { insertData, insertError })

      if (insertError) {
        console.log("[v0] Detailed insert error:", {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code,
        })
        return { success: false, error: `Datenbankfehler: ${insertError.message}` }
      }

      console.log("[v0] Profile created successfully")
    } else {
      console.log("[v0] Profile already exists")
    }

    // Set authentication cookie
    const cookieStore = await cookies()
    cookieStore.set("authenticated", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log("[v0] Authentication cookie set")
    return { success: true }
  } catch (error) {
    console.log("[v0] Unexpected error in login:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("authenticated")
  redirect("/auth/login")
}
