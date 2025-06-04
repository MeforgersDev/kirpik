"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Award, BookOpen, Users, CheckCircle, Layers, Compass, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AcademyPage() {
  // Slayt için görseller

  const images = [
        "/akd/1.png",
        "/akd/2.png",
        "/akd/3.png",
        "/akd/4.png",
        "/akd/5.png",
        "/akd/6.png",
        "/akd/7.png",
        "/akd/8.png",
        "/akd/9.png",
        "/akd/10.png",
        "/akd/11.png",
        "/akd/12.png",
        "/akd/13.png",
        "/akd/14.png",
        "/akd/15.png",
        "/akd/16.png",
        "/akd/17.png",
        "/akd/18.png",
        "/akd/19.png",
        "/akd/20.png",
        "/akd/21.png",
        "/akd/22.png",
        "/akd/23.png",
    ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Sonraki görsele geçiş
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Önceki görsele geçiş
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Otomatik slayt geçişi
  useEffect(() => {
    const interval = setInterval(() => {
      nextImage();
    }, 5000); // Her 5 saniyede bir görsel değiştir

    return () => clearInterval(interval); // Bileşen kaldırıldığında interval'i temizle
  }, [currentImageIndex]); // currentImageIndex değiştiğinde interval'i yeniden başlat

  return (
    <div className="space-y-24">
      {/* HERO BÖLÜMÜ */}
      <section className="bg-pink-50 py-20">
        <div className="container mx-auto flex flex-col-reverse md:flex-row items-center gap-8 px-4">
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-5xl font-extrabold text-pink-600 mb-4">Vizon Kirpik Akademi</h1>
            <p className="text-lg text-gray-700 mb-6">
              Vizon kirpik olarak tek uzmanlığımız kirpiktir ve uluslararası alan dahil olmak üzere bu sektörün gelişimi için firma olarak sektöre çok büyük bir katkı sağlamaktayız.
            </p>
          </div>
          <div className="md:w-1/2 relative">
            {/* Slayt container'ı */}
            <div className="relative w-full h-auto rounded-xl shadow-lg overflow-hidden">
              <Image
                src={images[currentImageIndex]}
                alt={`Akademi Eğitim Görseli ${currentImageIndex + 1}`}
                width={600}
                height={400}
                className="object-cover w-full h-full transition-opacity duration-500 ease-in-out"
                onError={(e) => { e.target.src = "https://placehold.co/600x400/CCCCCC/000000?text=Görsel+Yüklenemedi"; }}
              />
              {/* Slayt Navigasyon Düğmeleri */}
              <Button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 text-pink-600 p-2 rounded-full shadow-md z-10"
                aria-label="Önceki Görsel"
              >
                <ChevronLeft size={24} />
              </Button>
              <Button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 text-pink-600 p-2 rounded-full shadow-md z-10"
                aria-label="Sonraki Görsel"
              >
                <ChevronRight size={24} />
              </Button>
            </div>
            {/* Slayt Göstergeleri (noktalar) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full ${
                    currentImageIndex === index ? "bg-pink-600" : "bg-gray-300"
                  } transition-colors duration-300`}
                  aria-label={`Görsel ${index + 1}'e git`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EĞİTİM YAKLAŞIMIMIZ */}
      <section className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">Eğitim Yaklaşımımız</h2>
        <div className="max-w-3xl mx-auto space-y-6 text-gray-600 text-left">
          <p>
            <Layers className="inline h-6 w-6 text-pink-500 mr-2 align-middle" />
            Öğrencilerimizin bizden alacağı eğitim diğer öğretim sistemlerinden farklıdır. Normalde kolaydan zora olan sistemden farklı olarak <strong className="text-gray-800">zordan kolaya doğru olan geçişlerle pratik aktarımı sağlarız</strong> ve bu sayede öğrenci bizden mezun olduktan sonra çok kısa bir pratik ve ödev ile müşteri alabilecek hala gelmektedir.
          </p>
          <p>
            <Users className="inline h-6 w-6 text-pink-500 mr-2 align-middle" />
            İpek kirpik eğitimini her yaştan kişiler alabilir. Kurumumuzca istenilen kriter yetenek değil <strong className="text-gray-800">istikrardır</strong>, eğer elinizde titreme sorunu varsa bu işi öğrenmeniz biraz daha zor olabilir.
          </p>
          <p>
            <BookOpen className="inline h-6 w-6 text-pink-500 mr-2 align-middle" />
            Eğitim esnasında kişiye özel psikoloji yöntemleri ile aktarım sağlanır, bu sayede eğitimden alınan verim maksimum düzeye ulaşır. İster grup eğitimi olsun ister özel eğitim olsun öğrencilerimiz ile her zaman <strong className="text-gray-800">bire bir ilgilenerek</strong> bilgi aktarımı yapmaktayız. Eğitim içeriğinde aktarılan tüm bilgiler <strong className="text-gray-800">kitapçıklar üzerinden</strong> takip edilerek aktarılır.
          </p>
        </div>
      </section>

      {/* MÜFREDAT & ÖZELLİKLER */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Müfredat ve İçerikler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-gray-700">
            <div className="space-y-6">
              <p>
                <CheckCircle className="inline h-5 w-5 text-pink-500 mr-2 align-middle" />
                <strong className="text-gray-800">Klasik & Volume sistemlerine</strong> dair tüm içerik tek seferde verilir ve içeriğe <strong className="text-gray-800">kirpik laminasyon</strong> eğitimin de dahildir.
              </p>
              <p>
                <Compass className="inline h-5 w-5 text-pink-500 mr-2 align-middle" />
                Kirpik tasarım eğitim müfredatımız dünyada hiçbir kurumda olmayan kirpik tasarım pergeli diğer adı <strong className="text-gray-800">(ALTIN ORAN KİRPİK)</strong> üzerinden verilir ve bu ürünün buluşu firma kurucumuz olan <strong className="text-gray-800">Kübra İnce'ye</strong> aittir.
              </p>
              <p>
                <Compass className="inline h-5 w-5 text-pink-500 mr-2 align-middle" />
                Kirpik tasarım pergeli ile öğrencilerimiz bu işe yıllarını harcamadan çok kolay bir şekilde <strong className="text-gray-800">kişiye özel kirpik modeli</strong> çıkarabilmekte ve mesleklerine prestij katabilmektedirler.
              </p>
            </div>
            <div className="space-y-6">
              <p>
                <Award className="inline h-5 w-5 text-pink-500 mr-2 align-middle" />
                Vizon kirpikten aldığınız eğitim <strong className="text-gray-800">Euro pass sistemine kayıtlıdır</strong> ve <strong className="text-gray-800">uluslararası geçerliliğe</strong> sahiptir.
              </p>
              <p>
                <Award className="inline h-5 w-5 text-pink-500 mr-2 align-middle" />
                Eğitim sonrasında ipek kirpik ve kirpik laminasyon işlemlerinde kullanılan tüm malzemeleri öğrencilerimiz bizden <strong className="text-gray-800">%10 indirimli</strong> olarak temin edilebilmektedir.
              </p>
              <p>
                <Star className="inline h-5 w-5 text-pink-500 mr-2 align-middle" />
                Kurslarımızdan sonra öğrencilerimize her zaman bizden <strong className="text-gray-800">danışmanlık alabilir</strong> ve <strong className="text-gray-800">ödevlerle desteklenir</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EĞİTİM AŞAMALARI */}
      <section className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">Eğitim Aşamaları</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { title: "Başlangıç (EXPERT)", desc: "Temel teknikler, zordan kolaya geçiş." },
            { title: "İleri Seviye (MASTER)", desc: "Uygulamalı vaka çalışmaları ve sınav." },
            { title: "Öğretici (CHAMPION)", desc: "Eğitmenlik becerileri ve müfredat hazırlama." },
          ].map((lvl) => (
            <div key={lvl.title} className="p-6 border rounded-xl hover:shadow-lg transition">
              <h3 className="text-2xl font-semibold mb-2 text-pink-600">{lvl.title}</h3>
              <p className="text-gray-600">{lvl.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 max-w-3xl mx-auto text-gray-600 text-left">
            <p>
            Başlangıç seviyesini geçen öğrenciler master eğitime hak kazanır ve master eğitim sürecini tamamlayan öğrenciler öğretici eğitimine hak kazanmaktadır.
            </p>
            <p className="mt-4">
            Bir sonrası kademeye geçmeden önce öğrenci yazılı ve pratiksel olarak bir yeterlilik sınavına tâbi tutulur ve başarı sağlanırsa bir sonraki aşamaya geçilebilir. Başlangıç eğitimlerimiz için her ay düzenli olarak kontenjan açılmaktadır. Eğitimlerimiz kişisel isteklere bağlı olarak birebir ya da küçük gruplar halinde düzenlenmektedir.
            </p>
        </div>
      </section>

      {/* BAŞARI GARANTİSİ */}
        <section className="container mx-auto px-4 text-center py-12 bg-pink-100 rounded-xl">
        <h2 className="text-3xl font-bold text-pink-700 mb-4">Vizon Kirpik Öğrencisi Olmak Demek...</h2>
        <p className="text-2xl font-semibold text-gray-800">
          <CheckCircle className="inline h-8 w-8 text-green-600 mr-3 align-middle" />
          Başarı Garantisi Demektir!
        </p>
      </section>

    </div>
  )
}
