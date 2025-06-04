"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { login as apiLogin, register as apiRegister } from "@/lib/api" // apiLogin ve apiRegister fonksiyonlarınızın API çağrılarını doğru yaptığından emin olun

// Kullanıcı arayüzüne role alanını ekledik
interface User {
  id: number
  name: string
  email: string
  role: "USER" | "ADMIN" // Prisma şemasındaki Role enum'ı ile eşleşmeli
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void> // API'den gelen yanıtı döndürmek yerine Promise<void> olarak bıraktık, isterseniz döndürebilirsiniz
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Tarayıcıda localStorage'dan kullanıcı bilgilerini (rol dahil) al
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null

    if (storedUser && storedToken) {
      try {
        // localStorage'dan alınan stringi JSON'a parse ederken hata olmaması için try/catch ekledik
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        // Parse hatası olursa kullanıcıyı ve token'ı temizle
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
      }
    }

    setIsLoading(false)
  }, []) // Boş dependency array, sadece component mount edildiğinde çalışmasını sağlar

  const login = async (email: string, password: string) => {
    try {
      // API'den gelen yanıtın token ve user objesini içerdiğini varsayıyoruz
      const response = await apiLogin(email, password)

      // API'den gelen kullanıcı objesini doğrudan kullan
      const userData: User = response.user; // API yanıtının user alanını kullanıyoruz

      setUser(userData)

      // Token ve kullanıcı bilgilerini (rol dahil) localStorage'a kaydet
      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(userData))

      // Başarılı giriş sonrası herhangi bir değer döndürmeye gerek yok, state güncellendi
    } catch (error) {
      console.error("Login error:", error)
      // Hata durumunda state'i temizle
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw error // Hatayı tekrar fırlat ki login formunda yakalanabilsin
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      // apiRegister fonksiyonunuzun başarılı olması durumunda bir şey döndürmediğini varsayıyoruz
      await apiRegister(name, email, password)

      // Kayıt başarılı olduktan sonra otomatik giriş yap
      // login fonksiyonu artık API'den gelen user objesini state'e kaydediyor
      await login(email, password);

    } catch (error) {
      console.error("Register error:", error)
      throw error // Hatayı tekrar fırlat ki kayıt formunda yakalanabilsin
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user, // user objesi varsa true, yoksa false
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
