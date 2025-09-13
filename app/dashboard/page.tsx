import { Navigation } from "@/components/navigation"
import { BarcodeHistory } from "@/components/barcode-history"

export default function Dashboard() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">Barcode Dashboard</h1>
              <p className="text-muted-foreground text-lg">Manage your saved barcodes</p>
            </div>
            <BarcodeHistory />
          </div>
        </div>
      </main>
    </>
  )
}
