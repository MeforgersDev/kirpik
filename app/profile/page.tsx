"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Package, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { fetchUserOrders, fetchProductById } from "@/lib/api" // fetchProductById'ı import ettiğinizden emin olun

// Ürün detayları için arayüz
interface ProductDetails {
  id: number;
  title: string;
  // DEĞİŞİKLİK: 'image: string;' yerine 'images: Array<{ url: string }>;'
  images: Array<{ url: string }>;
  price: number;
}

// Sipariş içindeki her bir ürün öğesi için arayüz
interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  priceAtOrder: number;
  product?: ProductDetails; // 'product' objesi opsiyonel olabilir, çünkü backend'den gelmeyebilir
  orderItemOptions: Array<{ label: string; value: string }>;
}

// Sipariş ana arayüzü
interface Order {
  id: string;
  userId: number;
  amount: number;
  paymentStatus: boolean;
  createdAt: string;
  address: string;
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  orderItems: OrderItem[];
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const loadOrders = async () => {
      try {
        setLoading(true)
        const ordersData: Order[] = await fetchUserOrders()

        // Her bir siparişi ve içindeki her bir sipariş öğesini işleyin
        const processedOrders = await Promise.all(
          ordersData.map(async (order) => {
            const processedOrderItems = await Promise.all(
              order.orderItems.map(async (item) => {
                let productDetail = item.product; // Mevcut product objesini al

                // Eğer product objesi yoksa veya images dizisi boşsa, ürünü ID'sine göre çekin
                // DEĞİŞİKLİK: product.image kontrolü yerine product.images ve length kontrolü
                if (!productDetail || !productDetail.images || productDetail.images.length === 0) {
                  try {
                    const fetchedProduct = await fetchProductById(item.productId)
                    // DEĞİŞİKLİK: productDetail.imageUrl yerine fetchedProduct.images kullanıldı
                    productDetail = {
                      id: fetchedProduct.id,
                      title: fetchedProduct.title, // Backend'den gelen 'title' veya 'name' alanına göre ayarlayın
                      images: fetchedProduct.images, // Backend'den gelen 'images' dizisini doğrudan kullanın
                      price: fetchedProduct.price,
                    }
                  } catch (productError) {
                    console.error(
                      `Ürün ${item.productId} detayları yüklenirken hata:`,
                      productError
                    )
                    // Hata durumunda veya ürün bulunamazsa yer tutucu görsel kullanın
                    productDetail = {
                      id: item.productId,
                      title: `Ürün #${item.productId}`,
                      images: [{ url: "/placeholder.svg" }], // Yer tutucu görsel yolu
                      price: item.priceAtOrder,
                    }
                  }
                }
                return {
                  ...item,
                  product: productDetail,
                }
              })
            )
            return { ...order, orderItems: processedOrderItems }
          })
        )

        setOrders(processedOrders)
      } catch (error) {
        console.error("Siparişler yüklenirken hata:", error)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!isAuthenticated) {
    return null // Router zaten login sayfasına yönlendirecek
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Hesabım</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="orders">Siparişlerim</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profil Bilgileri</CardTitle>
              <CardDescription>
                Hesap bilgilerinizi görüntüleyin ve yönetin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-pink-100 p-3 rounded-full">
                  <User className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>

              <div className="grid gap-2">
                <h3 className="text-sm font-medium">Ad Soyad</h3>
                <p className="text-sm">{user?.name}</p>
              </div>

              <div className="grid gap-2">
                <h3 className="text-sm font-medium">E-posta</h3>
                <p className="text-sm">{user?.email}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="destructive" onClick={handleLogout}>
                Çıkış Yap
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Siparişlerim</CardTitle>
              <CardDescription>
                Önceki siparişlerinizi görüntüleyin ve takip edin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-24 bg-gray-200 animate-pulse rounded-md"
                    />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-6">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Henüz siparişiniz yok
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Ürünlerimize göz atarak alışverişe başlayabilirsiniz.
                  </p>
                  <Button asChild className="bg-pink-600 hover:bg-pink-700">
                    <a href="/products">Alışverişe Başla</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 mb-6 last:mb-0"
                    >
                      <div className="flex justify-between items-start mb-4 pb-2 border-b">
                        <div>
                          <p className="font-medium text-lg">
                            Sipariş #{order.id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 text-sm rounded-full font-semibold ${
                              order.paymentStatus
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.paymentStatus ? "Ödendi" : "Beklemede"}
                          </span>
                          <p className="font-bold text-xl mt-2">
                            {order.amount.toLocaleString("tr-TR", {
                              style: "currency",
                              currency: "TRY",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Sipariş içindeki her bir ürün öğesini listele */}
                      <div className="space-y-3">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 py-2">
                            {/* Konsol log'u, product objesinin ve image özelliğinin durumunu görmenizi sağlar */}
                            {console.log("Product object:", item.product)}
                            {console.log("Product Images Array:", item.product?.images)}
                            <div className="relative w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                              {/* DEĞİŞİKLİK: item.product.image yerine item.product.images[0]?.url kullanıldı */}
                              {item.product?.images && item.product.images.length > 0 && item.product.images[0].url !== "/placeholder.svg" ? (
                                <img
                                  src={`https://kirpikapi.esmedddemo.com/${item.product.images[0].url}`}
                                  alt={item.product.title || "Ürün"}
                                  className="object-cover w-full h-full"
                                  onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }} // Resim yüklenemezse placeholder
                                />
                              ) : (
                                <img
                                  src="/placeholder.svg"
                                  alt="Ürün"
                                  className="object-cover w-full h-full"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-base">
                                {item.product?.title || `Ürün #${item.productId}`}
                              </p>
                              <p className="text-sm text-gray-500">
                                Miktar: {item.quantity}
                              </p>
                              {item.orderItemOptions &&
                                item.orderItemOptions.length > 0 && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    {item.orderItemOptions.map((option, idx) => (
                                      <span key={idx} className="block">
                                        {option.label}: {option.value}
                                      </span>
                                    ))}
                                  </div>
                                )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-semibold">
                                {(item.priceAtOrder * item.quantity).toLocaleString(
                                  "tr-TR",
                                  { style: "currency", currency: "TRY" }
                                )}
                              </p>
                              <p className="text-sm text-gray-500">
                                (
                                {item.priceAtOrder.toLocaleString("tr-TR", {
                                  style: "currency",
                                  currency: "TRY",
                                })}
                                {" / adet)"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
