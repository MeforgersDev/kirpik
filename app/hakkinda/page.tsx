"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Users, Award, CheckCircle } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="space-y-24">
      {/* HERO BÖLÜMÜ */}
      <section className="bg-pink-50 py-20">
        <div className="container mx-auto flex flex-col-reverse md:flex-row items-center gap-8 px-4">
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-5xl font-extrabold text-pink-600 mb-4">KÜBRA İNCE</h1>
            <h2 className="text-4xl font-extrabold text-pink-400 mb-4">Uluslararası Usta Kirpik Sanatçısı & Kirpik Tasarım Pergelinin Mucidi</h2>
            <p className="text-lg text-gray-700 mb-6">
              Güzellik sektörüne 2011 yılında girip 2015 yılında vizon kirpik markasını yarattı. Fransa, rusya ve Kazakistan’dan aldığı üst düzey kirpik eğitimlerinden sonra Vizon kirpik markasıyla 7 yılda elde ettiği büyük marka ivmesini, Türkiye’nin 7 bölgesinde gerçekleştirdiği eğitim turneleriyle taçlandırıp yüzlerce kadını meslek sahibi yaparak da bir ilke imza attı. Kendini uzmanlığıyla ilgili geliştirmeye devam eden Kübra ince Dünya çapında araştırmalar yaparak kirpik ekleme işlemlerinde kullanılan en iyi materyalleri ülkeye getirerek satışını yapmaya başladı ve yılın kadın girişimcisi ödülüne layık görüldü. Kişiye özel kirpik tasarımlarının dışında Kendi geliştirdiği eğitim müfredatı ile öğrencinin becerileri uygun yöntemleri bulup teknik aktarımlar yaparak sektöre kirpik uzmanları kazandırdı ve kazandırmaya devam ediyor.
              Ayrıca en iyi kirpik eğitmeni ve en iyi kirpik tasarımcısı ödüllerinin sahibi.
              Vizon kirpik kozmetik ürünler San. Tic. Ltd şirketi üzerinden satışını yaptığı ürünlerin ithalat ve ihracatını yapmaya devam ediyor.
              Sektördeki eksiklikleri tespit edip bunların geliştirilmesi ve keşiflerinin yapılması konusunda öncülük eden Kübra ince aynı zamanda kirpiğin altın oranını belirleyen kirpik tasarım pergelinin de mucidi ve en başarılı buluş alanında ödül sahibidir. Kirpik Tasarım Pergelinin satışları online mağazamızda..
            </p>
          </div>
          <div className="md:w-1/2">
            <Image
              src="/oduller.png"
              alt="Kirpik Stüdyosu"
              width={600}
              height={400}
              className="rounded-xl shadow-lg object-cover"
            />
          </div>
        </div>
      </section>

      {/* VİZYON & MİSYON */}
      <section className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">Vizyon & Misyon</h2>
        <p className="max-w-2xl mx-auto text-gray-600">
        Vizon kirpik olarak vizyonumuz güzellik sektöründeki son teknoloji donanımlarımız ve Türkiye’de Hep ilklere imza attığımız Zengin tecrübemizi titizliğimiz ve hizmetlerimizde ki ispatlanmış kalitemizle birleştirerek kendini sürekli geliştiren ve daima kalıcı çözümler üreten bir dünya markası olarak beklentilerin ötesinde müşterilerimize yaratıcı hizmet sağlamak ve öğrencilerimizi de bu yönde eğitmektir.
        Müşterilerimizin sağlığı güzelliği ve estetiği için vizon kirpik markası olarak gerekli unsurlara uygun kalitede hizmet sunmak öncelikli misyonumuzdur. Alanında uzman olan vizon kirpik salonumuz daima steril şartlarda ve güler yüzlü kadrosuyla müşteri memnuniyetini daima ön planda tutulduğu hizmeti ile hep dikkat çekmiştir. Dünya standartlarında yüksek kalite marka bağlılığı yüksek verim ve sürekli kendini geliştirme ilkesi ile vizon kirpik Türkiye güzellik ve kirpik sektöründe ivmesini sürekli yükselten bir marka olarak çalışmalarına devam etmektedir.
        </p>
      </section>

      {/* ÖZELLİKLER BÖLÜMÜ */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Neden Bizi Seçmelisiniz?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="text-center space-y-4 px-6">
              <Users className="mx-auto h-12 w-12 text-pink-500" />
              <h3 className="text-2xl font-semibold">Kaliteli Ürünler</h3>
              <p className="text-gray-600">
                Ürünlerimiz UTS kayıtlıdır (Sağlık Bakanlığı onaylıdır)
              </p>
            </div>
            <div className="text-center space-y-4 px-6">
              <Award className="mx-auto h-12 w-12 text-pink-500" />
              <h3 className="text-2xl font-semibold">Başarı Garantisi</h3>
              <p className="text-gray-600">
                Eğitim alanında öğrencilerimize uluslararası başarı garantisi vermekteyiz.
              </p>
            </div>
            <div className="text-center space-y-4 px-6">
              <CheckCircle className="mx-auto h-12 w-12 text-pink-500" />
              <h3 className="text-2xl font-semibold">Teknik Danışmanlık</h3>
              <p className="text-gray-600">
                Ücretsiz ürün kullanımı üzerine teknik danışmanlık verilmektedir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* KURUCUDAN NOT */}
      <section className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center gap-8">
        <div className="md:w-1/3 text-center">
          <Image
            src="/IMG_7264.PNG"
            alt="Kurucu"
            width={250}
            height={250}
            className="rounded-full shadow-md object-cover"
          />
        </div>
        <div className="md:w-2/3">
          <h2 className="text-3xl font-bold mb-4">Kurucunun Mesajı</h2>
          <p className="text-gray-700 mb-4">
            “Güzelliğin detaylarda gizli olduğuna inanıyorum. Kirpikler, bakışın karakteridir. 
            Yıllar içinde geliştirdiğimiz özel teknikler ve formüllerle, her hanımefendinin 
            benzersiz ve etkileyici bakışlara sahip olmasını sağlıyoruz.”
          </p>
          <p className="text-gray-700">
            – Kübra İnce, Vizon Kirpik Marka Kurucusu
          </p>
        </div>
      </section>
    </div>
  )
}
