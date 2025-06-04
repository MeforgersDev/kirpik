// "use client" // ProductCard sunucu bileşeni olabilir, eğer client-side hook kullanmıyorsa.
// Ancak Link ve event handler'lar olduğu için client bileşeni olması daha uygun.
"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react" // Heart kaldırıldı, ProductCard'da kullanılmıyor.

import { Button } from "@/components/ui/button"
// useToast ve useCart hook'ları ProductCard içinde doğrudan kullanılmıyor.
// Sepete ekleme ve favori işlemleri ürün detay sayfasında yapılıyor.
// Eğer karttan doğrudan sepete ekleme/favori özelliği isteniyorsa bu hook'lar kalabilir.
// Şimdilik kaldırıyorum, çünkü mevcut kodda bu butonlar "Ürünü İncele"ye yönlendiriyor.
// import { useToast } from "@/components/ui/use-toast"
// import { useCart } from "@/context/cart-context"


// ProductOption arayüzü (ProductPageContent'ta kullanılmıyorsa burada da gereksiz olabilir)
// interface ProductOption {
//   id: number;
//   name: string;
//   values: Array<{ id: number; value: string }>;
// }

interface ProductCardProps {
  id: number
  title: string
  price: number // Ana ürün fiyatı
  image: string
  description: string | null // Açıklama null olabilir
  totalStock: number; // Eski 'stock' yerine yeni prop
  // options?: ProductOption[] // options prop'u artık kullanılmıyor gibi, gerekirse eklenebilir
}

export default function ProductCard({ id, title, price, image, description, totalStock }: ProductCardProps) {
  // const { toast } = useToast() // Kaldırıldı
  // const { addToCart } = useCart() // Kaldırıldı

  const isOutOfStock = totalStock === 0;

  // handleAddToCart ve handleAddToFavorites fonksiyonları karttan doğrudan işlem yapılmayacaksa kaldırılabilir.
  // Mevcut tasarım "Ürünü İncele" butonuna yönlendiriyor.
  /*
  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast({
        title: "Ürün stokta yok",
        description: `${title} şu anda stokta bulunmamaktadır.`,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    // Sepete ekleme mantığı (eğer karttan yapılacaksa)
  }
  */

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg h-full ${isOutOfStock ? 'opacity-70' : ''}`}>
      <Link href={`/urunler/${id}`} className="block relative h-64 sm:h-72 w-full overflow-hidden rounded-t-xl bg-gray-100"> {/* Yükseklik ayarlandı */}
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" // Responsive sizes
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white text-xl sm:text-2xl font-bold z-10 pointer-events-none">
            Tükendi
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
          <Link href={`/urunler/${id}`} className="hover:text-pink-600 transition-colors">
            {title}
          </Link>
        </h3>
        {/* Açıklama (kısa bir versiyonu gösterilebilir veya hiç gösterilmeyebilir) */}
        {/* 
        {description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{description}</p>
        )}
        */}
        
        <p className="text-lg sm:text-xl font-bold text-pink-600 mb-2">
          {price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
        </p>
        
        {/* Stok bilgisini gösteren kısım */}
        <p className={`text-xs sm:text-sm font-medium ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
          {/* {isOutOfStock ? "Stok Tükendi" : `Stok: ${totalStock} adet`} */}
        </p>
      </div>

      <div className="mt-auto p-4 pt-0"> {/* mt-auto ile butonu aşağıya iter */}
        <Button
          asChild // Link bileşenini Button içinde kullanmak için
          variant={isOutOfStock ? "outline" : "default"} // Stokta yoksa farklı stil
          size="sm"
          className={`w-full rounded-md transition-colors duration-200 ${
            isOutOfStock 
            ? 'border-gray-400 text-gray-500 cursor-not-allowed hover:bg-gray-100' 
            : 'bg-pink-600 hover:bg-pink-700 text-white'
          }`}
          // disabled={isOutOfStock} // Link butonu için disabled yerine stil ve pointer-events ile yönetilebilir
        >
          <Link 
            href={`/urunler/${id}`} 
            className={`flex items-center justify-center w-full ${isOutOfStock ? 'pointer-events-none' : ''}`}
            aria-disabled={isOutOfStock} // Erişilebilirlik için
            tabIndex={isOutOfStock ? -1 : 0} // Klavye navigasyonu için
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isOutOfStock ? "Tükendi" : "İncele"}
          </Link>
        </Button>
      </div>
    </div>
  )
}