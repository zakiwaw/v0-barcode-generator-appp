import { Navigation } from "@/components/navigation"
import { BarcodeHistory } from "@/components/barcode-history"

export default function Dashboard() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 py-4 max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Barcode Dashboard</h1>
            <p className="text-muted-foreground text-sm">Verwalten Sie Ihre gespeicherten Barcodes</p>
          </div>
          <BarcodeHistory />
        </div>
      </main>
    </>
  )
}
