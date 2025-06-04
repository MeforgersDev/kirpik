'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { XCircle } from "lucide-react"

export default function PaymentFailedPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/")
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <XCircle className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Ödeme Başarısız</h1>
      <p>Bir sorun oluştu. Ana sayfaya yönlendiriliyorsunuz...</p>
    </div>
  )
}