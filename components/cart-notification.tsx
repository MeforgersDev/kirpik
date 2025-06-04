import Image from "next/image"
import Link from "next/link"
import { Check, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

interface CartNotificationProps {
  product: {
    id: number
    title: string
    price: number
    image: string
    quantity: number
  }
}

export function CartNotification({ product }: CartNotificationProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="bg-green-100 rounded-full p-1">
          <Check className="h-4 w-4 text-green-600" />
        </div>
        <p className="text-sm font-medium">Ürün başarıyla sepete eklendi</p>
      </div>

      <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
        <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
          <Image src={product.image || "/placeholder.svg"} alt={product.title} fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{product.title}</h4>
          <p className="text-xs text-gray-500">
            {product.quantity} adet x {product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
          </p>
        </div>
        <div className="font-medium text-sm">
          {(product.price * product.quantity).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
        </div>
      </div>

      <div className="flex gap-2 mt-1">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href="/products">Alışverişe Devam Et</Link>
        </Button>
        <Button asChild size="sm" className="flex-1 bg-pink-600 hover:bg-pink-700">
          <Link href="/cart" className="flex items-center justify-center">
            Sepete Git
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
