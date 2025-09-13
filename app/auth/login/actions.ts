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

    // Check if profile with PIN 0000 exists
    const { data: existingProfile, error: selectError } = await supabase
      .from("profiles")
      .select("*")
      .eq("pin_hash", "0000")
      .single()

    console.log("[v0] Profile check result:", { existingProfile, selectError })

    let profileId: string

    if (selectError && selectError.code === "PGRST116") {
      // Profile doesn't exist, create it
      console.log("[v0] No profile found, creating new one for Zaki")

      const { data: insertData, error: insertError } = await supabase
        .from("profiles")
        .insert([
          {
            pin_hash: "0000",
            user_name: "Zaki", // Added user name field
          },
        ])
        .select()
        .single()

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

      profileId = insertData.id
      console.log("[v0] Profile created successfully for Zaki")
    } else if (selectError) {
      console.log("[v0] Error checking profile:", selectError)
      return { success: false, error: "Datenbankfehler beim Überprüfen des Profils" }
    } else {
      profileId = existingProfile.id
      console.log("[v0] Profile already exists for Zaki")
    }

    // Set authentication cookie with user info
    const cookieStore = await cookies()
    cookieStore.set("authenticated", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    cookieStore.set("user_name", "Zaki", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log("[v0] Authentication cookies set for Zaki")

    redirect("/")
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
