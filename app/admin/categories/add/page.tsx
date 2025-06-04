"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context" // isLoading'i dahil etmek için useAuth'ı kullanıyoruz
import { addCategory } from "@/lib/api"

export default function AddCategoryPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth() // isLoading durumunu da kullanıyoruz
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [categoryName, setCategoryName] = useState("")

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!categoryName.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen kategori adını girin.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      // API fonksiyonunuzun token'ı request header'ına eklediğinden emin olun
      await addCategory(categoryName)

      toast({
        title: "Başarılı",
        description: "Kategori başarıyla eklendi.",
      })

      router.push("/admin")
    } catch (error) {
      console.error("Kategori eklenirken hata:", error)
      toast({
        title: "Hata",
        description: "Kategori eklenirken bir hata oluştu.",
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
        <h1 className="text-3xl font-bold">Yeni Kategori Ekle</h1>
        <Button variant="outline" onClick={() => router.push("/admin")}>
          Geri Dön
        </Button>
      </div>

      <Card className="max-w-md mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Kategori Bilgileri</CardTitle>
            <CardDescription>Yeni kategori için gerekli bilgileri doldurun.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="name">Kategori Adı *</Label>
              <Input
                id="name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Kategori adını girin"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/admin")}>
              İptal
            </Button>
            <Button type="submit" className="bg-pink-600 hover:bg-pink-700" disabled={loading}>
              {loading ? "Ekleniyor..." : "Kategori Ekle"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
