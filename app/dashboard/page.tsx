import { Navigation } from "@/components/navigation"
import { BarcodeHistory } from "@/components/barcode-history"

export default function Dashboard() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 py-3 max-w-md">
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-foreground mb-1">Barcode Dashboard</h1>
            <p className="text-muted-foreground text-sm">Verwalten Sie Ihre gespeicherten Barcodes</p>
          </div>
          <BarcodeHistory />
        </div>
      </main>
    </>
  )
}
