// CartContext'in CartItem arayüzünün productVariantId içerdiğini varsayıyoruz
/*
interface CartItem {
  id: number; // Bu aslında productVariantId olacak
  productId: number;
  productVariantId: number; // Açıkça belirtmek daha iyi olabilir
  title: string;
  variantName: string; // "Mavi / XL" gibi
  price: number; // Ürün veya varyant fiyatı
  image: string;
  quantity: number;
  selectedOptions?: Array<{ label: string; value: string }>; // Seçili opsiyonlar (gösterim için)
}
*/

// sepet sayfası
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Minus, Plus, ShoppingCart, Trash2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/cart-context" // Güncellenmiş CartContext'i kullan
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createOrder } from "@/lib/api"

// PayTR iframe scriptini eklemek için helper fonksiyon
// PayTR'ın dokümantasyonuna göre iframe'in nasıl yükleneceğini kontrol edin
// Bu basit bir örnektir. Genellikle PayTR bir JS scripti sağlar.
const loadPaytrIframe = (token: string) => {
    if (typeof window !== 'undefined') {
        // Mevcut iframe'i kaldır
        const existingIframe = document.getElementById('paytriframe');
        if (existingIframe) {
            existingIframe.remove();
        }

        // Yeni iframe elementini oluştur
        const iframe = document.createElement('iframe');
        iframe.id = 'paytriframe';
        iframe.src = `https://www.paytr.com/odeme/guvenli/${token}`;
        iframe.frameBorder = '0';
        iframe.scrolling = 'yes';
        iframe.style.width = '100%';
        iframe.style.height = '600px'; // Yüksekliği ayarlayın

        // Iframe'i ekleyeceğiniz div'i bulun
        const iframeContainer = document.getElementById('paytr-iframe-container');
        if (iframeContainer) {
            iframeContainer.appendChild(iframe);
        } else {
             console.error("PayTR iframe container not found!");
             // Belki iframe'i direkt body'ye veya başka bir yere ekleyebilirsiniz
             // document.body.appendChild(iframe);
        }
         console.log(`PayTR iframe created with token: ${token}`);

         // Callback (isteğe bağlı - PayTR'ın sunucu callback'i daha güvenlidir)
         // PayTR ödeme penceresi kapatıldığında veya başarılı/başarısız olduğunda
         // PayTR size bir callback gönderir. Bu callback genellikle sunucu tarafında işlenir.
         // Frontend'de sadece bilgilendirme amaçlı event dinleyebilirsiniz.
         // window.addEventListener('message', (event) => {
         //    if (event.origin !== 'https://www.paytr.com') return;
         //    const data = event.data;
         //    if (data === 'paytr.close') {
         //       console.log('PayTR iframe closed');
         //       // Kullanıcı iframe'i kapattı, sipariş durumunu kontrol etmek gerekebilir.
         //       // Genellikle bu durumda backend'deki callback beklenir.
         //       // Modal vs. göstermek isteyebilirsiniz.
         //       setIsModalOpen(false); // Modalı kapat
         //    }
         //    // Diğer PayTR mesajlarını dinleyebilirsiniz
         // });
    }
};


export default function CartPage() {
    const router = useRouter()
    // CartContext'ten gelen id artık variantId'ye karşılık geliyor
    const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart()
    const { isAuthenticated, user } = useAuth()
    const { toast } = useToast()
    const [isProcessing, setIsProcessing] = useState(false)
    const [paytrToken, setPaytrToken] = useState<string | null>(null)
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [address, setAddress] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("");
    const [notes, setNotes] = useState(""); // Notlar alanı için state

    // Ödeme sonucu modalı için state'ler
    const [paymentStatus, setPaymentStatus] = useState<'success' | 'fail' | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalRedirecting, setModalRedirecting] = useState(false); // Yönlendirme sırasında butonu disabled yapmak için

    // Toplam hesaplama artık CartItem'daki variant fiyatını kullanacak
    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    const total = subtotal; // Kargo vs. eklenirse burası güncellenir

    // PayTR token geldiğinde iframe'i yükle
    useEffect(() => {
        if (paytrToken) {
            loadPaytrIframe(paytrToken);
        } else {
             // Token kaldırıldığında (örn: 'Sepete Geri Dön' butonuna basıldığında) iframe'i temizle
            const existingIframe = document.getElementById('paytriframe');
            if (existingIframe) {
                existingIframe.remove();
            }
        }
    }, [paytrToken]);

    // Modal açıldığında body scroll'unu kapat
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        // Component temizlendiğinde scroll'u geri aç
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);


    // Kullanıcı bilgileri yüklendiğinde isim, soyisim, e-posta alanlarını doldur
    useEffect(() => {
        if (user) {
            // Kullanıcının adı tam isim formatında ise ayır
            if (user.name) {
                 const nameParts = user.name.split(' ');
                 setFirstName(nameParts[0] || '');
                 setLastName(nameParts.slice(1).join(' ') || '');
            }
            if (user.email) {
                setEmail(user.email);
            }
             // Eğer kullanıcıda adres ve telefon bilgileri varsa onları da doldurabilirsiniz
             // if (user.address) setAddress(user.address);
             // if (user.phone) setPhone(user.phone);
        }
    }, [user]);

    // Miktar değişimini yönetir - CartItem'daki stok bilgisi yok, genel sınır (10) kullanılıyor.
    // Daha gelişmiş bir sistemde, sepet sayfasında da güncel stok kontrolü yapmak gerekebilir.
    // Şimdilik sadece miktarı 1-10 aralığında tutuyoruz.
    const handleQuantityChange = (variantId: number, newQuantity: number) => {
        // Basitçe minimum 1, maksimum 10 ile sınırla.
        // Güncel stok kontrolü checkout öncesi backend'de yapılacak.
        if (newQuantity >= 1 && newQuantity <= 10) { // Maksimum miktar sınırı
            updateQuantity(variantId, newQuantity)
        } else if (newQuantity < 1) {
            // Miktar 1'in altına inerse ürünü sepetten kaldır
            handleRemoveItem(variantId);
        }
    }

    const handleRemoveItem = (variantId: number) => {
        removeFromCart(variantId);
        toast({
            title: "Ürün Kaldırıldı",
            description: "Ürün sepetinizden başarıyla kaldırıldı.",
            variant: "default",
        });
    };

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            toast({
                title: "Giriş yapmanız gerekiyor",
                description: "Ödeme işlemine devam etmek için lütfen giriş yapın.",
                variant: "destructive",
            })
            router.push("/login?redirect=/cart")
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

         if (!firstName.trim() || !lastName.trim() || !address.trim() || !phone.trim() || !email.trim()) {
            toast({
                title: "Teslimat Bilgileri Eksik",
                description: "Lütfen isim, soyisim, e-posta, teslimat adresinizi ve telefon numaranızı girin.",
                variant: "destructive",
            });
            return;
        }


        try {
            setIsProcessing(true)
            setPaytrToken(null); // Önceki PayTR iframe'ini temizle (eğer varsa)

            // API'ye gönderilecek sepet formatını hazırla: [{ productVariantId, quantity }]
            const itemsToOrder = cartItems.map(item => ({
                productVariantId: item.id, // CartItem'ın id'si artık variantId
                quantity: item.quantity,
            }));

            const orderResponse = await createOrder({
                cartItems: itemsToOrder,
                firstName, lastName, address, phone, email, orderNote: notes
            });

            // PayTR token'ı başarılıysa state'e kaydet, useEffect bunu algılayıp iframe'i yükleyecek
            if (orderResponse.paytr && orderResponse.paytr.token) {
                setPaytrToken(orderResponse.paytr.token);
                // Ödeme ekranına geçildiğinde, sipariş özeti/teslimat bilgilerini gösteren kısmı gizleyebiliriz.
            } else {
                // createOrder'da PayTR token alınamazsa backend zaten hata dönecek
                // veya token yoksa bu durum bir hata olarak ele alınmalı
                const errorMessage = orderResponse.message || "Ödeme token'ı alınamadı.";
                 throw new Error(errorMessage);
            }
        } catch (error: any) {
            console.error("Ödeme işlemi sırasında hata:", error)
            const userErrorMessage = error.response?.data?.message || error.message || "Ödeme sırasında bir hata oluştu. Lütfen tekrar deneyin veya bizimle iletişime geçin.";
            toast({
                title: "Ödeme işlemi başarısız",
                description: userErrorMessage,
                variant: "destructive",
            });
            setPaymentStatus('fail'); // Modalı başarısız olarak ayarla
            setIsModalOpen(true); // Modalı aç
            setPaytrToken(null); // PayTR iframe'ini gizle
        } finally {
            setIsProcessing(false)
        }
    }

    // Modal'dan sonra yönlendirme fonksiyonu
    const handleModalRedirect = () => {
        setModalRedirecting(true); // Yönlendirme başladığında butonu disabled yap
        handleCloseModal(); // Modalı kapat
        router.push("/my-orders"); // Siparişlerim sayfasına yönlendir
    };

     // Modal'ı kapatma fonksiyonu
    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Modal kapandığında PayTR iframe'i temizlenecek (useEffect içinde paytrToken null olduğunda)
        // Eğer ödeme başarılıysa (status 'success'), sepeti temizle ve yönlendir.
        // Eğer başarısızsa, sadece modalı kapat. Tekrar dene butonu handleCheckout'u tekrar çağıracak.
        if (paymentStatus === 'success') {
            clearCart(); // Başarılı ödeme sonrası sepeti temizle
            // Yönlendirme burada yapılmayacak, handleModalRedirect tarafından yapılacak.
        }
        setPaymentStatus(null); // Modal durumu resetle
    };


    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Alışveriş Sepeti</h1>

            {/* PayTR Iframe Alanı */}
            {paytrToken ? (
                 // PayTR iframe'i gösteriliyorsa
                <div className="max-w-3xl mx-auto">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-green-800">Ödeme işlemi başlatıldı. Lütfen aşağıdaki formu kullanarak ödemeyi tamamlayın.</p>
                    </div>

                    <div id="paytr-iframe-container" className="bg-white border rounded-lg overflow-hidden shadow-md">
                         {/* Iframe buraya JavaScript ile yüklenecek */}
                    </div>
                    <div className="text-center mt-6">
                        <Button variant="outline" onClick={() => setPaytrToken(null)} disabled={isProcessing}>
                             Sepete Geri Dön / İptal
                        </Button>
                    </div>
                </div>
            ) : (
                 // PayTR iframe gösterilmiyorsa (sepeti veya ödeme sonucu modalını göster)
                <>
                    {cartItems.length === 0 && !isModalOpen ? (
                        // Sepet boş ve modal açık değilse
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
                        // Sepette ürün varsa (modal açık değilken)
                        !isModalOpen && (
                             <div className="grid md:grid-cols-3 gap-8">
                                <div className="md:col-span-2">
                                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                        <div className="p-6">
                                            <h2 className="text-xl font-semibold mb-4">Sepetinizdeki Ürünler</h2>

                                            <div className="space-y-6">
                                                {cartItems.map((item) => (
                                                    // item.id artık productVariantId
                                                    <div key={item.id} className="flex flex-col sm:flex-row gap-4 items-center">
                                                        <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                                                            <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                                                        </div>

                                                        <div className="flex-1 flex flex-col justify-center">
                                                            <h3 className="font-medium">{item.title}</h3>
                                                            {/* Seçenekleri göster */}
                                                            {item.selectedOptions && item.selectedOptions.length > 0 && (
                                                                <div className="text-xs text-gray-500 mb-1">
                                                                    {item.selectedOptions.map((option, idx) => (
                                                                        <span key={idx} className="mr-2">
                                                                            {option.label}: {option.value}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
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
                                                                        disabled={item.quantity <= 1 || isProcessing}
                                                                    >
                                                                        <Minus className="h-3 w-3" />
                                                                    </Button>
                                                                    <span className="mx-2 w-8 text-center">{item.quantity}</span>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                                        disabled={item.quantity >= 10 || isProcessing} // Maksimum miktar sınırı
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
                                                                        onClick={() => handleRemoveItem(item.id)} // variantId'ye göre kaldır
                                                                        disabled={isProcessing}
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
                                    <div className="bg-white rounded-xl shadow-md overflow-hidden mt-8 p-6">
                                        <h2 className="text-xl font-semibold mb-4">Teslimat Bilgileri</h2>
                                        <div className="grid gap-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="firstName">Adınız *</Label>
                                                    <Input
                                                        id="firstName"
                                                        placeholder="Adınızı girin"
                                                        value={firstName}
                                                        onChange={(e) => setFirstName(e.target.value)}
                                                        required
                                                        disabled={isProcessing} // İşlem sırasındayken disabled yap
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="lastName">Soyadınız *</Label>
                                                    <Input
                                                        id="lastName"
                                                        placeholder="Soyadınızı girin"
                                                        value={lastName}
                                                        onChange={(e) => setLastName(e.target.value)}
                                                        required
                                                        disabled={isProcessing}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="email">E-posta Adresi *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="E-posta adresinizi girin"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    disabled={(!!user?.email && isAuthenticated) || isProcessing} // Giriş yapmışsa ve işlem sırasında disabled
                                                />
                                                {user?.email && isAuthenticated && (
                                                    <p className="text-sm text-gray-500">Giriş yaptığınız e-posta adresi otomatik olarak kullanılıyor.</p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="address">Adres *</Label>
                                                <Textarea
                                                    id="address"
                                                    placeholder="Teslimat adresinizi girin"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    required
                                                    disabled={isProcessing}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="phone">Telefon Numarası *</Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="Telefon numaranızı girin"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    required
                                                    disabled={isProcessing}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="notes">Sipariş Notları (İsteğe Bağlı)</Label>
                                                <Textarea
                                                    id="notes"
                                                    placeholder="Siparişinizle ilgili özel notlarınızı buraya yazabilirsiniz (örn: teslimat talimatları, hediye notu)."
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    rows={3}
                                                    disabled={isProcessing}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Sipariş Özeti */}
                                <div className="md:col-span-1">
                                    <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-8"> {/* sticky ile kaydırırken sabit kalmasını sağlayabilirsiniz */}
                                        <div className="p-6">
                                            <h2 className="text-xl font-semibold mb-4">Sipariş Özeti</h2>

                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Toplam</span>
                                                    <span>{subtotal.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span>
                                                </div>
                                                {/* Kargo, indirim vb. eklenebilir */}
                                                <Separator />
                                                <div className="flex justify-between font-semibold text-lg">
                                                    <span>Genel Toplam</span>
                                                    <span className="text-pink-600">
                                                        {total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Ödemeye Geç Butonu */}
                                            <Button
                                                className="w-full mt-6 bg-pink-600 hover:bg-pink-700"
                                                onClick={handleCheckout}
                                                // Gerekli tüm alanlar dolu olmalı ve sepet boş olmamalı
                                                disabled={
                                                    isProcessing ||
                                                    cartItems.length === 0 ||
                                                    !firstName.trim() ||
                                                    !lastName.trim() ||
                                                    !address.trim() ||
                                                    !phone.trim() ||
                                                    !email.trim()
                                                }
                                            >
                                                {isProcessing ? "İşleniyor..." : "Ödemeye Geç"}
                                            </Button>

                                            {/* Alışverişe Devam Et Butonu */}
                                            <Button variant="outline" className="w-full mt-2" onClick={() => router.push("/products")} disabled={isProcessing}>
                                                Alışverişe Devam Et
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    )}

                    {/* Ödeme Sonucu Modalı */}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                            <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full mx-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold">
                                        {paymentStatus === 'success' ? 'Ödeme Başarılı!' : 'Ödeme Başarısız!'}
                                    </h3>
                                    {/* Başarılı ise kapatma butonu yönlendirmeye gideceği için modalı sadece kendisi kapatmasın */}
                                    {paymentStatus !== 'success' && (
                                         <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                                            <XCircle className="h-5 w-5 text-gray-500" />
                                        </Button>
                                    )}
                                </div>
                                <div className="text-center py-4">
                                    {paymentStatus === 'success' ? (
                                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                    ) : (
                                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                                    )}
                                    <p className="text-gray-600">
                                        {paymentStatus === 'success'
                                            ? 'Siparişiniz başarıyla alındı. Teşekkür ederiz!'
                                            : 'Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin veya bizimle iletişime geçin.'
                                        }
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 mt-4">
                                    {/* Sadece başarılı durumda Siparişlerim butonu */}
                                    {paymentStatus === 'success' ? (
                                        <Button onClick={handleModalRedirect} disabled={modalRedirecting}>
                                            {modalRedirecting ? 'Yönlendiriliyor...' : 'Siparişlerimi Görüntüle'}
                                        </Button>
                                    ) : ( // Başarısız durumda tekrar dene veya kapat
                                         <>
                                            <Button onClick={handleCloseModal} variant="outline" disabled={isProcessing}>Kapat</Button> {/* Sadece modalı kapat */}
                                            <Button onClick={() => { handleCloseModal(); handleCheckout(); }} disabled={isProcessing}>Tekrar Dene</Button> {/* Modalı kapatıp checkout'u tekrar başlat */}
                                         </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}