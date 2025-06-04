"use client"

import Image from "next/image"
import Link from "next/link"
import { Globe, FileText, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PressPage() {

  // Haber linkleri ve başlıkları
  const newsLinks = [
    { title: "Kirpik Okulu Kadınlara Yeni İş İmkanı Sunuyor - Hürriyet", url: "https://www.hurriyet.com.tr/yerel-haberler/istanbul/kirpik-okulu-kadinlara-yeni-is-imkani-sunuyor-40853699" },
    { title: "Başakşehir'de Kadın Girişimci Sohbetleri Yapıldı - Milliyet", url: "https://www.milliyet.com.tr/yerel-haberler/istanbul/merkez/basaksehirde-kadin-girisimci-sohbetleri-yapila-6347727" },
    { title: "Hayat Güzeldir Programı (Show Türk) - 17 Kasım 2019", url: "https://www.showturk.com.tr/programlar/video/hayat-guzeldir-170-bolum--17-kasim-2019/662417" },
    { title: "Kirpikleriyle Ödül Aldı - CNN Türk", url: "https://www.cnnturk.com/yurttan-haberler/istanbul/kirpikleriyle-odul-aldi" },
    { title: "Kirpikte Altın Buluş - Mynet", url: "https://www.mynet.com/kirpikte-altin-bulus-110105502923" },
    { title: "Başakşehir'de Kadın Girişimci Sohbetleri - Başakşehir Belediyesi", url: "https://www.basaksehir.bel.tr/basaksehir-de-kadin-girisimci-sohbetleri" },
    { title: "Kirpikte Altın Buluş - İHA", url: "https://www.iha.com.tr/haber-kirpikte-altin-bulus-785709/" },
    { title: "Kirpik Okulu Kadınlara Yeni İş İmkanı Sunuyor - DHA", url: "https://www.dha.com.tr/saglikyasam/kirpik-okulu-kadinlara-yeni-is-imkani-sunuyor/haber-1582572" },
    { title: "Türkiye Gazetesi Haberi", url: "https://m.turkiyegazetesi.com.tr/gundem/632033.aspx" },
    { title: "Kirpik Yaptırayım Derken Gözünüzden Olmayın - Sözcü", url: "https://www.sozcu.com.tr/hayatim/guzellik/kirpik-yaptirayim-derken-gozunuzden-olmayin/" },
    { title: "Kirpikte Altın Buluş - Yeni Akit", url: "https://www.yeniakit.com.tr/haber/kirpikte-altin-bulus-805943.html" },
    { title: "Dünyada Bir İlk: Kirpik Tasarım Pergeli - Mag For Her", url: "https://www.magforher.com/dunyada-bir-ilk-kirpik-tasarim-pergeli/" },
    { title: "Dünyada Bir İlk: Kirpik Tasarım Pergeli - Önce Vatan", url: "https://www.oncevatan.com.tr/magazin/dunyada-bir-ilk-kirpik-tasarim-pergeli-h191056.html" },
    { title: "Genç Tasarımcıdan Dünyada Bir İlk: Kirpik Tasarım Pergeli - Business World Global", url: "https://www.businessworldglobal.com/genc-tasarimcidan-dunyada-bir-ilk-kirpik-tasarim-pergeli/" },
    { title: "Dünyada Bir İlk: Kirpik Tasarım Pergeli - Gazete Birlik", url: "https://www.gazetebirlik.com/haber/dunyada-bir-ilk-kirpik-tasarim-pergeli-8002/#.Yzcfo-NYxo8.whatsapp" },
  ];

  return (
    <div className="space-y-24">
      {/* HERO BÖLÜMÜ */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <Globe className="mx-auto mb-4 h-12 w-12 text-pink-500" />
          <h1 className="text-5xl font-extrabold text-gray-800 mb-4">Basında Biz</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vizon Kirpik olarak medyada yer alış şeklimiz ve sektöre yaptığımız katkılar hakkında
            öne çıkan haberleri, röportajları ve blog yazılarını aşağıda bulabilirsiniz.
          </p>
        </div>
      </section>

      {/* HABERLER BÖLÜMÜ */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Öne Çıkan Haberler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Haber linkleri üzerinden butonları oluştur */}
          {newsLinks.map((link, index) => (
            // Her Link elementine mb-4 (margin-bottom: 1rem) sınıfını ekledik
            <Link href={link.url} key={index} target="_blank" rel="noopener noreferrer" className="mb-4 block">
              <Button
                variant="outline" // Buton stilini belirle
                // w-full zaten tam genişlik sağlıyor, p-6 paddingi artırıyor
                className="w-full text-left justify-start p-6 h-auto rounded-md shadow-md hover:bg-pink-100 transition-colors"
              >
                <FileText className="mr-3 h-5 w-5 text-pink-500" /> {/* Buton ikonunu ekle */}
                <span className="flex-1">{link.title}</span> {/* Buton metni */}
              </Button>
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}
