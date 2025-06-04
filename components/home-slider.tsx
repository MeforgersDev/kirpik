"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// API URL'ini burada tanımlıyoruz
const API_URL = "https://kirpikapi.esmedddemo.com";

interface Slider {
  id: number
  title: string
  imageUrl: string 
}

// fetchSliders fonksiyonunu burada tanımlıyoruz
const fetchSliders = async (): Promise<Slider[]> => {
    try {
        const response = await fetch(`${API_URL}/api/sliders`); // Endpointe göre düzenleyin
        if (!response.ok) {
            throw new Error(`Failed to fetch sliders: ${response.status}`);
        }
        const data = await response.json();
        return data; // Direkt olarak dönen datayı varsayıyoruz.
    } catch (error) {
        console.error("Error fetching sliders:", error);
        throw error; // Hata fırlatıyoruz ki HomeSlider componentinde catch edebilelim.
    }
};


export default function HomeSlider() {
  const [sliders, setSliders] = useState<Slider[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getSliders = async () => {
      try {
        const data = await fetchSliders();
        if (Array.isArray(data)) {
          setSliders(data);
        } else {
          console.error("API'dan gelen slider verisi dizi formatında değil:", data);
          setError("Slider verisi yüklenirken bir hata oluştu.");
          setSliders(generateFallbackSliders()); // Fallback data
        }
      } catch (err: any) {
        console.error("Slider yüklenirken hata oluştu:", err);
        setError("Slider yüklenirken bir hata oluştu: " + err.message);
        setSliders(generateFallbackSliders()); // Fallback data
      } finally {
        setLoading(false);
      }
    };

    getSliders();
  }, []);

  const generateFallbackSliders = (): Slider[] => {
        return [
          {
            id: 1,
            title: "Yeni Sezon Kirpik Serumları",
            image: "/placeholder.svg",
          },
          {
            id: 2,
            title: "Profesyonel Kirpik Bakımı",
            image: "/placeholder.svg",
          },
          {
            id: 3,
            title: "Özel Fırsatlar",
            image: "/placeholder.svg",
          },
        ];
  }

  useEffect(() => {
    if (sliders.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === sliders.length - 1 ? 0 : prev + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [sliders])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? sliders.length - 1 : prev - 1))
  }

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === sliders.length - 1 ? 0 : prev + 1))
  }

  if (loading) {
    return (
      <div className="w-full h-[800px] bg-gray-200 animate-pulse flex items-center justify-center">
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!loading && sliders.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Slider bulunamadı.</p>
      </div>
    );
  }


  return (
    <div className="relative w-full h-[800px] overflow-hidden">
      {sliders.map((slider, index) => (
        <div
          key={slider.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
        <Image
          src={
            slider.imageUrl && typeof slider.imageUrl === "string"
              ? `${API_URL}${slider.imageUrl}`
              : "/placeholder.svg"
          }
          alt={slider.title}
          fill
          className="object-cover"
          priority={index === 0}
        />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 max-w-3xl">{slider.title}</h1>
            <p className="text-lg md:text-xl text-white mb-8 max-w-2xl">
              Profesyonel kirpik ürünleri ile gözlerinizi ön plana çıkarın
            </p>
            <Button asChild size="lg" className="bg-pink-600 hover:bg-pink-700">
              <Link href="/products">Hemen Alışverişe Başla</Link>
            </Button>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors z-10"
        aria-label="Önceki slayt"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goToNextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors z-10"
        aria-label="Sonraki slayt"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {sliders.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Slayt ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
