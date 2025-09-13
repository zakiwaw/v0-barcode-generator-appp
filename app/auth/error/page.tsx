import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Suspense } from "react"

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Entschuldigung, etwas ist schief gelaufen.</CardTitle>
            </CardHeader>
            <CardContent>
              {params?.error ? (
                <p className="text-sm text-muted-foreground">Fehlercode: {params.error}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Ein unbekannter Fehler ist aufgetreten.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Laden...</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      }
    >
      <ErrorContent searchParams={searchParams} />
    </Suspense>
  )
}
