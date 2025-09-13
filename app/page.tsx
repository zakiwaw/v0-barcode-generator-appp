import { Navigation } from "@/components/navigation"
import { BarcodeGenerator } from "@/components/barcode-generator"

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">Barcode Generator</h1>
              <p className="text-muted-foreground text-lg">Generate and manage your barcodes with ease</p>
            </div>
            <BarcodeGenerator />
          </div>
        </div>
      </main>
    </>
  )
}
