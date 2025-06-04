"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ProductVariant } from "@/lib/api"; // ProductVariant türünü api.ts'den al

// CartItem arayüzü artık variant bazlı bilgileri içerecek
export interface CartItem {
  id: number; // Bu artık productVariantId olacak
  productId: number; // Ürünün ana ID'si (gösterim veya link için)
  productVariantId: number; // Varyantın ID'si
  title: string; // Ürünün başlığı
  variantName: string; // Varyantın adı (örn: Mavi / XL)
  price: number; // Bu varyantın sipariş anındaki fiyatı (varyant fiyatı veya ana fiyat)
  image: string; // Ürün görseli
  quantity: number;
  selectedOptions: Array<{ label: string; value: string }>; // Seçilen seçenekler (gösterim için)
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: Omit<CartItem, 'id'>) => void // item eklerken id göndermeye gerek yok
  removeFromCart: (variantId: number) => void // variantId'ye göre kaldır
  updateQuantity: (variantId: number, quantity: number) => void // variantId'ye göre miktar güncelle
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  useEffect(() => {
    const storedCart = typeof window !== "undefined" ? localStorage.getItem("cart") : null
    if (storedCart) {
      try {
        // localStorage'dan alınan veriyi CartItem arayüzüne göre parse et
        const parsedCart: CartItem[] = JSON.parse(storedCart);
        // Gerekirse burada verinin geçerliliğini kontrol edebilirsiniz
        setCartItems(parsedCart);
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
        setCartItems([])
        if (typeof window !== "undefined") {
          localStorage.removeItem("cart")
        }
      }
    }
  }, [])

  // Sepet güncellendiğinde localStorage'a kaydet
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cartItems))
    }
  }, [cartItems])

  // Yeni ürün eklerken artık variantId'ye göre kontrol yapılıyor
  const addToCart = (itemToAdd: Omit<CartItem, 'id'>) => {
    setCartItems((prevItems) => {
      // Aynı varyantın sepette olup olmadığını productVariantId ile kontrol et
      const existingItemIndex = prevItems.findIndex((item) => item.productVariantId === itemToAdd.productVariantId)

      if (existingItemIndex >= 0) {
        // Varyant zaten sepette varsa miktarını güncelle
        const updatedItems = [...prevItems]
        const newQuantity = updatedItems[existingItemIndex].quantity + itemToAdd.quantity
        // Miktar limitini (örneğin 10) kontrol edebilirsiniz
        updatedItems[existingItemIndex].quantity = Math.min(newQuantity, 100); // Örneğin maksimum 100 adet
        return updatedItems
      } else {
        // Varyant sepette yoksa ekle. itemToAdd zaten gerekli bilgileri içeriyor,
        // sadece id olarak productVariantId'yi atıyoruz.
        const newItem: CartItem = {
            ...itemToAdd,
            id: itemToAdd.productVariantId, // CartItem'ın benzersiz ID'si olarak variant ID'yi kullan
        };
        return [...prevItems, newItem];
      }
    })
  }

  // variantId'ye göre ürünü kaldır
  const removeFromCart = (variantId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.productVariantId !== variantId))
  }

  // variantId'ye göre miktarı güncelle
  const updateQuantity = (variantId: number, quantity: number) => {
    setCartItems((prevItems) => prevItems.map((item) => (item.productVariantId === variantId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setCartItems([])
    if (typeof window !== "undefined") {
      localStorage.removeItem("cart")
    }
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}