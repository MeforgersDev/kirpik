// public ürün görüntüleme alanı
"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
// EyeSlash yerine EyeOff iconu import edildi
import { Heart, Minus, Plus, ShoppingCart, X, EyeOff, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/context/cart-context"
// api.ts'den güncel tipleri al ve fetchProductById fonksiyonunu import et
import { fetchProductById, Product as ProductType, ProductVariant, ProductOptionValueInConfig } from "@/lib/api"

// API'nin temel URL'i (Görsel yolları için)
const API_URL = "https://kirpikapi.esmedddemo.com"; // Kendi API URL'inizi buraya yazın

// Seçenek seçimlerini takip etmek için state yapısı (Opsiyon ID'sine göre değer ve label tutar)
interface SelectedOptionsState {
  [optionId: number]: { label: string; value: string };
}

export default function App() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { addToCart, cartItems } = useCart();

  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState<string>("");
  // selectedOptions state'i artık opsiyonun id'sini key olarak kullanıyor
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptionsState>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null); // Seçilen varyantı tut

  // Modallar için state'ler
  const [showOptionsModal, setShowOptionsModal] = useState(false); // Seçenek eksik modalı
  const [showStockModal, setShowStockModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Yakınlaştırma için state'ler
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomX, setZoomX] = useState(50);
  const [zoomY, setZoomY] = useState(50);

  // Ürün verilerini API'dan çeker
  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);
        // params.id string veya string[] olabilir, number'a çevirmeden önce kontrol et
        const productId = Array.isArray(params.id) ? Number.parseInt(params.id[0]) : Number.parseInt(params.id as string);

        if (isNaN(productId) || productId <= 0) {
          throw new Error("Geçersiz ürün ID'si");
        }

        const data = await fetchProductById(productId);

        // Frontend'de stok 0 olan varyantları filtrelemiyoruz, sadece gösterimde ve seçimde dikkate alıyoruz.
        // data.variants = data.variants.filter(v => v.stock > 0); // Bu satır kaldırıldı/yorumlandı


        setProduct(data);

        // Eğer ürünün hiç seçeneği yoksa, ve en az bir varyantı varsa (ki olmalı), ilk varyantı varsayılan seçili varyant yap
        // Bu, seçeneksiz ürünler için varyantPrice ve stockStatusText'in doğru çalışmasını sağlar.
        if ((data.options?.length ?? 0) === 0 && (data.variants?.length ?? 0) > 0) {
              // Eğer seçenek yoksa, genellikle 1 varyant olur. Birden çoksa ilkini seçebiliriz.
              setSelectedVariant(data.variants[0]);
        } else {
              setSelectedOptions({}); // Seçenek varsa başlangıçta hiçbir şey seçili olmasın
              setSelectedVariant(null); // Başlangıçta varyant seçili değil
        }


        if (data.images && data.images.length > 0) {
          setMainImage(`${API_URL}${data.images[0].url}`);
        } else {
          setMainImage("https://placehold.co/500x500/E0E0E0/333333?text=Görsel+Yok");
        }


      } catch (err) {
        console.error("Ürün yüklenirken hata oluştu:", err);
        setError("Ürün yüklenirken bir hata oluştu veya bulunamadı.");
        setProduct(null); // Ürün bulunamadıysa veya hata oluştuysa null yap
      } finally {
        setLoading(false);
      }
    };

    getProduct();
  }, [params.id]); // params.id değiştiğinde yeniden çek

  // Seçilen seçeneklere göre uygun varyantı bul
  useEffect(() => {
      if (!product || !product.variants) {
          setSelectedVariant(null);
          return;
      }

      const totalOptionsCount = product.options?.length || 0;
      const selectedOptionsCount = Object.keys(selectedOptions).length;

      // Tüm seçenekler seçilmemişse, varyant belirleyemeyiz
      if (selectedOptionsCount !== totalOptionsCount) {
          setSelectedVariant(null);
          setQuantity(1); // Miktarı sıfırla veya 1'e ayarla
          return;
      }

      // Seçilen opsiyon kombinasyonuna uyan varyantı bul
      const foundVariant = product.variants.find(variant => {
          // Varyantın konfigürasyon sayısı, seçilen opsiyon sayısı ile aynı olmalı
          if (variant.configurations.length !== selectedOptionsCount) {
              return false;
          }

          // Her seçilen opsiyonun, varyantın konfigürasyonlarında eşleşen bir değeri olmalı
          // selectedOptions state'i artık {optionId: {label, value}} formatında
          return Object.entries(selectedOptions).every(([selectedOptId, selectedOpt]) => {
              // Bu seçeneğin varyant konfigürasyonlarında karşılığı var mı?
              return variant.configurations.some(variantConfig =>
                  variantConfig.optionValue.option.id === parseInt(selectedOptId) &&
                  variantConfig.optionValue.value === selectedOpt.value
              );
          });
      });

      setSelectedVariant(foundVariant || null);
      // Yeni varyant bulunduğunda miktarı sıfırla veya 1'e ayarla
      setQuantity(1);

  }, [selectedOptions, product]); // selectedOptions veya product değiştiğinde varyantı yeniden hesapla


    // Bir seçeneğin belirli bir değerinin (optionValue) seçilebilir olup olmadığını kontrol eden fonksiyon
    // Seçilebilir olması için:
    // 1. O değeri içeren en az bir varyant olmalı.
    // 2. Kullanıcının o anda seçmiş olduğu *diğer* tüm seçenek değerleriyle de uyumlu konfigürasyonları olmalı.
    // 3. Uyumlu varyantlardan *en az birinin* stoğu > 0 olmalı.
    const isOptionValueSelectable = useMemo(() => (optionId: number, optionValue: string): boolean => {
        if (!product || !product.variants || product.variants.length === 0) return false;

        // Bu 'optionValue' değerini içeren varyantları filtrele
        const variantsIncludingValue = product.variants.filter(variant =>
            variant.configurations.some(config =>
                config.optionValue.option.id === optionId && config.optionValue.value === optionValue
            )
        );

        // Bu varyantlar arasında, kullanıcının *diğer* seçili opsiyonlarıyla uyumlu olan var mı kontrol et VE stokta olan var mı?
        return variantsIncludingValue.some(variant => {
            // Bu varyant, seçili olan tüm diğer opsiyonlarla uyumlu mu?
            const otherOptionsMatch = Object.entries(selectedOptions).every(([selectedOptId, selectedOpt]) => {
                 const currentOptionId = parseInt(selectedOptId);
                // Sadece seçilen diğer opsiyonlara bak
                if (currentOptionId !== optionId) {
                    return variant.configurations.some(config =>
                        config.optionValue.option.id === currentOptionId && config.optionValue.value === selectedOpt.value
                    );
                }
                 return true; // Şu an kontrol ettiğimiz opsiyonu atla
            });

            // Hem diğer seçeneklerle uyumlu olacak hem de stokta olacak
            return otherOptionsMatch && variant.stock > 0;
        });

    }, [product, selectedOptions]); // product veya selectedOptions değiştiğinde recalculate et

    // Seçenek seçildiğinde çağrılır
    const handleOptionSelect = (optionId: number, label: string, value: string) => {
         const isCurrentlySelected = selectedOptions[optionId]?.value === value;
         const isAttemptingToSelectDisabled = !isCurrentlySelected && !isOptionValueSelectable(optionId, value);

         // Eğer seçilemez bir değere tıklanıyorsa işlemi yapma
         if (isAttemptingToSelectDisabled) {
              // Opsiyonel: Kullanıcıya neden seçilemediğini belirten bir toast gösterebilirsiniz
              // toast({ title: "Bilgi", description: "Bu seçenek kombinasyonu stokta yok veya diğer seçimlerinizle uyumlu varyant bulunamadı.", variant: "default" });
              return;
         }

         // Eğer zaten seçiliyse, seçimi kaldır (toggle)
         if (isCurrentlySelected) {
             setSelectedOptions(prev => {
                 const newState = { ...prev };
                 delete newState[optionId]; // Seçimi kaldır
                 return newState;
             });
         } else {
             // Yeni seçimi kaydet
             setSelectedOptions(prev => ({ ...prev, [optionId]: { label, value } }));
         }

         // Not: handleOptionSelect çağrıldığında setSelectedOptions state'i değişir.
         // selectedOptions state'i değiştiğinde ise useEffect içindeki varyant bulma ve
         // isOptionValueSelectable useMemo hook'u otomatik olarak yeniden hesaplanır.
         // Bu, seçime bağlı olarak diğer seçeneklerin seçilebilirliğinin dinamik olarak güncellenmesini sağlar.
    };


  // Miktar değişimini yönetir
  const handleQuantityChange = (value: number) => {
    // Eğer seçili varyant yoksa veya seçili varyantın stoğu 0 ise miktar değiştirilemez
    // Miktar her zaman en az 1 olmalı (eğer stok > 0 ise)
    if (!selectedVariant || selectedVariant.stock <= 0) {
          if (value >= 1) setQuantity(1); // Stok yoksa miktar hep 1 kalsın (veya 0, ama 1 daha mantıklı)
          return;
    }

    const currentVariantStock = selectedVariant.stock;

    if (value < 1) {
      // Miktar 1'in altına düşerse 1 yap
      setQuantity(1);
      return;
    }

    // Eklenecek toplam miktar (sepetteki + yeni eklenen) stoktan fazla olamaz
      const existingItemInCart = cartItems.find(item => item.productVariantId === selectedVariant.id);
      const totalAfterAdd = (existingItemInCart?.quantity ?? 0) + value;


    if (totalAfterAdd > currentVariantStock) {
        const message = existingItemInCart
            ? `Sepetinizde bu varyanttan ${existingItemInCart.quantity} adet var. Toplamda maksimum ${currentVariantStock} adet olabilir.`
            : `Üzgünüz, bu varyant için maksimum ${currentVariantStock} adet ekleyebilirsiniz.`;
        setModalMessage(message);
        setShowStockModal(true);
        // Mevcut stoktan fazlaysa miktarı, sepetteki miktar çıkarıldığında kalan stoğa eşitle
        // Ancak miktar her zaman en az 1 olmalı.
        setQuantity(Math.max(1, currentVariantStock - (existingItemInCart?.quantity ?? 0)));
        return;
    }

    setQuantity(value);
  };

    // Seçili varyantın fiyatını hesapla (selectedVariant veya product.price)
    const variantPrice = useMemo(() => {
        if (selectedVariant) {
            // Varyantın kendi fiyatı varsa onu kullan, yoksa ana ürün fiyatını kullan
            // price alanı null veya undefined olabilir, kontrol edelim
            return selectedVariant.price !== null && selectedVariant.price !== undefined ? selectedVariant.price : product?.price ?? 0;
        }
        // Varyant seçili değilse veya ürün yüklenmemişse ana ürün fiyatını göster (varsayılan olarak)
        return product?.price ?? 0;
    }, [selectedVariant, product?.price]);

   // Genel stok bilgisini hesaplayan useMemo
   // Seçenekli ürünlerde: Eğer varyant seçilmemişse, seçilen opsiyonlara uyan varyantların toplam stoğu.
   // Seçenekli ürünlerde: Eğer varyant seçilmişse, sadece seçili varyantın stoğu.
   // Seçeneksiz ürünlerde: İlk varyantın stoğu.
    const totalAvailableStock = useMemo(() => {
        if (!product || !product.variants) return 0;

        // Seçeneksiz ürünler veya varyant zaten seçilmişse (tüm seçenekler seçilmiş demektir)
        if ((product.options?.length ?? 0) === 0 || selectedVariant) {
            return selectedVariant?.stock ?? 0; // Seçili varyantın stoğu (veya 0)
        }

        // Seçenekli ürünler ve varyant henüz seçilmemişse (bazı seçenekler seçilmiş olabilir)
        // Kullanıcının şu ana kadar seçtiği seçeneklere uyan tüm varyantların stok toplamı
        const selectedOptionEntries = Object.entries(selectedOptions);
        if (selectedOptionEntries.length === 0) {
            // Hiçbir seçenek seçilmediyse, tüm varyantların toplam stoğu
            return product.variants.reduce((sum, variant) => sum + variant.stock, 0);
        } else {
            // Seçenekler seçilmişse, sadece bu seçeneklere uyan varyantların stok toplamı
            const matchingVariants = product.variants.filter(variant => {
                 // Varyantın konfigürasyon sayısı, seçilen opsiyon sayısından büyük veya eşit olmalı (eğer varyantın tamamı eşleşiyorsa)
                // Asıl kontrol, seçilen her opsiyonun bu varyantta karşılığı var mı?
                 return selectedOptionEntries.every(([selectedOptId, selectedOpt]) => {
                     return variant.configurations.some(config =>
                         config.optionValue.option.id === parseInt(selectedOptId) &&
                         config.optionValue.value === selectedOpt.value
                     );
                 });
            });
            return matchingVariants.reduce((sum, variant) => sum + variant.stock, 0);
        }

    }, [product, selectedOptions, selectedVariant]);


  // Sepete ekleme işlemini yönetir
  const handleAddToCart = () => {
    if (!product) return;

    // Tüm seçeneklerin seçili olup olmadığını kontrol et (sadece seçenekli ürünler için)
      if ((product.options?.length ?? 0) > 0 && !selectedVariant) {
        setModalMessage("Lütfen devam etmek için tüm ürün seçeneklerini seçiniz.");
        setShowOptionsModal(true);
        return;
      }

    // Seçenekleri olmayan ürünler için selectedVariant useEffect tarafından ayarlanmış olmalı
    // Eğer ürünün seçenekleri yoksa ve varyantı da yoksa (olası hatalı veri), sepete eklememeliyiz.
      if (!selectedVariant) {
          toast({ title: "Hata", description: "Bu ürün satın alınabilir varyanta sahip değil.", variant: "destructive" });
          return;
      }

      // Seçili varyantın stoğu 0 ise eklenemez (Bu kontrol buton disabled olduğu için zaten burada gerekmez ama ek kontrol iyidir)
      if (selectedVariant.stock <= 0) {
          const variantConfigNames = selectedVariant.configurations.map(c=>c.optionValue.value).join(' / ') || "Standart";
          setModalMessage(`Üzgünüz, "${variantConfigNames}" varyantının stoğu tükendi.`);
          setShowStockModal(true);
          return;
      }


    // Sepete eklenmek istenen miktar seçili varyantın stokundan fazla olamaz
    // Bu kontrol handleQuantityChange içinde yapılıyor, ancak burada son kez kontrol edilebilir.
      const existingItemInCart = cartItems.find(item => item.productVariantId === selectedVariant.id);
      const totalAfterAdd = (existingItemInCart?.quantity ?? 0) + quantity;

      if (totalAfterAdd > selectedVariant.stock) {
        const message = existingItemInCart
            ? `Sepetinizde bu varyanttan ${existingItemInCart.quantity} adet var. Toplamda maksimum ${selectedVariant.stock} adet olabilir.`
            : `Üzgünüz, bu varyant için stok yetersiz. Maksimum ${selectedVariant.stock} adet ekleyebilirsiniz.`;
        setModalMessage(message);
        setShowStockModal(true);
        // Miktarı sepetteki ile birleşince stoku aşmayacak şekilde ayarla
        // Bu, handleQuantityChange tarafından zaten yapılıyor olmalı, ama burada tekrar ayar yapılabilir.
        setQuantity(Math.max(1, selectedVariant.stock - (existingItemInCart?.quantity ?? 0))); // Miktarı düzelt
          return; // Ekleme işlemini durdur
      }


    // CartContext'e eklenecek item formatı
    const itemToAdd = {
          productId: product.id, // Ürün ID'si (gösterim veya backend için)
          productVariantId: selectedVariant.id, // *** Kritik: Varyant ID'si
          title: product.title,
          // Varyantın ismini konfigürasyonlardan oluştur
          variantName: selectedVariant.configurations.map(c=>c.optionValue.value).join(' / ') || "Standart",
          price: variantPrice, // Hesaplanan varyant fiyatı
          image: mainImage, // Ana görsel URL'si
          quantity: quantity, // Kullanıcının seçtiği miktar
          // Seçili opsiyonları da ekleyebiliriz (sadece gösterim için)
          selectedOptions: Object.values(selectedOptions),
      };

    // Sepette aynı VARYANTIN (productVariantId) zaten olup olmadığını kontrol et
    // (Bu kontrol yukarıda totalAfterAdd hesaplanırken zaten yapıldı)


    // Ekleme işlemini gerçekleştir
    addToCart(itemToAdd);

    toast({
      title: existingItemInCart ? "Miktar Güncellendi" : "Sepete Eklendi",
      description: existingItemInCart
        ? `"${itemToAdd.title} (${itemToAdd.variantName})" sepetinizdeki miktarı ${quantity} artırıldı.`
        : `"${itemToAdd.title} (${itemToAdd.variantName})" (${itemToAdd.quantity} adet) sepetinize eklendi.`,
      duration: 3000,
    });

    // Sepete ekledikten sonra miktarı tekrar 1'e ayarlayabiliriz veya seçili varyantın kalan stoğu kadar yapabiliriz.
    // 1'e ayarlamak genel bir yaklaşımdır.
    setQuantity(1); // Sepete ekledikten sonra miktarı resetle


  };

  // Fare hareketine göre yakınlaştırma konumunu hesapla
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;

    const { currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomX(x);
    setZoomY(y);
  };

  // Yükleme durumu
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 h-[600px] bg-gray-200 animate-pulse rounded-xl" />
          <div className="w-full md:w-1/2 space-y-4">
            <div className="h-10 bg-gray-200 animate-pulse rounded-md w-3/4" />
            <div className="h-6 bg-gray-200 animate-pulse rounded-md w-1/4" />
            <div className="h-32 bg-gray-200 animate-pulse rounded-md w-full" />
            <div className="h-12 bg-gray-200 animate-pulse rounded-md w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // Hata durumu veya ürün bulunamadı durumu
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-500 mb-4">{error || "Ürün bulunamadı."}</p>
        <Button onClick={() => router.push("/products")}>Ürünlere Dön</Button>
      </div>
    );
  }


  // Stok durumu metni
  const stockStatusText = totalAvailableStock > 0 ? (
    <span className="text-green-600 font-semibold">Stokta</span>
  ) : (
    <span className="text-red-600 font-semibold">Stokta Yok</span>
  );

  // Sepete ekle butonunun disabled durumu
  // Disabled olacak durumlar:
  // 1. Seçili varyantın stoğu 0 ise (seçenekli veya seçeneksiz ürünlerde)
  // 2. Ürünün seçenekleri varsa ama geçerli bir varyant seçili değilse
  const isAddToCartDisabled = (selectedVariant?.stock ?? 0) === 0 || ((product.options?.length ?? 0) > 0 && !selectedVariant);

    // Seçenekler gösterilecek mi? (Sadece ürünün seçenekleri varsa)
    const showOptionsSelection = (product.options?.length ?? 0) > 0;


  return (
    <div className="container mx-auto px-4 py-12 font-inter">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Ürün Görseli ve Küçük Resimler */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          {/* Ana Görsel - Yakınlaştırma Özelliği Eklendi */}
          <div
            className="relative h-[600px] rounded-xl overflow-hidden shadow-lg"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => { setIsZoomed(false); setZoomX(50); setZoomY(50); }}
            onMouseMove={handleMouseMove}
            style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
          >
            <Image
              src={mainImage}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover bg-gray-100 transition-transform duration-100 ease-out"
              style={{
                transform: isZoomed ? 'scale(2.5)' : 'scale(1)',
                transformOrigin: `${zoomX}% ${zoomY}%`,
              }}
              priority
            />
          </div>

          {/* Küçük Resimler */}
          {product.images && product.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <div
                  key={img.id}
                  className={`relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden cursor-pointer border-2 ${
                    mainImage === `${API_URL}${img.url}` ? "border-pink-600" : "border-transparent"
                  }`}
                  onClick={() => setMainImage(`${API_URL}${img.url}`)}
                >
                  <Image
                    src={`${API_URL}${img.url}`}
                    alt={`${product.title} thumbnail`}
                    sizes="96px" // 96px genişliğinde
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ürün Detayları */}
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>

          {/* Fiyat: Seçili varyantın veya ana ürünün fiyatı */}
          <p className="text-3xl font-bold text-pink-600 mb-2">
            {variantPrice.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
          </p>

          {/* Stok Bilgisi: Genel stok veya varyant stoğu */}
          <p className="text-sm text-gray-500 mb-6">
            {stockStatusText} {/* totalAvailableStock kullanıldı */}
              {selectedVariant && selectedVariant.sku && (
                  <span className="ml-2">({selectedVariant.sku})</span>
              )}
              {/* Eğer seçenekler varsa ve varyant seçilmemişse, toplam stoğun bir varyanta ait olmadığını belirtebiliriz */}
              {showOptionsSelection && !selectedVariant && totalAvailableStock > 0 && (
                   <span className="ml-2 text-gray-400"></span> //varyant toplamı yazısı kaldırıldı unutulmaması için not düşüyorum
              )}
          </p>


          {product.description && product.description.trim() !== "" && (
            <>
                <p className="text-gray-700 mb-6 whitespace-pre-wrap">{product.description}</p>
                <Separator className="my-6" />
            </>
          )}


          {/* Ürün Seçenekleri (varsa) */}
          {showOptionsSelection && (
            <div className="mb-6">
              {product.options.map((option) => (
                <div key={option.id} className="mb-4">
                  <h3 className="text-lg font-medium mb-2">{option.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => {
                        // Bu değer seçilebilir mi? Hesapla.
                        const selectable = isOptionValueSelectable(option.id, value.value);
                        const isSelected = selectedOptions[option.id]?.value === value.value;

                        // Eğer seçilebilir değilse butonu disabled yap ve stil ver
                        // Eğer isSelected ise disabled olmamalı
                        const isDisabled = !selectable && !isSelected;


                       return (
                           <Button
                               key={value.id}
                               variant={isSelected ? "default" : "outline"}
                               className={`rounded-full ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                               onClick={() => handleOptionSelect(option.id, option.name, value.value)}
                               disabled={isDisabled} // Seçilebilir değilse disabled
                           >
                               {value.value}
                               {/* Stokta olmayanı veya seçilemeyeni göstermek için EyeOff iconu */}
                               {!selectable && !isSelected && <EyeOff className="ml-1 h-4 w-4 text-gray-500"/>}
                           </Button>
                       );
                    })}
                  </div>
                </div>
              ))}
              {/* Tüm seçenekler seçilmemişse uyarı */}
              {!selectedVariant && showOptionsSelection && ( // Sadece seçenekli ürünlerde uyarıyı göster
                    <p className="text-sm text-red-500 mt-4">Lütfen devam etmek için tüm seçenekleri seçiniz.</p>
              )}
                {/* Seçilen varyantın ismini göster (isteğe bağlı) */}
              {selectedVariant && (
                    <p className="text-sm text-green-600 mt-2">Seçili Varyant: {selectedVariant.configurations.map(c=>c.optionValue.value).join(' / ')}</p>
              )}
              <Separator className="my-6" />
            </div>
          )}


          {/* Miktar Seçimi */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Miktar</h3>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity - 1)}
                // Miktar 1'den az olamaz, stok 0 ise veya sepete ekleme disabled ise disabled yap
                disabled={quantity <= 1 || (selectedVariant?.stock ?? 0) === 0 || isAddToCartDisabled || !selectedVariant}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="mx-4 w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity + 1)}
                // Miktar seçili varyantın stokundan fazla olamaz
                disabled={quantity >= (selectedVariant?.stock ?? 0) || (selectedVariant?.stock ?? 0) === 0 || isAddToCartDisabled || !selectedVariant}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sepete Ekle Butonu */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-pink-600 hover:bg-pink-700 flex-1 rounded-lg"
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled} // Yeni disabled kontrolü
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {/* Buton metni */}
              {totalAvailableStock === 0 ? (
                "Stokta Yok"
                ) : (
                  (product.options?.length ?? 0) > 0 && !selectedVariant ?
                  "Lütfen Seçenek Seçin" : "Sepete Ekle"
                )}
            </Button>
          </div>
        </div>
      </div>

      {/* Modallar */}
      {/* Seçenek Seçilmedi Modalı (Sadece seçenekli ürünler için) */}
      {showOptionsModal && showOptionsSelection && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto relative transform transition-all sm:scale-100 opacity-100">
            <button
              onClick={() => setShowOptionsModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" /> {/* Import XCircle */}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Eksik Seçim</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">{modalMessage}</p>
              </div>
              <div className="mt-5 sm:mt-6">
                <Button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-pink-600 text-base font-medium text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:text-sm"
                  onClick={() => setShowOptionsModal(false)}
                >
                  Tamam
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stok Yetersiz Modalı */}
      {showStockModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto relative transform transition-all sm:scale-100 opacity-100">
            <button
              onClick={() => setShowStockModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <ShoppingCart className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Stok Yetersiz!</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">{modalMessage}</p>
              </div>
              <div className="mt-5 sm:mt-6">
                <Button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-pink-600 text-base font-medium text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:text-sm"
                  onClick={() => setShowStockModal(false)}
                >
                  Anladım
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
