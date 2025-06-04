'use client'; // Bu bileşenin istemci tarafında çalışmasını sağlar

import { useState, useEffect } from 'react';
import Link from "next/link";
import { CheckCircle, BadgeCheck, Headset, ChevronRight } from "lucide-react";

import ProductCard from "@/components/product-card";
import HomeSlider from "@/components/home-slider";
import DesignGallery from "@/components/design-gallery";
import { Button } from "@/components/ui/button";

// API fonksiyonlarını lib/api.ts dosyasından içe aktarıyoruz
import { fetchFavoriteProducts } from "@/lib/api";

// API URL'ini burada tanımlıyoruz veya merkezi bir yerden import ediyoruz
// productcard componentindeki API_URL ile aynı olmalı
const API_URL = "https://kirpikapi.esmedddemo.com";

// ProductImage arayüzü - Backend'den gelen yapıya uygun olmalı
interface ProductImage {
    id: number;
    url: string;
    productId: number;
    createdAt: string;
}

// Ürün arayüzü - Backend'den gelen yapıya uygun olmalı
interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    images: ProductImage[]; // imageUrl yerine images dizisi kullanıldı
    categoryId?: number | null; // categoryId'nin null veya undefined olabileceğini belirtiyoruz
    options?: Array<{ // Ürün detay sayfasındaki Product arayüzü ile uyumlu olması için eklendi
        id: number;
        name: string;
        values: Array<{ id: number; value: string }>;
    }>;
}

export default function Home() {
    // Ürünleri saklamak için state değişkeni
    const [productsToDisplay, setProductsToDisplay] = useState<Product[]>([]);
    // Yükleme durumunu izlemek için state değişkeni
    const [isLoading, setIsLoading] = useState(true);
    // Hata durumunu izlemek için state değişkeni
    const [error, setError] = useState<string | null>(null);

    // Bileşen yüklendiğinde veya bağımlılıklar değiştiğinde ürünleri çekmek için useEffect kullanıyoruz
    useEffect(() => {
        const getProducts = async () => {
            try {
                setIsLoading(true); // Yüklemeyi başlat
                setError(null); // Önceki hataları temizle
                const data = await fetchFavoriteProducts(); // Favori ürünleri çek
                setProductsToDisplay(data); // Çekilen ürünleri state'e kaydet
                console.log("Successfully fetched favorite products:", data.length, "products found.");
            } catch (err) {
                console.error("Error fetching favorite products:", err);
                setError("Favori ürünler çekilirken bir hata oluştu."); // Hata mesajını ayarla
                setProductsToDisplay([]); // Hata durumunda ürünleri boşalt
            } finally {
                setIsLoading(false); // Yüklemeyi bitir
            }
        };

        getProducts(); // Ürünleri çekme fonksiyonunu çağır
    }, []); // Boş bağımlılık dizisi, bileşen sadece bir kez yüklendiğinde çalışmasını sağlar

    return (
        <main className="flex min-h-screen flex-col items-center">
            {/* Hero Slider Section */}
            <section className="w-full">
                <HomeSlider />
            </section>

            {/* Video Section */}
            <section className="w-full bg-slate-50">
                <div className="w-full aspect-[21/9] max-h-[600px]">
                    <video
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        poster="/IMG_3425.MP4?height=720&width=1920"
                    >
                        <source src="/IMG_3425.MP4" type="video/mp4" />
                        Tarayıcınız video etiketini desteklemiyor.
                    </video>
                </div>
            </section>

            {/* All Products Section */}
            <section className="w-full py-16">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold">Favori Ürünlerimiz</h2> {/* Başlık güncellendi */}
                        <Link href="/urunler" className="flex items-center text-pink-600 hover:text-pink-700 transition-colors">
                            Tümünü Gör
                            <ChevronRight className="h-5 w-5 ml-1" />
                        </Link>
                    </div>

                    {/* Ürünleri gösteren grid */}
                    {isLoading ? (
                        <p className="col-span-full text-center text-gray-600">Ürünler yükleniyor...</p>
                    ) : error ? (
                        <p className="col-span-full text-center text-red-600">{error}</p>
                    ) : productsToDisplay.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {productsToDisplay.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    title={product.title}
                                    price={product.price}
                                    image={product.images && product.images.length > 0 ? `${API_URL}${product.images[0].url}` : "/placeholder.svg"}
                                    description={product.description}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="col-span-full text-center text-gray-600">Şu anda görüntülenecek favori ürün bulunmamaktadır.</p>
                    )}

                    {productsToDisplay.length > 0 && (
                        <div className="text-center mt-10">
                            <Button asChild size="lg" className="bg-pink-600 hover:bg-pink-700">
                                <Link href="/urunler">Tüm Ürünleri Keşfet</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* Benefits Section */}
            <section className="w-full py-16 bg-gradient-to-r from-pink-50 to-purple-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Neden Bizi Tercih Etmelisiniz?</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-md text-center">
                            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-8 w-8 text-pink-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Kaliteli Ürünler</h3>
                            <p className="text-gray-600">
                                Ürünlerimiz UTS kayıtlıdır (Sağlık Bakanlığı onaylıdır).
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md text-center">
                            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BadgeCheck className="h-8 w-8 text-pink-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Başarı Garantisi</h3>
                            <p className="text-gray-600">
                                Eğitim alanında öğrencilerimize uluslararası başarı garantisi vermekteyiz.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md text-center">
                            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Headset className="h-8 w-8 text-pink-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Teknik Danışmanlık</h3>
                            <p className="text-gray-600">
                                Ücretsiz ürün kullanımı üzerine teknik danışmanlık verilmektedir.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
