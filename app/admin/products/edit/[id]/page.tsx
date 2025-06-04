"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { ImagePlus, PlusCircle, XCircle, Star, Eye, Sparkles, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"

import {
  fetchProductByIdAdmin,
  fetchCategories,
  updateProduct,
  Product as ProductFetched, 
  Category,
  ProductImage,
  ProductOption as ProductOptionFetched, 
  ProductVariant as ProductVariantFetched, 
} from "@/lib/api" 

const BASE_ASSET_URL = "https://kirpikapi.esmedddemo.com"; // !! BURAYI KENDİ SUNUCU ADRESİNİZ İLE DEĞİŞTİRİN !!
                                                          // Genellikle API_URL'den /api kısmını çıkarılmış halidir.


interface ProductOptionState {
  id: string | number 
  name: string 
  values: string 
}

interface VariantCombination {
  optionName: string
  optionValue: string
}

interface ProductVariantInput {
  id: string | number 
  combination: VariantCombination[]
  keyString: string 
  sku: string
  stock: string 
  price: string 
}

export default function EditProductPage() {
  const params = useParams() 
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth()
  const { toast } = useToast()

  const [product, setProduct] = useState<ProductFetched | null>(null) 
  const [categories, setCategories] = useState<Category[]>([])
  const [dataLoading, setDataLoading] = useState(true) 
  const [saving, setSaving] = useState(false) 

  const [imagePreviews, setImagePreviews] = useState<string[]>([]) 
  const [imageFiles, setImageFiles] = useState<File[]>([]) 
  const [existingImageIds, setExistingImageIds] = useState<number[]>([]) 

  const [productOptions, setProductOptions] = useState<ProductOptionState[]>([])
  const [productVariants, setProductVariants] = useState<ProductVariantInput[]>([]) 

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "", 
    categoryId: "",
    published: false,
    isFavorite: false,
  })

  const isAdmin = isAuthenticated && user?.role === "ADMIN"

  const productId = useMemo(() => {
      const id = params.id;
      if (typeof id === "string") {
          return Number.parseInt(id);
      }
      return 0; 
  }, [params.id]);


  useEffect(() => {
    if (authIsLoading) return

    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    if (!isAdmin) {
      router.push("/")
      toast({
        title: "Yetkisiz Erişim",
        description: "Bu sayfaya erişim yetkiniz bulunmamaktadır.",
        variant: "destructive",
      })
      return
    }

    if (isNaN(productId) || productId <= 0) {
         toast({ title: "Hata", description: "Geçersiz ürün ID'si.", variant: "destructive" });
         setDataLoading(false); 
         return; 
    }


    const loadData = async () => {
      try {
        setDataLoading(true)

        const [productData, categoriesData] = await Promise.all([
          fetchProductByIdAdmin(productId),
          fetchCategories(),
        ])

        setProduct(productData)
        setCategories(categoriesData)

        if (productData.images) {
            setImagePreviews(productData.images.map((img: ProductImage) => {
                return img.url.startsWith("http") ? img.url : `${BASE_ASSET_URL}${img.url}`;
            }));
            setExistingImageIds(productData.images.map((img: ProductImage) => img.id)); 
        } else {
            setImagePreviews([]);
            setExistingImageIds([]);
        }

        if (productData.options) {
            setProductOptions(
                productData.options.map((opt: ProductOptionFetched) => ({
                    id: opt.id, 
                    name: opt.name,
                    values: opt.values.map((val) => val.value).join(", "), 
                }))
            );
        } else {
            setProductOptions([]);
        }

        if (productData.variants) {
            const loadedVariants: ProductVariantInput[] = productData.variants.map((variant: ProductVariantFetched) => {
                const combination: VariantCombination[] = variant.configurations.map(conf => ({
                    optionName: conf.optionValue.option?.name || 'Bilinmeyen Seçenek', 
                    optionValue: conf.optionValue.value
                }));
                const keyString = combination.map(c => `${c.optionName}:${c.optionValue}`).sort((a, b) => a.localeCompare(b)).join('_');

                return {
                    id: variant.id, 
                    combination,
                    keyString: keyString, 
                    sku: variant.sku || '', 
                    stock: variant.stock.toString(), 
                    price: variant.price !== null ? variant.price.toString() : '', 
                };
            });
            setProductVariants(loadedVariants);
        } else {
            setProductVariants([]);
        }

        setFormData({
          title: productData.title,
          description: productData.description || "",
          price: productData.price.toString(), 
          categoryId: productData.categoryId ? productData.categoryId.toString() : "",
          published: productData.published,
          isFavorite: productData.isFavorite,
        })

      } catch (error) {
        console.error(`Ürün ID ${productId} veya kategoriler yüklenirken hata:`, error)
        toast({
          title: "Hata",
          description: "Ürün bilgileri veya kategoriler yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
        setProduct(null) 
      } finally {
        setDataLoading(false)
      }
    }

    loadData()
  }, [isAuthenticated, isAdmin, authIsLoading, productId, router, toast]) 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }))
  }

  const handleToggleChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImageFiles: File[] = Array.from(files)

    setImageFiles((prevFiles) => [...prevFiles, ...newImageFiles])

    newImageFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prevPreviews) => [...prevPreviews, reader.result as string])
      }
      reader.readAsDataURL(file)
    })

    e.target.value = ""
  }

  const removeImage = (indexToRemove: number) => {
    const existingImagesCount = existingImageIds.length;
    const isExisting = indexToRemove < existingImagesCount;

    if (isExisting) {
        const imageIdToRemove = existingImageIds[indexToRemove];
        setExistingImageIds(prevIds => prevIds.filter(id => id !== imageIdToRemove)); // Kaldırılan ID'yi direkt filtrele
        setImagePreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
    } else {
        const newImageIndex = indexToRemove - existingImagesCount;
        setImageFiles(prevFiles => prevFiles.filter((_, index) => index !== newImageIndex));
        setImagePreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
    }
  }


  const addProductOptionInput = () => {
    setProductOptions([...productOptions, { id: `opt-${Date.now()}`, name: "", values: "" }])
  }

  const handleOptionNameChange = (id: string | number, newName: string) => {
    setProductOptions(prev => prev.map(opt => opt.id === id ? { ...opt, name: newName.trim() } : opt))
  }

  const handleOptionValuesChange = (id: string | number, newValues: string) => {
    setProductOptions(prev => prev.map(opt => opt.id === id ? { ...opt, values: newValues } : opt))
  }

  const removeProductOptionInput = (id: string | number) => {
    const removedOption = productOptions.find(opt => opt.id === id);
    setProductOptions(prev => prev.filter(opt => opt.id !== id));

    if (removedOption) {
        setProductVariants(prevVariants =>
            prevVariants.filter(variant =>
                !variant.combination.some(c => c.optionName === removedOption.name)
            )
        );
    }
  }

    const cartesian = <T extends { optionName: string; optionValue: string }>(...args: T[][]): T[][] => {
        if (args.length === 0 || args.some(arg => arg.length === 0)) return [[]]; 
        return args.reduce<T[][]>(
            (acc, curr) => acc.flatMap(a => curr.map(c => [...a, c])),
            [[]]
        );
    };


  const generateVariants = () => {
    const validOptions = productOptions.filter(opt => {
        const trimmedName = opt.name.trim();
        const trimmedValues = opt.values.split(',').map(v => v.trim()).filter(v => v !== "");

        if (trimmedName === "" && trimmedValues.length > 0) {
             toast({ title: "Uyarı", description: "Değerleri olan bir seçeneğin adı boş bırakılamaz. Bu seçenek atlanacak.", variant: "default" });
             return false;
        }
         if (trimmedName !== "" && trimmedValues.length === 0) {
             toast({ title: "Uyarı", description: `"${trimmedName}" seçeneği için değer girilmemiş. Bu seçenek atlanacak.`, variant: "default" });
             return false;
         }
         return trimmedName !== "" && trimmedValues.length > 0;
    });

    if (validOptions.length === 0) {
        const defaultCombination = [{ optionName: "Çeşit", optionValue: "Standart"}];
        const defaultKey = defaultCombination.map(c => `${c.optionName}:${c.optionValue}`).sort((a, b) => a.localeCompare(b)).join('_');

        const existingStdVariant = productVariants.find(v => v.keyString === defaultKey);

        setProductVariants([{
            id: existingStdVariant?.id || `var-${Date.now()}-std`, 
            combination: defaultCombination,
            keyString: defaultKey,
            sku: existingStdVariant?.sku || "", 
            stock: existingStdVariant?.stock || "0", 
            price: existingStdVariant?.price || ""  
        }]);
        toast({ title: "Bilgi", description: "Geçerli seçenek bulunmadığı için standart bir varyant oluşturuldu. Lütfen stok ve diğer bilgileri girin.", variant: "default" });
        return;
    }

    const optionArrays = validOptions.map(opt => {
        const values = opt.values.split(',').map(v => v.trim()).filter(v => v !== "");
        return values.map(val => ({ optionName: opt.name.trim(), optionValue: val }));
    });

    const combinationsRaw = cartesian(...optionArrays);

    if (combinationsRaw.length === 0 || (combinationsRaw.length === 1 && combinationsRaw[0].length === 0)) {
        toast({ title: "Hata", description: "Varyant kombinasyonları oluşturulamadı. Lütfen seçenek adlarını ve değerlerini kontrol edin.", variant: "destructive" });
        setProductVariants([]); 
        return;
    }

    const newVariants = combinationsRaw.map((comboSet, index) => {
        const currentCombination: VariantCombination[] = Array.isArray(comboSet) ? comboSet : [];
        
        const keyString = currentCombination.map(c => `${c.optionName}:${c.optionValue}`).sort((a, b) => a.localeCompare(b)).join('_');

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
    } else if (validOptions.length > 0) { 
        toast({ title: "Bilgi", description: "Varyant oluşturulamadı. Lütfen seçenek değerlerini kontrol edin." });
    }
  };

  const handleVariantInputChange = (variantId: string | number, field: keyof Omit<ProductVariantInput, 'id' | 'combination' | 'keyString'>, value: string) => {
    setProductVariants(prev =>
      prev.map(variant =>
        variant.id === variantId ? { ...variant, [field]: value } : variant
      )
    );
  };

  const removeVariant = (variantId: string | number) => {
    setProductVariants(prev => prev.filter(v => v.id !== variantId));
    toast({ title: "Bilgi", description: "Varyant listeden kaldırıldı. Kaydedildiğinde veritabanından silinecek (eğer siparişlerde kullanılmıyorsa).", variant: "default" });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!product) {
         toast({ title: "Hata", description: "Ürün bilgisi mevcut değil.", variant: "destructive" });
         return;
    }

    if (!formData.title.trim()) {
      toast({ title: "Eksik Bilgi", description: "Lütfen ürün adını girin.", variant: "destructive" })
      return
    }
    const mainPrice = parseFloat(formData.price);
    if (isNaN(mainPrice) || mainPrice < 0) {
        toast({ title: "Geçersiz Fiyat", description: "Lütfen geçerli bir ana ürün fiyatı girin.", variant: "destructive" });
        return;
    }

    if (productVariants.length === 0) {
        toast({ title: "Eksik Bilgi", description: "Lütfen en az bir ürün varyantı oluşturun (gerekirse 'Standart Varyant Ekle' ile) ve stok girin.", variant: "destructive" });
        return;
    }

    const invalidStockVariant = productVariants.find(v => v.stock.trim() === "" || isNaN(parseInt(v.stock)) || parseInt(v.stock) < 0);
    if (invalidStockVariant) {
        const variantName = invalidStockVariant.combination.map(c=>c.optionValue).join(' / ') || "Standart";
        toast({ title: "Geçersiz Stok", description: `Lütfen "${variantName}" varyantı için geçerli bir stok miktarı (0 veya üzeri) girin.`, variant: "destructive" });
        return;
    }
     const invalidPriceVariant = productVariants.find(v => v.price.trim() !== "" && isNaN(parseFloat(v.price)));
     if (invalidPriceVariant) {
         const variantName = invalidPriceVariant.combination.map(c=>c.optionValue).join(' / ') || "Standart";
        toast({ title: "Geçersiz Fiyat", description: `Lütfen "${variantName}" varyantı için geçerli bir fiyat girin veya boş bırakın.`, variant: "destructive" });
        return;
     }

    setSaving(true)
    const submissionFormData = new FormData()

    submissionFormData.append("title", formData.title)
    submissionFormData.append("description", formData.description)
    submissionFormData.append("price", mainPrice.toString()) 

    if (formData.categoryId) {
      submissionFormData.append("categoryId", formData.categoryId)
    }
    submissionFormData.append("published", formData.published.toString())
    submissionFormData.append("isFavorite", formData.isFavorite.toString())

    imageFiles.forEach((file) => {
      submissionFormData.append("images", file)
    })

    submissionFormData.append("existingImageIds", JSON.stringify(existingImageIds));


    const optionsToSend = productOptions
      .filter(opt => opt.name.trim() !== "") 
      .map(opt => {
        const values = opt.values.split(",").map(v => v.trim()).filter(v => v !== "");
        return {
            id: typeof opt.id === 'number' ? opt.id : undefined, // Mevcut seçenekler için id'yi gönder
            name: opt.name.trim(),
            values: values,
        };
      })
      .filter(opt => opt.values.length > 0); 

    submissionFormData.append("options", JSON.stringify(optionsToSend));


    const variantsToSend = productVariants
      .map(v => ({
        // Eğer id bir sayı ise mevcut bir varyantı temsil eder, string ise yenidir.
        // Backend'in bunu doğru işlemesi gerekecek.
        id: typeof v.id === 'number' ? v.id : undefined, // Mevcut varyantlar için id'yi gönder
        combination: v.combination,
        stock: parseInt(v.stock), 
        price: v.price.trim() !== "" ? parseFloat(v.price) : null, 
        sku: v.sku.trim() || undefined, 
      }));

    submissionFormData.append("variants", JSON.stringify(variantsToSend));


    try {
      await updateProduct(productId, submissionFormData)

      toast({
        title: "Başarılı",
        description: "Ürün başarıyla güncellendi.",
      })

      router.push("/admin") 
    } catch (error: any) {
      console.error(`Ürün ID ${productId} güncellenirken hata:`, error)
      const errorMsg = error.response?.data?.message || error.message || "Ürün güncellenirken bir hata oluştu."

      if (errorMsg.includes("foreign key constraint") || errorMsg.includes("Cannot delete") || errorMsg.includes("referenced in existing orders")) {
           toast({
                title: "Güncelleme Hatası",
                description: "Ürün güncellenemedi. Mevcut siparişlerde kullanılan seçenek veya varyantları tamamen silmeye çalışıyor olabilirsiniz. Lütfen stoklarını '0' olarak güncelleyin veya ürünü yayından kaldırın.",
                variant: "destructive",
           });
      } else {
           toast({
                title: "Hata",
                description: errorMsg,
                variant: "destructive",
           });
      }

    } finally {
      setSaving(false)
    }
  }

  if (authIsLoading || !isAuthenticated || !isAdmin) {
    return <div className="container mx-auto px-4 py-8 text-center">Yetki kontrol ediliyor veya yetkisiz erişim...</div>
  }

  if (isNaN(productId) || productId <= 0) {
       return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold">Geçersiz Ürün ID</h1>
                  <Button variant="outline" onClick={() => router.push("/admin")}>Geri Dön</Button>
                </div>
                <p className="text-red-500">Düzenlemek için geçerli bir ürün ID'si belirtilmedi.</p>
            </div>
       );
  }


  if (dataLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Ürün Düzenle</h1>
           <Button variant="outline" onClick={() => router.push("/admin")}>Geri Dön</Button>
        </div>
        <div className="h-96 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Ürün bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Ürün Bulunamadı</h1>
          <Button variant="outline" onClick={() => router.push("/admin")}>
            Geri Dön
          </Button>
        </div>
        <p className="text-red-500">Belirtilen ID ile ürün bulunamadı veya bir hata oluştu.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Ürün Düzenle: {product.title}</h1>
        <Button variant="outline" onClick={() => router.push("/admin")}>
          Geri Dön
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Ürün Bilgileri</CardTitle>
            <CardDescription>Ürün bilgilerini güncelleyin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Ürün Adı *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ürün adını girin"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Ana Fiyat (TL) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                   <p className="text-xs text-muted-foreground dark:text-gray-400">Varyantların kendi fiyatı yoksa bu fiyat kullanılır.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select value={formData.categoryId} onValueChange={handleSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Ürün Açıklaması</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Ürün açıklamasını girin"
                    rows={5}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <Label htmlFor="published">Ürünü Yayınla</Label>
                  </div>
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => handleToggleChange("published", checked)}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2 pt-2">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Label htmlFor="isFavorite">Favori Ürün Yap</Label>
                  </div>
                  <Switch
                    id="isFavorite"
                    checked={formData.isFavorite}
                    onCheckedChange={(checked) => handleToggleChange("isFavorite", checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="images">Ürün Görselleri</Label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                    <Input
                      id="images"
                      name="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor="images"
                      className="relative cursor-pointer rounded-md bg-white dark:bg-slate-800 font-semibold text-pink-600 dark:text-pink-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-pink-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-900 hover:text-pink-500 flex flex-col items-center justify-center py-8"
                    >
                      <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400">
                        <span>Yeni Görsel Yükle</span>
                         { imagePreviews.length > 0 ? <p className="pl-1">(Mevcut görseller korunur veya silinebilir)</p> :  <p className="pl-1">veya sürükleyip bırakın</p> }
                      </div>
                      <p className="text-xs leading-5 text-gray-600 dark:text-gray-400">PNG, JPG, GIF (max. 5MB)</p>
                    </label>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {imagePreviews.map((previewUrl, index) => {
                         const existingImagesCount = existingImageIds.length;
                         const isExisting = index < existingImagesCount;
                         const imageUrl = previewUrl;

                         return (
                            <div key={index} className="relative aspect-square overflow-hidden rounded-md group">
                              <img
                                src={imageUrl || "/placeholder.svg"}
                                alt={`Önizleme ${index + 1}`}
                                className="object-cover w-full h-full"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 rounded-full h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(index)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                         );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <CardTitle>Ürün Seçenekleri (Varyasyonlar İçin)</CardTitle>
              <CardDescription>
                 Ürününüzün farklı varyasyonları için seçenek türleri (örneğin: Renk, Boyut) ve değerlerini girin. Varyantlar aşağıdaki tablonun altında otomatik oluşturulur.
              </CardDescription>
              {productOptions.map((option) => (
                <div key={option.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border dark:border-gray-700 rounded-md relative items-center">
                  <div className="space-y-1 md:col-span-4">
                    <Label htmlFor={`option-name-${option.id}`}>Seçenek Adı</Label>
                    <Input
                      id={`option-name-${option.id}`}
                      value={option.name}
                      onChange={(e) => handleOptionNameChange(option.id, e.target.value)}
                      placeholder="Örn: Renk, Boyut"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-7">
                    <Label htmlFor={`option-values-${option.id}`}>Değerler (Virgülle Ayırın)</Label>
                    <Input
                      id={`option-values-${option.id}`}
                      value={option.values}
                      onChange={(e) => handleOptionValuesChange(option.id, e.target.value)}
                      placeholder="Örn: Kırmızı, Mavi, Yeşil"
                    />
                  </div>
                  <div className="md:col-span-1 flex justify-end md:justify-center">
                     <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 mt-auto" onClick={() => removeProductOptionInput(option.id)}>
                        <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addProductOptionInput} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Seçenek Türü Ekle
              </Button>

               <div className="flex justify-end mt-2">
                    <Button
                        type="button"
                        onClick={generateVariants}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Sparkles className="mr-2 h-4 w-4" />
                        {productOptions.length === 0 ? "Standart Varyant Ekle/Güncelle" : "Varyantları Oluştur/Güncelle"}
                    </Button>
                </div>
            </div>

            {productVariants.length > 0 && (
              <div className="space-y-4 pt-6 border-t dark:border-gray-700">
                <CardTitle>Ürün Varyantları ve Stokları</CardTitle>
                 <CardDescription>Oluşturulan varyantların SKU, özel fiyat ve stok bilgilerini girin. Fiyat boş bırakılırsa ana ürün fiyatı kullanılır.</CardDescription>
                <div className="overflow-x-auto rounded-md border dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px]">Varyant</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">SKU</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">Fiyat (Ops.)</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">Stok *</th>
                        <th className="px-1 py-3 text-center w-[50px]"></th> 
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
                              placeholder="SKU123" className="text-sm"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number" step="0.01" min="0" value={variant.price}
                              onChange={(e) => handleVariantInputChange(variant.id, 'price', e.target.value)}
                              placeholder={formData.price || "Ana Fiyat"} className="text-sm"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number" min="0" step="1" value={variant.stock}
                              onChange={(e) => handleVariantInputChange(variant.id, 'stock', e.target.value)}
                              placeholder="0" required className="text-sm"
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
            <Button variant="outline" type="button" onClick={() => router.push("/admin")}>
              İptal
            </Button>
            <Button
              type="submit"
              className="bg-pink-600 hover:bg-pink-700"
              disabled={
                saving ||
                productVariants.length === 0 || 
                productVariants.some(v => v.stock.trim() === "" || isNaN(parseInt(v.stock)) || parseInt(v.stock) < 0) ||
                productVariants.some(v => v.price.trim() !== "" && isNaN(parseFloat(v.price))) || 
                !formData.title.trim() ||
                !formData.price.trim() || parseFloat(formData.price) < 0
              }
            >
              {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}