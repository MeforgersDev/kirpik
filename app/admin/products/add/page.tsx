"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ImagePlus, PlusCircle, XCircle, Star, Sparkles, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { fetchCategories, addProduct } from "@/lib/api" // addProduct API call remains the same as it accepts FormData

interface Category {
  id: number
  name: string
}

interface ProductOptionInput {
  id: string 
  name: string 
  values: string 
}

interface VariantCombination {
  optionName: string
  optionValue: string
}

interface ProductVariantInput {
  id: string 
  combination: VariantCombination[]
  keyString: string // "Renk:Mavi_Beden:XL" gibi unique bir anahtar
  sku: string
  stock: string 
  price: string 
}

export default function AddProductPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth()
  const { toast } = useToast()

  const [categories, setCategories] = useState<Category[]>([])
  const [pageLoading, setPageLoading] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  
  const [productOptions, setProductOptions] = useState<ProductOptionInput[]>([])
  const [productVariants, setProductVariants] = useState<ProductVariantInput[]>([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "", 
    categoryId: "",
  })
  const [isPublished, setIsPublished] = useState(true) // Varsayılan yayınla
  const [isFavorite, setIsFavorite] = useState(false)

  const isAdmin = isAuthenticated && user?.role === "ADMIN"

  useEffect(() => { 
    if (authIsLoading) return
    if (!isAuthenticated) { router.push("/login"); return }
    if (!isAdmin) {
      router.push("/");
      toast({ title: "Yetkisiz Erişim", description: "Bu sayfaya erişim yetkiniz bulunmamaktadır.", variant: "destructive" });
      return;
    }
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("Kategoriler yüklenirken hata:", error);
        toast({ title: "Veri Yükleme Hatası", description: "Kategoriler yüklenemedi.", variant: "destructive" });
      }
    };
    loadCategories();
  }, [isAuthenticated, isAdmin, authIsLoading, router, toast])


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImageFiles: File[] = Array.from(files);
    setImageFiles((prevFiles) => [...prevFiles, ...newImageFiles]);
    newImageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prevPreviews) => [...prevPreviews, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = ""; 
  }

  const removeImage = (indexToRemove: number) => {
    setImageFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
    setImagePreviews((prevPreviews) => prevPreviews.filter((_, index) => index !== indexToRemove));
  }

  const addProductOptionInput = () => {
    setProductOptions([...productOptions, { id: `opt-${Date.now()}`, name: "", values: "" }])
  }

  const handleOptionNameChange = (id: string, newName: string) => {
    setProductOptions(prev => prev.map(opt => opt.id === id ? { ...opt, name: newName.trim() } : opt))
  }

  const handleOptionValuesChange = (id: string, newValues: string) => {
    setProductOptions(prev => prev.map(opt => opt.id === id ? { ...opt, values: newValues } : opt))
  }

  const removeProductOptionInput = (id: string) => {
    const removedOption = productOptions.find(opt => opt.id === id);
    setProductOptions(prev => prev.filter(opt => opt.id !== id));
    // Eğer kaldırılan seçenek bir varyantta kullanılıyorsa, o varyantı da temizle
    if (removedOption) {
        setProductVariants(prevVariants => 
            prevVariants.filter(variant => 
                !variant.combination.some(c => c.optionName === removedOption.name)
            )
        );
        if (productOptions.length <= 1) { // Son seçenek de kaldırıldıysa tüm varyantları temizle
            setProductVariants([]);
        }
    }
  }

  const cartesian = <T extends { optionName: string; optionValue: string }>(...args: T[][]): T[][] => {
    if (args.length === 0) return [[]]; // Hiç argüman yoksa boş bir kombinasyon döndür
    return args.reduce<T[][]>(
        (acc, curr) => {
            if (curr.length === 0) return acc; // Boş bir değerler dizisi varsa atla
            return acc.flatMap(a => curr.map(c => [...a, c]));
        },
        [[]] // Başlangıç değeri olarak boş bir array içeren bir array
    );
  };

  const generateVariants = () => {
    const validOptions = productOptions.filter(opt => opt.name.trim() !== "" && opt.values.trim() !== "");
    
    if (validOptions.length === 0) {
        // Seçenek yoksa, "Standart" bir varyant oluştur
        const defaultKey = "Standart:Standart";
        const existingStdVariant = productVariants.find(v => v.keyString === defaultKey);
        setProductVariants([{
            id: existingStdVariant?.id || `var-${Date.now()}`,
            combination: [{ optionName: "Standart", optionValue: "Standart"}],
            keyString: defaultKey,
            sku: existingStdVariant?.sku || formData.title.slice(0,10).replace(/\s+/g, '-').toUpperCase() + "-STD" || "STD-SKU",
            stock: existingStdVariant?.stock || "0", 
            price: existingStdVariant?.price || ""  
        }]);
        toast({ title: "Bilgi", description: "Seçenek bulunmadığı için standart bir varyant oluşturuldu. Lütfen stok girin.", variant: "default" });
        return;
    }

    const optionArrays = validOptions.map(opt => {
      const values = opt.values.split(',').map(v => v.trim()).filter(v => v !== "");
      if (values.length === 0) {
        toast({ title: "Uyarı", description: `"${opt.name}" seçeneği için değer girilmemiş. Bu seçenek atlanacak.`, variant: "default" });
        return []; // Değeri olmayan seçeneği boş array olarak döndür ki cartesian product'ta skip edilsin
      }
      return values.map(val => ({ optionName: opt.name.trim(), optionValue: val }));
    }).filter(arr => arr.length > 0); // Değeri olmayan seçenekleri filtrele


    if (optionArrays.length === 0 && validOptions.length > 0) {
        toast({ title: "Hata", description: "Tüm geçerli seçeneklerin en az bir değeri olmalıdır.", variant: "destructive" });
        return;
    }
    
    const combinationsRaw = cartesian(...optionArrays);

    const newVariants = combinationsRaw.map((comboSet, index) => {
        const currentCombination: VariantCombination[] = Array.isArray(comboSet) ? comboSet : (comboSet ? [comboSet] : []);
        
        // Unique key oluştur (sıralı)
        const keyString = currentCombination.map(c => `${c.optionName}:${c.optionValue}`).sort().join('_');
        const existingVariant = productVariants.find(pv => pv.keyString === keyString);

        return {
            id: existingVariant?.id || `var-${Date.now()}_${index}`,
            combination: currentCombination,
            keyString: keyString,
            sku: existingVariant?.sku || "",
            stock: existingVariant?.stock || "0", 
            price: existingVariant?.price || "", 
        };
    });
    setProductVariants(newVariants);
    if (newVariants.length > 0) {
        toast({ title: "Başarılı", description: `${newVariants.length} varyant oluşturuldu/güncellendi.` });
    } else if (validOptions.length > 0) { // Seçenek var ama kombinasyon oluşmadıysa
        toast({ title: "Bilgi", description: "Varyant oluşturulamadı. Lütfen seçenek değerlerini kontrol edin." });
    }
  };
  
  const handleVariantInputChange = (variantId: string, field: keyof Omit<ProductVariantInput, 'id' | 'combination' | 'keyString'>, value: string) => {
    setProductVariants(prev => 
      prev.map(variant => 
        variant.id === variantId ? { ...variant, [field]: value } : variant
      )
    );
  };

  const removeVariant = (variantId: string) => {
    setProductVariants(prev => prev.filter(v => v.id !== variantId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.price.trim()) {
      toast({ title: "Eksik Bilgi", description: "Lütfen ürün adı ve ana fiyatını girin.", variant: "destructive" })
      return
    }
    if (productVariants.length === 0) {
        toast({ title: "Eksik Bilgi", description: "Lütfen en az bir ürün varyantı oluşturun (gerekirse 'Standart Varyant Ekle' ile) ve stok girin.", variant: "destructive" });
        return;
    }
    const invalidStockVariant = productVariants.find(v => v.stock.trim() === "" || isNaN(parseInt(v.stock)) || parseInt(v.stock) < 0);
    if (invalidStockVariant) {
        toast({ title: "Geçersiz Stok", description: `Lütfen "${invalidStockVariant.combination.map(c=>c.optionValue).join('/')}" varyantı için geçerli bir stok miktarı (0 veya üzeri) girin.`, variant: "destructive" });
        return;
    }

    setPageLoading(true)
    const submissionFormData = new FormData()

    submissionFormData.append("title", formData.title)
    submissionFormData.append("description", formData.description)
    submissionFormData.append("price", formData.price) 
    if (formData.categoryId) {
      submissionFormData.append("categoryId", formData.categoryId)
    }
    submissionFormData.append("published", isPublished.toString())
    submissionFormData.append("isFavorite", isFavorite.toString())

    imageFiles.forEach((file) => {
      submissionFormData.append("images", file)
    })

    const optionsToSend = productOptions
      .filter(opt => opt.name.trim() !== "" && opt.values.trim() !== "")
      .map(opt => ({
        name: opt.name.trim(),
        values: opt.values.split(",").map(v => v.trim()).filter(v => v !== ""),
      }))
      .filter(opt => opt.values.length > 0);
    
    // Sadece `optionsToSend` boş değilse gönder, aksi halde backend'de JSON.parse("") hatası olabilir
    if (optionsToSend.length > 0) {
        submissionFormData.append("options", JSON.stringify(optionsToSend));
    }

    const variantsToSend = productVariants
      .map(v => ({
        combination: v.combination, 
        stock: parseInt(v.stock),
        price: v.price.trim() !== "" && !isNaN(parseFloat(v.price)) ? parseFloat(v.price) : null,
        sku: v.sku.trim() || undefined, 
      }));
    
    if (variantsToSend.length > 0) {
      submissionFormData.append("variants", JSON.stringify(variantsToSend));
    } else {
        // Bu durum yukarıda engellendi ama güvenlik için
        toast({ title: "Hata", description: "Gönderilecek geçerli varyant bulunamadı.", variant: "destructive" });
        setPageLoading(false);
        return;
    }

    try {
      await addProduct(submissionFormData)
      toast({ title: "Başarılı", description: "Ürün başarıyla eklendi." })
      router.push("/admin/") // Genellikle /admin/products gibi bir listeleme sayfasına yönlendirilir.
    } catch (error: any) {
      console.error("Ürün eklenirken hata:", error)
      const errorMsg = error.response?.data?.message || error.message || "Ürün eklenirken bir hata oluştu."
      toast({ title: "Hata", description: errorMsg, variant: "destructive" })
    } finally {
      setPageLoading(false)
    }
  }

  if (authIsLoading || !isAuthenticated || !isAdmin) {
    return <div className="container mx-auto px-4 py-8 text-center">Yetki kontrol ediliyor...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Yeni Ürün Ekle</h1>
        <Button variant="outline" onClick={() => router.push("/admin/")}>Geri Dön</Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Ürün Bilgileri</CardTitle>
            <CardDescription>Yeni ürün için gerekli bilgileri doldurun.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Ürün Adı *</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="Örn: Pamuklu Tişört" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Ana Fiyat (TL) *</Label>
                  <Input id="price" name="price" type="number" step="0.01" min="0" value={formData.price} onChange={handleInputChange} placeholder="199.90" required />
                  <p className="text-xs text-muted-foreground">Varyantların kendi fiyatı yoksa bu fiyat kullanılır.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select value={formData.categoryId} onValueChange={handleSelectChange}>
                    <SelectTrigger><SelectValue placeholder="Kategori seçin" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Ürün Açıklaması</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Ürün hakkında detaylı bilgi" rows={3} />
                </div>
                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Switch id="publish-mode" checked={isPublished} onCheckedChange={setIsPublished} />
                  <Label htmlFor="publish-mode">Ürünü Hemen Yayınla</Label>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="favorite-mode" checked={isFavorite} onCheckedChange={setIsFavorite} />
                  <Label htmlFor="favorite-mode" className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-400 fill-yellow-400" /> Favori Ürün
                  </Label>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="images">Ürün Görselleri</Label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                    <Input id="images" name="images" type="file" accept="image/*" multiple onChange={handleImageChange} className="sr-only" />
                    <label htmlFor="images" className="relative cursor-pointer rounded-md bg-white dark:bg-slate-800 font-semibold text-pink-600 dark:text-pink-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-pink-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-900 hover:text-pink-500 flex flex-col items-center justify-center">
                      <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                      <span>Görsel Yükle</span>
                      <p className="text-xs leading-5 text-gray-600 dark:text-gray-400">PNG, JPG, GIF (max. 5MB)</p>
                    </label>
                  </div>
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {imagePreviews.map((previewUrl, index) => (
                        <div key={index} className="relative group aspect-square">
                          <img src={previewUrl} alt={`Önizleme ${index + 1}`} className="object-cover w-full h-full rounded-md shadow-md"/>
                          <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeImage(index)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Ürün Seçenekleri (Renk, Beden vb.)</h3>
                <Button type="button" variant="outline" size="sm" onClick={addProductOptionInput}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Seçenek Türü Ekle
                </Button>
              </div>
              {productOptions.map((option) => (
                <div key={option.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border dark:border-gray-700 rounded-md relative items-center">
                  <div className="space-y-1 md:col-span-4">
                    <Label htmlFor={`optionName-${option.id}`}>Seçenek Adı</Label>
                    <Input id={`optionName-${option.id}`} value={option.name} onChange={(e) => handleOptionNameChange(option.id, e.target.value)} placeholder="Örn: Renk" />
                  </div>
                  <div className="space-y-1 md:col-span-7">
                    <Label htmlFor={`optionValues-${option.id}`}>Değerler (virgülle ayırın)</Label>
                    <Input id={`optionValues-${option.id}`} value={option.values} onChange={(e) => handleOptionValuesChange(option.id, e.target.value)} placeholder="Mavi,Kırmızı,Yeşil" />
                  </div>
                  <div className="md:col-span-1 flex justify-end md:justify-center">
                     <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 mt-auto" onClick={() => removeProductOptionInput(option.id)}>
                        <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
               {(productOptions.length > 0 || productVariants.length === 0) && ( // Varyant yoksa veya seçenekler varsa göster
                <div className="flex justify-end mt-2">
                    <Button type="button" onClick={generateVariants} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Sparkles className="mr-2 h-4 w-4" /> 
                        {productOptions.length === 0 ? "Standart Varyant Ekle" : "Varyantları Oluştur/Güncelle"}
                    </Button>
                </div>
                )}
            </div>

            {productVariants.length > 0 && (
              <div className="space-y-4 pt-6 border-t dark:border-gray-700">
                <h3 className="text-lg font-medium">Ürün Varyantları ve Stokları</h3>
                <div className="overflow-x-auto rounded-md border dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Varyant</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SKU</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fiyat (Ops.)</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stok *</th>
                        <th className="px-1 py-3 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {productVariants.map((variant) => (
                        <tr key={variant.id}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {variant.combination.map(c => c.optionValue).join(' / ')}
                          </td>
                          <td className="px-3 py-2">
                            <Input 
                              type="text" value={variant.sku} 
                              onChange={(e) => handleVariantInputChange(variant.id, 'sku', e.target.value)}
                              placeholder="SKU123" className="text-sm min-w-[100px]"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input 
                              type="number" step="0.01" value={variant.price} 
                              onChange={(e) => handleVariantInputChange(variant.id, 'price', e.target.value)}
                              placeholder={formData.price || "Ana Fiyat"} className="text-sm w-28 min-w-[100px]"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input 
                              type="number" min="0" value={variant.stock} 
                              onChange={(e) => handleVariantInputChange(variant.id, 'stock', e.target.value)}
                              placeholder="0" required className="text-sm w-20 min-w-[70px]"
                            />
                          </td>
                          <td className="px-1 py-2 text-center">
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(variant.id)} className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50">
                              <XCircle className="h-4 w-4"/>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t dark:border-gray-700 pt-6">
            <Button variant="outline" type="button" onClick={() => router.push("/admin/")}>İptal</Button>
            <Button 
              type="submit" 
              className="bg-pink-600 hover:bg-pink-700" 
              disabled={
                pageLoading || 
                productVariants.length === 0 || 
                productVariants.some(v => v.stock.trim() === "" || isNaN(parseInt(v.stock)) || parseInt(v.stock) < 0) ||
                !formData.title.trim() ||
                !formData.price.trim()
              }
            >
              {pageLoading ? "Ekleniyor..." : "Ürünü Ekle"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}