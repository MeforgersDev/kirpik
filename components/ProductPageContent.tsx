"use client"

import { useState, useEffect, useCallback, useMemo } from "react" // useMemo eklendi
import { useSearchParams, useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/product-card"
import { fetchProducts, fetchCategories } from "@/lib/api"
// ProductType'ın variants içerdiğinden emin olun (api.ts'den geliyor)
import type { Product as ProductType, Category as CategoryType } from "@/lib/api";

const API_URL = "https://kirpikapi.esmedddemo.com";

// Category arayüzü ProductType'tan ayrıldı, CategoryType olarak import edildi
// interface Category {
//   id: number;
//   name: string;
// }

const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
};

export default function ProductPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categorySlugParam = searchParams.get("kategori"); // "category" yerine "kategori" olarak güncellendi

  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]); // CategoryType kullanıldı
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([fetchProducts(), fetchCategories()]);

      setProducts(productsData);
      setCategories(categoriesData);

      if (categorySlugParam) {
        const foundCategory = categoriesData.find(cat => createSlug(cat.name) === categorySlugParam);
        if (foundCategory) {
          setSelectedCategory(foundCategory.id);
        } else {
          // Eğer slug ile kategori bulunamazsa, /urunler ana sayfasına yönlendir ve seçimi temizle.
          // router.replace("/urunler") kullanmak yerine, URL'yi manipüle etmeden sadece state'i güncelleyebiliriz
          // veya kullanıcıya "Kategori bulunamadı" gibi bir mesaj gösterebiliriz.
          // Şimdilik seçimi temizliyoruz.
          setSelectedCategory(null);
          // URL'yi temizlemek için:
          const currentPath = window.location.pathname;
          router.replace(currentPath, undefined); // undefined scroll'u korur
        }
      } else {
        setSelectedCategory(null);
      }
    } catch (err) {
      console.error("Veri yüklenirken hata oluştu:", err);
      setError("Ürünler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [categorySlugParam, router]); // router bağımlılığa eklendi

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCategoryClick = (categoryId: number | null) => {
    let newSelectedCategory: number | null = null;
    let newUrl = "/urunler"; // Varsayılan URL

    if (categoryId !== null) {
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        const categorySlug = createSlug(category.name);
        // Eğer tıklanan kategori zaten seçiliyse, seçimi kaldır (Tüm Ürünler'e dön)
        if (selectedCategory === categoryId) {
          newSelectedCategory = null;
          // newUrl = "/urunler"; // Zaten varsayılan
        } else {
          newSelectedCategory = categoryId;
          newUrl = `/urunler?kategori=${categorySlug}`;
        }
      } else {
        console.warn("Tıklanan kategori bulunamadı:", categoryId);
        return; // Kategori bulunamazsa işlem yapma
      }
    }
    // Eğer categoryId null ise (Tüm Ürünler tıklandıysa), newSelectedCategory null kalır ve newUrl "/urunler" olur.

    setSelectedCategory(newSelectedCategory);
    router.push(newUrl);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())); // product.description null olabilir

      const matchesCategory =
        selectedCategory === null || (product.categoryId != null && product.categoryId === selectedCategory);
      
      // YENİ: Sadece stokta olan ürünleri göster (tüm varyantların toplam stoğu 0'dan büyükse)
      // Eğer fetchProducts zaten sadece yayınlanmış ve stokta olanları getiriyorsa bu filtre gereksiz olabilir.
      // Ancak frontend'de ek bir güvence sağlar.
      const totalStock = product.variants?.reduce((sum, variant) => sum + variant.stock, 0) ?? 0;
      // const productIsAvailable = totalStock > 0; // Bu satır isteğe bağlı olarak eklenebilir.
      // Şimdilik tüm ürünleri gösterip ProductCard içinde stok durumunu belirtiyoruz.
      // Eğer sadece stokta olanları listelemek isterseniz: return matchesSearch && matchesCategory && productIsAvailable;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);


  const headerTitle = selectedCategory === null
    ? "Tüm Ürünler"
    : categories.find(cat => cat.id === selectedCategory)?.name || "Ürünlerimiz";

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-inter">
      {/* Aside (Kategoriler) */}
      <aside className="w-full md:w-64 bg-white p-6 shadow-lg md:shadow-xl rounded-lg md:rounded-none md:sticky md:top-0 md:h-screen overflow-y-auto z-10 flex-shrink-0 mb-6 md:mb-0">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">Kategoriler</h2>
        <nav className="flex flex-col gap-3">
          <div
            onClick={() => handleCategoryClick(null)}
            className={`
              cursor-pointer rounded-lg py-2 text-base font-medium transition-colors duration-200
              ${selectedCategory === null
                ? "border-l-4 border-pink-600 pl-4 text-pink-600 font-semibold bg-pink-50" // Aktif kategori stili
                : "pl-5 text-gray-700 hover:bg-gray-100 hover:text-pink-600"
              }
            `}
          >
            Tüm Ürünler
          </div>
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                cursor-pointer rounded-lg py-2 text-base font-medium transition-colors duration-200
                ${selectedCategory === category.id
                  ? "border-l-4 border-pink-600 pl-4 text-pink-600 font-semibold bg-pink-50" // Aktif kategori stili
                  : "pl-5 text-gray-700 hover:bg-gray-100 hover:text-pink-600"
                }
              `}
            >
              {category.name}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">{headerTitle}</h1>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              type="search"
              placeholder="Ürün ara..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 shadow-sm text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => ( // Skeleton adedini ayarlayabilirsiniz
              <div key={i} className="bg-gray-200 rounded-xl h-96 animate-pulse" /> // Yüksekliği artırıldı
            ))}
          </div>
        ) : error && filteredProducts.length === 0 ? ( // filteredProducts kontrolü eklendi
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <p className="text-red-500 mb-6 text-xl font-medium">{error}</p>
            <Button onClick={() => loadData()} className="px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow bg-pink-600 text-white hover:bg-pink-700">Yeniden Dene</Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <p className="text-xl mb-6 text-gray-700 font-medium">
              {searchTerm || selectedCategory ? "Aradığınız kriterlere uygun ürün bulunamadı." : "Henüz ürün bulunmamaktadır."}
            </p>
            {(searchTerm || selectedCategory) && ( // Sadece filtre varsa temizle butonu göster
                 <Button
                    onClick={() => {
                        setSearchTerm("")
                        // handleCategoryClick(null) çağırarak URL'yi de güncelleyelim
                        handleCategoryClick(null);
                    }}
                    className="px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow bg-pink-600 text-white hover:bg-pink-700"
                    >
                    Filtreleri Temizle
                </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              // Her ürün için toplam stok hesapla
              const totalStock = product.variants?.reduce((sum, variant) => sum + variant.stock, 0) ?? 0;
              // Ürünün ilk görselini al veya varsayılan kullan
              const imageUrl = product.images && product.images.length > 0 
                                ? `${API_URL}${product.images[0].url}` 
                                : "https://placehold.co/400x300/E0E0E0/333333?text=Görsel+Yok";

              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price} // Ana ürün fiyatı
                  image={imageUrl}
                  description={product.description || ""} // description null olabilir
                  // stock={totalStock} // Eski 'stock' prop'u yerine 'totalStock' kullanacağız
                  totalStock={totalStock} // YENİ PROP
                  // options prop'unu ProductCard beklemiyor, eğer gerekirse eklenebilir
                  // options={product.options} 
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}