"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { createOrder } from "@/lib/api"

export default function CartPage() {
  const router = useRouter()
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paytrToken, setPaytrToken] = useState<string | null>(null)

  // Ara toplamı hesapla
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  // Kargo ücreti kaldırıldı, toplam sadece ara toplam olacak
  const total = subtotal

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      updateQuantity(id, newQuantity)
    }
  }

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Giriş yapmanız gerekiyor",
        description: "Ödeme işlemine devam etmek için lütfen giriş yapın.",
        variant: "destructive",
      })
      router.push("/login?redirect=cart")
      return
    }

    if (cartItems.length === 0) {
      toast({
        title: "Sepetiniz boş",
        description: "Ödeme işlemine devam etmek için sepetinize ürün ekleyin.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)

      // İlk ürün için sipariş oluştur (gerçek uygulamada tüm ürünler için döngü yapılabilir)
      // Not: Bu kısım, createOrder API'nizin birden fazla ürünü nasıl işlediğine bağlı olarak güncellenmelidir.
      // Şu an sadece ilk ürünü gönderiyor.
      const firstItem = cartItems[0]
      const orderResponse = await createOrder({
        productId: firstItem.id,
        quantity: firstItem.quantity,
      })

      if (orderResponse.paytr && orderResponse.paytr.token) {
        setPaytrToken(orderResponse.paytr.token)
        // Ödeme token'ı alındıktan sonra sepeti temizle (isteğe bağlı, ödeme başarılı olduktan sonra da yapılabilir)
        clearCart();
      } else {
        throw new Error("Ödeme token'ı alınamadı")
      }
    } catch (error) {
      console.error("Ödeme işlemi sırasında hata:", error)
      toast({
        title: "Ödeme işlemi başarısız",
        description: "Ödeme sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Alışveriş Sepeti</h1>

      {paytrToken ? (
        <div className="max-w-3xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">Ödeme işlemi başlatıldı. Lütfen aşağıdaki ödeme formunu doldurun.</p>
          </div>

          <div className="bg-white border rounded-lg overflow-hidden shadow-md">
            {/* PayTR iframe'i */}
            <iframe
              src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`}
              className="w-full h-[600px]"
              frameBorder="0"
            ></iframe>
          </div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-gray-100 rounded-full">
            <ShoppingCart className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Sepetiniz boş</h2>
          <p className="text-gray-600 mb-6">Sepetinizde henüz ürün bulunmuyor.</p>
          <Button asChild className="bg-pink-600 hover:bg-pink-700">
            <Link href="/products">Alışverişe Başla</Link>
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Sepetinizdeki Ürünler</h2>

                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-4">
                      <div className="relative w-full sm:w-24 h-24 rounded-md overflow-hidden">
                        <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-gray-500 text-sm mb-2">
                          Birim Fiyat: {item.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="mx-2 w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={item.quantity >= 10}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-medium">
                              {(item.price * item.quantity).toLocaleString("tr-TR", {
                                style: "currency",
                                currency: "TRY",
                              })}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Ürünü Kaldır</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Sipariş Özeti</h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam</span> {/* Ara Toplam yerine Toplam yazıldı */}
                    <span>{total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span>
                  </div>
                  {/* Kargo satırı kaldırıldı */}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Genel Toplam</span> {/* Toplam yerine Genel Toplam yazıldı */}
                    <span className="text-pink-600">
                      {total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 bg-pink-600 hover:bg-pink-700"
                  onClick={handleCheckout}
                  disabled={isProcessing || cartItems.length === 0}
                >
                  {isProcessing ? "İşleniyor..." : "Ödemeye Geç"}
                </Button>

                <Button variant="outline" className="w-full mt-2" onClick={() => router.push("/products")}>
                  Alışverişe Devam Et
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
