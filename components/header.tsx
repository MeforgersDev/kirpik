"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ShoppingCart, User, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuth()
  const { cartItems } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-pink-600">
              Vizon Kirpik
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-pink-600 ${
                pathname === "/" ? "text-pink-600" : "text-gray-700"
              }`}
            >
              Ana Sayfa
            </Link>
            <Link
              href="/urunler"
              className={`text-sm font-medium transition-colors hover:text-pink-600 ${
                pathname === "/urunler" ? "text-pink-600" : "text-gray-700"
              }`}
            >
              Ürünler
            </Link>
            <Link
              href="/hakkinda"
              className={`text-sm font-medium transition-colors hover:text-pink-600 ${
                pathname === "/hakkinda" ? "text-pink-600" : "text-gray-700"
              }`}
            >
              Hakkımızda
            </Link>
            <Link
              href="/basin"
              className={`text-sm font-medium transition-colors hover:text-pink-600 ${
                pathname === "/basin" ? "text-pink-600" : "text-gray-700"
              }`}
            >
              Basında
            </Link>
            <Link
              href="/tasarimlar"
              className={`text-sm font-medium transition-colors hover:text-pink-600 ${
                pathname === "/tasarimlar" ? "text-pink-600" : "text-gray-700"
              }`}
            >
              Tasarımlarımız
            </Link>
            <Link
              href="/akademi"
              className={`text-sm font-medium transition-colors hover:text-pink-600 ${
                pathname === "/akademi" ? "text-pink-600" : "text-gray-700"
              }`}
            >
              Akademi
            </Link>
            <Link
              href="/iletisim"
              className={`text-sm font-medium transition-colors hover:text-pink-600 ${
                pathname === "/iletisim" ? "text-pink-600" : "text-gray-700"
              }`}
            >
              İletişim
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-700 hover:text-pink-600 transition-colors" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <Link href="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Giriş Yap
                </Button>
              </Link>
            )}

            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="flex justify-end p-4">
            <Button variant="ghost" size="icon" onClick={closeMenu}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex flex-col items-center space-y-6 p-8">
            <Link
              href="/"
              className={`text-lg font-medium ${pathname === "/" ? "text-pink-600" : "text-gray-700"}`}
              onClick={closeMenu}
            >
              Ana Sayfa
            </Link>
            <Link
              href="/urunler"
              className={`text-lg font-medium ${pathname === "/urunler" ? "text-pink-600" : "text-gray-700"}`}
              onClick={closeMenu}
            >
              Ürünler
            </Link>
            <Link
              href="/hakkinda"
              className={`text-lg font-medium ${pathname === "/hakkinda" ? "text-pink-600" : "text-gray-700"}`}
              onClick={closeMenu}
            >
              Hakkımızda
            </Link>
            <Link
              href="/iletisim"
              className={`text-lg font-medium ${pathname === "/iletisim" ? "text-pink-600" : "text-gray-700"}`}
              onClick={closeMenu}
            >
              İletişim
            </Link>
            {!isAuthenticated && (
              <Link href="/login" onClick={closeMenu}>
                <Button className="w-full">Giriş Yap</Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}