// admin/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Edit, Plus, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"

// API fonksiyonlarının importları
import {
    fetchProductsAdmin,
    fetchCategories,
    fetchSliders,
    deleteProduct,
    deleteCategory,
    deleteSlider,
    fetchAllOrders,
    // API tarafından sağlanan güncel arayüzler
    type Product,
    type Category,
    type Slider,
    type Order,
    type ProductVariant, // Varyant detayları için
    type ProductVariantConfiguration // Varyant konfigürasyon detayları için
} from "@/lib/api" // api.ts dosyanızdaki export'lara göre types olarak import ettik


// API'nin temel URL'si - Ortam değişkeninden alınması önerilir.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://kirpikapi.esmedddemo.com/api"; // /api eklemeyi unutmayın


export default function AdminPage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading } = useAuth()
    const { toast } = useToast()

    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [sliders, setSliders] = useState<Slider[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [dataLoading, setDataLoading] = useState(true)

    const isAdmin = isAuthenticated && user?.role === "ADMIN"

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated || !isAdmin) {
            const redirectPath = isAuthenticated ? "/" : "/login";
            router.push(redirectPath);
            if (!isAdmin) {
                 toast({
                    title: "Yetkisiz Erişim",
                    description: "Bu sayfaya erişim yetkiniz bulunmamaktadır.",
                    variant: "destructive",
                });
            }
            return;
        }

        const loadData = async () => {
            try {
                setDataLoading(true);
                // fetchProductsAdmin artık varyantları include ediyor olmalı
                const [productsData, categoriesData, slidersData, ordersData] = await Promise.all([
                    fetchProductsAdmin(),
                    fetchCategories(),
                    fetchSliders(),
                    fetchAllOrders(), // fetchAllOrders varyantları include ediyor olmalı
                ]);

                setProducts(productsData);
                setCategories(categoriesData);
                setSliders(slidersData);
                setOrders(ordersData);
            } catch (error) {
                console.error("Veri yüklenirken hata:", error);
                toast({
                    title: "Veri Yükleme Hatası",
                    description: "Admin paneli verileri yüklenirken bir hata oluştu.",
                    variant: "destructive",
                });
            } finally {
                setDataLoading(false);
            }
        };

        loadData();
    }, [isAuthenticated, isAdmin, isLoading, router, toast]);


    const handleDeleteProduct = async (id: number) => {
        if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
            try {
                await deleteProduct(id);
                setProducts(products.filter((product) => product.id !== id));
                toast({ title: "Başarılı", description: "Ürün başarıyla silindi." });
            } catch (error: any) {
                 console.error("Ürün silinirken hata:", error);
                 const errorMsg = error.response?.data?.message || error.message || "Ürün silinirken bir hata oluştu.";
                 toast({ title: "Hata", description: errorMsg, variant: "destructive" });
            }
        }
    }

    const handleDeleteCategory = async (id: number) => {
        if (confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) {
            try {
                await deleteCategory(id);
                setCategories(categories.filter((category) => category.id !== id));
                toast({ title: "Başarılı", description: "Kategori başarıyla silindi." });
            } catch (error: any) {
                console.error("Kategori silinirken hata:", error);
                const errorMsg = error.response?.data?.message || error.message || "Kategori silinirken bir hata oluştu.";
                 // Eğer kategori ilişkili ürünlere sahipse backend 400 döndürür.
                 if (error.response?.status === 400 && errorMsg.includes("foreign key constraint")) {
                      toast({ title: "Hata", description: "Bu kategoriye bağlı ürünler var. Lütfen önce o ürünleri başka bir kategoriye taşıyın veya silin.", variant: "destructive" });
                 } else {
                     toast({ title: "Hata", description: errorMsg, variant: "destructive" });
                 }
            }
        }
    }

    const handleDeleteSlider = async (id: number) => {
        if (confirm("Bu slider'ı silmek istediğinize emin misiniz?")) {
            try {
                await deleteSlider(id);
                setSliders(sliders.filter((slider) => slider.id !== id));
                toast({ title: "Başarılı", description: "Slider başarıyla silindi." });
            } catch (error: any) {
                 console.error("Slider silinirken hata:", error);
                 const errorMsg = error.response?.data?.message || error.message || "Slider silinirken bir hata oluştu.";
                 toast({ title: "Hata", description: errorMsg, variant: "destructive" });
            }
        }
    }

     // Yüklenirken veya yetkisiz durumda null döndürmek yerine yükleme göstergesi veya mesajı göstermek daha iyi olabilir
    if (isLoading || !isAuthenticated || !isAdmin) {
         return (
             <div className="container mx-auto px-4 py-8 text-center">
                 {isLoading ? "Yükleniyor..." : "Yetki kontrol ediliyor veya yetkisiz erişim..."}
             </div>
         );
     }


    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Paneli</h1>

            <Tabs defaultValue="products" className="w-full">
                {/* TabsList fixed width removed for better responsiveness */}
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4">
                    <TabsTrigger value="products">Ürünler</TabsTrigger>
                    <TabsTrigger value="categories">Kategoriler</TabsTrigger>
                    <TabsTrigger value="sliders">Sliderlar</TabsTrigger>
                    <TabsTrigger value="orders">Siparişler</TabsTrigger>
                </TabsList>

                {/* Ürünler Sekmesi İçeriği */}
                <TabsContent value="products" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Ürün Yönetimi</CardTitle>
                                <CardDescription>Ürünleri ekleyin, düzenleyin veya silin.</CardDescription>
                            </div>
                            <Button asChild>
                                <a href="/admin/products/add">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Yeni Ürün
                                </a>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {dataLoading ? (
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
                                    ))}
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-gray-500 dark:text-gray-400">Henüz ürün bulunmuyor.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto"> {/* Added overflow wrapper */}
                                    <Table className="min-w-full"> {/* min-w-full to prevent collapse */}
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[80px]">Görsel</TableHead> {/* Adjusted width */}
                                                <TableHead>ID</TableHead>
                                                <TableHead>Başlık</TableHead>
                                                <TableHead>Açıklama</TableHead>
                                                <TableHead>Fiyat</TableHead> {/* Base price, varyant fiyatı detayda görülebilir */}
                                                <TableHead>Varyantlar & Stok</TableHead> {/* Updated column header */}
                                                <TableHead>Kategori</TableHead>
                                                <TableHead>Yayınlandı</TableHead>
                                                <TableHead>Favori</TableHead>
                                                <TableHead>Oluşturulma Tarihi</TableHead>
                                                <TableHead className="text-right">İşlemler</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {products.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell>
                                                        <div className="relative w-16 h-16 rounded-md overflow-hidden"> {/* Adjusted size */}
                                                            <img
                                                                src={`${API_URL}${product.images && product.images.length > 0 ? product.images[0].url : "/placeholder.svg"}`}
                                                                alt={product.title}
                                                                className="object-cover w-full h-full"
                                                                onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{product.id}</TableCell>
                                                    <TableCell className="font-medium">{product.title}</TableCell>
                                                    <TableCell className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                                                        {product.description || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                                    </TableCell>
                                                    {/* Varyant Stokları - Tüm varyantların toplamını veya listesini gösterebiliriz */}
                                                    <TableCell>
                                                        {product.variants && product.variants.length > 0 ? (
                                                            <div className="flex flex-col gap-1 text-xs">
                                                                {product.variants.map(variant => {
                                                                    // Varyant kombinasyonunu oluştur (örn: Mavi / XL)
                                                                    const variantName = variant.configurations
                                                                        .map(conf => conf.optionValue.value)
                                                                        .join(' / ');
                                                                    return (
                                                                        <span key={variant.id}>
                                                                            {variantName}: <strong>{variant.stock}</strong>
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            // Varyant yoksa, sadece ürünün ana stok bilgisini göster (eğer varsa, ama artık schema'da yok)
                                                            // Veya belirtilmemiş de diyebiliriz.
                                                            <span className="text-gray-500 dark:text-gray-400">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{product.category?.name || 'Belirtilmemiş'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={product.published ? "default" : "secondary"}>
                                                            {product.published ? 'Evet' : 'Hayır'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={product.isFavorite ? "default" : "secondary"}>
                                                            {product.isFavorite ? 'Evet' : 'Hayır'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                                                    <TableCell className="text-right whitespace-nowrap"> {/* İşlemler kolonu için nowrap */}
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="outline" size="icon" asChild>
                                                                <a href={`/admin/products/edit/${product.id}`}>
                                                                    <Edit className="h-4 w-4" />
                                                                    <span className="sr-only">Düzenle</span>
                                                                </a>
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="text-red-500 hover:text-red-700 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                onClick={() => handleDeleteProduct(product.id)}
                                                            >
                                                                <Trash className="h-4 w-4" />
                                                                <span className="sr-only">Sil</span>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Kategoriler Sekmesi İçeriği */}
                <TabsContent value="categories" className="mt-6">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Kategori Yönetimi</CardTitle>
                                <CardDescription>Kategorileri ekleyin veya silin.</CardDescription>
                            </div>
                            <Button asChild>
                                <a href="/admin/categories/add">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Yeni Kategori
                                </a>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {dataLoading ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
                                    ))}
                                </div>
                            ) : categories.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-gray-500 dark:text-gray-400">Henüz kategori bulunmuyor.</p>
                                </div>
                            ) : (
                                 <div className="overflow-x-auto">
                                    <Table className="min-w-full">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ID</TableHead>
                                                <TableHead>Kategori Adı</TableHead>
                                                 <TableHead className="whitespace-nowrap">Oluşturulma Tarihi</TableHead> {/* Added Created At */}
                                                 <TableHead className="whitespace-nowrap">Güncellenme Tarihi</TableHead> {/* Added Updated At */}
                                                <TableHead className="text-right">İşlemler</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {categories.map((category) => (
                                                <TableRow key={category.id}>
                                                    <TableCell>{category.id}</TableCell>
                                                    <TableCell className="font-medium">{category.name}</TableCell>
                                                     <TableCell className="whitespace-nowrap">{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                                                     <TableCell className="whitespace-nowrap">{new Date(category.updatedAt).toLocaleDateString()}</TableCell> {/* CORRECTED TYPO */}
                                                    <TableCell className="text-right whitespace-nowrap">
                                                         {/* Edit butonu eklenebilir */}
                                                         {/* <Button variant="outline" size="icon" asChild className="mr-2">
                                                             <a href={`/admin/categories/edit/${category.id}`}>
                                                                 <Edit className="h-4 w-4" />
                                                                 <span className="sr-only">Düzenle</span>
                                                             </a>
                                                         </Button> */}
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            onClick={() => handleDeleteCategory(category.id)}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                            <span className="sr-only">Sil</span>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Sliderlar Sekmesi İçeriği */}
                <TabsContent value="sliders" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Slider Yönetimi</CardTitle>
                                <CardDescription>Ana sayfa sliderlarını ekleyin veya silin.</CardDescription>
                            </div>
                            <Button asChild>
                                <a href="/admin/sliders/add">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Yeni Slider
                                </a>
                            </Button>
                        </CardHeader>
                        <CardContent>
                             {dataLoading ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
                                    ))}
                                </div>
                            ) : sliders.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-gray-500 dark:text-gray-400">Henüz slider bulunmuyor.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table className="min-w-full">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[100px]">Görsel</TableHead>
                                                <TableHead>ID</TableHead>
                                                <TableHead>Başlık</TableHead>
                                                <TableHead className="whitespace-nowrap">Oluşturulma Tarihi</TableHead>
                                                <TableHead className="whitespace-nowrap">Güncellenme Tarihi</TableHead> {/* Added Updated At */}
                                                <TableHead className="text-right">İşlemler</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sliders.map((slider) => (
                                                <TableRow key={slider.id}>
                                                    <TableCell>
                                                        <div className="relative w-24 h-12 rounded-md overflow-hidden">
                                                            <img
                                                                src={`${API_URL}${slider.imageUrl || "/placeholder.svg"}`}
                                                                alt={slider.title}
                                                                className="object-cover w-full h-full"
                                                                onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{slider.id}</TableCell>
                                                    <TableCell className="font-medium">{slider.title}</TableCell>
                                                    <TableCell className="whitespace-nowrap">{new Date(slider.createdAt).toLocaleDateString()}</TableCell>
                                                    <TableCell className="whitespace-nowrap">{new Date(slider.updatedAt).toLocaleDateString()}</TableCell> {/* CORRECTED TYPO */}
                                                    <TableCell className="text-right whitespace-nowrap">
                                                         {/* Edit butonu eklenebilir */}
                                                          {/* <Button variant="outline" size="icon" asChild className="mr-2">
                                                             <a href={`/admin/sliders/edit/${slider.id}`}>
                                                                 <Edit className="h-4 w-4" />
                                                                 <span className="sr-only">Düzenle</span>
                                                             </a>
                                                         </Button> */}
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            onClick={() => handleDeleteSlider(slider.id)}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                            <span className="sr-only">Sil</span>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Siparişler Sekmesi İçeriği - Güncellendi */}
                <TabsContent value="orders" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sipariş Yönetimi</CardTitle>
                            <CardDescription>Tüm siparişleri görüntüleyin.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dataLoading ? (
                                <div className="space-y-4">
                                    {[...Array(7)].map((_, i) => (
                                        <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
                                    ))}
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-gray-500 dark:text-gray-400">Henüz sipariş bulunmuyor.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto"> {/* Ekran taşmasını önlemek için */}
                                    <Table className="min-w-full"> {/* Tablonun içeriği kadar daralmamasını sağlar */}
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Sipariş ID</TableHead>
                                                <TableHead>Durum</TableHead>
                                                <TableHead>Ödeme Durumu</TableHead>
                                                <TableHead>Toplam Tutar</TableHead>
                                                <TableHead className="whitespace-nowrap">Sipariş Tarihi</TableHead> {/* nowrap eklendi */}
                                                <TableHead>Müşteri</TableHead>
                                                <TableHead>İletişim</TableHead>
                                                <TableHead className="max-w-[200px]">Adres</TableHead> {/* Max width eklendi */}
                                                <TableHead className="max-w-[150px]">Sipariş Notu</TableHead> {/* Max width eklendi */}
                                                <TableHead>Ürünler</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {orders.map((order) => (
                                                <TableRow key={order.id}>
                                                    <TableCell className="font-medium text-sm">{order.id}</TableCell>
                                                     <TableCell>
                                                        <Badge variant={order.orderStatus === "PAID" ? "default" : order.orderStatus === "PAYMENT_FAILED" ? "destructive" : "secondary"}>
                                                            {order.orderStatus || 'Bilinmiyor'}
                                                        </Badge>
                                                    </TableCell>
                                                     <TableCell>
                                                         <Badge variant={order.paymentStatus ? "default" : "secondary"}>
                                                             {order.paymentStatus ? 'Ödendi' : 'Bekliyor'}
                                                         </Badge>
                                                     </TableCell>
                                                    <TableCell className="whitespace-nowrap">{order.amount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</TableCell>
                                                    <TableCell className="whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                                     <TableCell>
                                                         <div className="flex flex-col">
                                                             <span className="font-medium">{order.firstName} {order.lastName}</span>
                                                             <span className="text-xs text-gray-500 dark:text-gray-400">{order.email}</span>
                                                         </div>
                                                     </TableCell>
                                                      <TableCell className="whitespace-nowrap">{order.phone}</TableCell> {/* nowrap eklendi */}
                                                     <TableCell className="max-w-[200px] overflow-hidden text-ellipsis"> {/* whitespace-nowrap kaldırıldı */}
                                                         {order.address}
                                                     </TableCell>
                                                     <TableCell className="max-w-[150px] overflow-hidden text-ellipsis"> {/* whitespace-nowrap kaldırıldı */}
                                                        {order.orderNote || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col space-y-2">
                                                            {order.orderItems.map(item => (
                                                                <div key={item.id} className="border-b last:border-b-0 pb-2 last:pb-0">
                                                                    <div className="text-sm font-medium">
                                                                        {item.quantity}x {item.product?.title || 'Ürün Bilinmiyor'}
                                                                    </div>
                                                                    {/* Sipariş anındaki variant seçeneklerini göster */}
                                                                    {item.orderItemOptions && item.orderItemOptions.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                                            {item.orderItemOptions.map(option => (
                                                                                <span key={option.id} className="text-xs text-gray-600 dark:text-gray-400">
                                                                                    <strong>{option.label}:</strong> {option.value}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 whitespace-nowrap"> {/* Birim fiyatı nowrap yaptık */}
                                                                        Birim Fiyat: {item.priceAtOrder.toFixed(2)} TL
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    )
}