'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { useCart } from "@/context/cart-context" // Kendi yoluna göre düzenle

export default function PaymentSuccessPage() {
  const router = useRouter()
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart() // Sayfa yüklendiğinde sepeti temizle

    const timer = setTimeout(() => {
      router.push("/profile")
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Ödeme Başarılı</h1>
      <p>Siparişiniz alınmıştır. Siparişlerim sayfasına yönlendiriliyorsunuz...</p>
    </div>
  )
}
