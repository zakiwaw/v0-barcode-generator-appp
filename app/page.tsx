import { Navigation } from "@/components/navigation"
import { BarcodeGenerator } from "@/components/barcode-generator"

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 py-4 max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Barcode Generator</h1>
            <p className="text-muted-foreground text-sm">Erstellen und verwalten Sie Ihre Barcodes</p>
          </div>
          <BarcodeGenerator />
        </div>
      </main>
    </>
  )
}
