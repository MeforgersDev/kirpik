"use client"

import { useState } from "react"
import Image from "next/image"
import { Maximize2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Kirpik tasarımları için örnek veri
const designData = [
  {
    id: 1,
    title: "Doğal görünüm",
    description: "",
    image: "/dogalgorunum.png",
  },
  {
    id: 2,
    title: "Kirpik Laminasyonu",
    description: "",
    image: "/kirpiklaminasyon.png",
  },
  {
    id: 3,
    title: "Mega Volüm",
    description: "",
    image: "/megavolum.png",
  },
]

export default function DesignGallery() {
  const [selectedDesign, setSelectedDesign] = useState<(typeof designData)[0] | null>(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {designData.map((design) => (
        <div key={design.id} className="bg-white rounded-xl overflow-hidden shadow-md group">
          <div className="relative h-64 overflow-hidden">
            <Image
              src={design.image || "/placeholder.svg"}
              alt={design.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
              <div className="p-4 w-full">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full bg-white/80 hover:bg-white"
                      onClick={() => setSelectedDesign(design)}
                    >
                      <Maximize2 className="h-4 w-4 mr-2" />
                      Detaylı Görüntüle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{selectedDesign?.title}</DialogTitle>
                      <DialogDescription>{selectedDesign?.description}</DialogDescription>
                    </DialogHeader>
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                      {selectedDesign && (
                        <Image
                          src={selectedDesign.image || "/placeholder.svg"}
                          alt={selectedDesign.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg">{design.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{design.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
