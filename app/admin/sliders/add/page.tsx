"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ImagePlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context" // isLoading'i dahil etmek için useAuth'ı kullanıyoruz
import { addSlider } from "@/lib/api"

export default function AddSliderPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth() // isLoading durumunu da kullanıyoruz
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Admin kontrolü - Kullanıcı objesindeki 'role' alanını kontrol et
  const isAdmin = isAuthenticated && user?.role === "ADMIN"

  useEffect(() => {
    // Auth state'i yüklenene kadar bekleyin
    if (isLoading) {
      return
    }

    // Kullanıcı kimliği doğrulanmamışsa veya admin değilse yönlendirme yap
    if (!isAuthenticated) {
      router.push("/login")
      // Yönlendirme yapıldığı için burada daha fazla işlem yapmaya gerek yok
      return
    }

    if (!isAdmin) {
      router.push("/")
      toast({
        title: "Yetkisiz Erişim",
        description: "Bu sayfaya erişim yetkiniz bulunmamaktadır.",
        variant: "destructive",
      })
      // Yönlendirme yapıldığı için burada daha fazla işlem yapmaya gerek yok
      return
    }
    // Eğer kullanıcı admin ise başka bir işlem yapmaya gerek yok, sayfa yüklenecek.
  }, [isAuthenticated, isAdmin, isLoading, router, toast]) // isLoading'i bağımlılıklara ekledik

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)

    // Resim önizleme
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen slider başlığını girin.",
        variant: "destructive",
      })
      return
    }

    if (!imageFile) {
      toast({
        title: "Hata",
        description: "Lütfen bir slider görseli seçin.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // FormData oluştur
      const sliderFormData = new FormData()
      sliderFormData.append("title", title)
      sliderFormData.append("image", imageFile)

      // API fonksiyonunuzun token'ı request header'ına eklediğinden emin olun
      await addSlider(sliderFormData)

      toast({
        title: "Başarılı",
        description: "Slider başarıyla eklendi.",
      })

      router.push("/admin")
    } catch (error) {
      console.error("Slider eklenirken hata:", error)
      toast({
        title: "Hata",
        description: "Slider eklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Auth state'i yükleniyorsa veya kullanıcı admin değilse hiçbir şey render etme
  // useEffect içindeki yönlendirme bu durumu zaten ele alacaktır.
  if (isLoading || !isAuthenticated || !isAdmin) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Yeni Slider Ekle</h1>
        <Button variant="outline" onClick={() => router.push("/admin")}>
          Geri Dön
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Slider Bilgileri</CardTitle>
            <CardDescription>Yeni slider için gerekli bilgileri doldurun.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Slider Başlığı *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Slider başlığını girin"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Slider Görseli *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {imagePreview ? (
                  <div className="relative aspect-[16/9] w-full max-w-2xl mx-auto overflow-hidden rounded-md">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Önizleme"
                      className="object-cover w-full h-full"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-2 right-2"
                      onClick={() => {
                        setImagePreview(null)
                        setImageFile(null)
                      }}
                    >
                      Görseli Değiştir
                    </Button>
                  </div>
                ) : (
                  <div className="py-8">
                    <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="image"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-pink-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-pink-600 focus-within:ring-offset-2 hover:text-pink-500"
                      >
                        <span>Görsel Yükle</span>
                        <input
                          id="image"
                          name="image"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageChange}
                          required
                        />
                      </label>
                      <p className="pl-1">veya sürükleyip bırakın</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF (max. 5MB)</p>
                    <p className="text-xs leading-5 text-gray-600 mt-2">
                      Önerilen boyut: 1600x600 piksel (16:6 en-boy oranı)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/admin")}>
              İptal
            </Button>
            <Button type="submit" className="bg-pink-600 hover:bg-pink-700" disabled={loading}>
              {loading ? "Ekleniyor..." : "Slider Ekle"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
