import Link from "next/link"
import { Youtube, Instagram, Facebook } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">İpek Kirpik Akademisi & İpek Kirpik Mağazası & İpek Kirpik Tasarımcısı.</h3>
            <p className="text-gray-300 mb-4">
              Kirpik Tasarımının Mucidiyle Tanışın:
              Eğitimde ustalık, üründe kusursuzluk.
              Teknolojiyle sanatı buluşturduk.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.youtube.com/channel/UCXArujK4RenY9GJEuJWPqXA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-pink-500 transition-colors"
              >
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </a>
              <a
                href="https://www.instagram.com/vizonkirpik/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-pink-500 transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://www.facebook.com/vizonkirpik/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-pink-500 transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-pink-500 transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/urunler" className="text-gray-300 hover:text-pink-500 transition-colors">
                  Ürünler
                </Link>
              </li>
              <li>
                <Link href="/hakkinda" className="text-gray-300 hover:text-pink-500 transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-gray-300 hover:text-pink-500 transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">İletişim</h3>
            <address className="not-italic text-gray-300 space-y-2">
              <p>Küçükbakkalköy Mah. Dereboyu Cad.</p>
              <p>No:3A İçkapı No:48 Ataşehir-İstanbul</p>
              <p>Email: vizonkirpik@hotmail.com</p>
              <p>Tel: +90 534 233 57 16</p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-gray-400">
          <p>© {new Date().getFullYear()} Vizon Kirpik Tüm hakları saklıdır.</p>
          <a
            href="https://esmedd.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Made By ESMEDD
          </a>
        </div>
      </div>
    </footer>
  )
}
