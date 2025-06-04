"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Form verisini API veya e-mail servisine gönder
    console.log({ name, email, phone, message })
    setSubmitted(true)
  }

  return (
    <div className="container mx-auto px-4 py-16 space-y-16">
      {/* BAŞLIK & ALT BAŞLIK */}
      <section className="text-center">
        <h1 className="text-5xl font-extrabold text-pink-600 mb-4">Bize Ulaşın</h1>
        <p className="text-gray-700 max-w-2xl mx-auto">
          Sorularınız, randevu talepleriniz veya iş birliği teklifleriniz için aşağıdaki formu doldurabilir,
          doğrudan iletişim bilgilerimizden bize ulaşabilirsiniz.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* İLETİŞİM BİLGİLERİ */}
        <div className="space-y-8">
          <div className="flex items-start space-x-4">
            <Mail className="h-6 w-6 text-pink-500 mt-1" />
            <div>
              <h3 className="text-xl font-semibold">E-posta</h3>
              <p className="text-gray-600">vizonkirpik@hotmail.com</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Phone className="h-6 w-6 text-pink-500 mt-1" />
            <div>
              <h3 className="text-xl font-semibold">Telefon</h3>
              <p className="text-gray-600">+90 534 233 57 16</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <MapPin className="h-6 w-6 text-pink-500 mt-1" />
            <div>
              <h3 className="text-xl font-semibold">Adres</h3>
              <p className="text-gray-600">
                Küçükbakkalköy Mah. Dereboyu Cad. No:3A İçkapı No:48<br />
                Ataşehir-İstanbul
              </p>
            </div>
          </div>
        </div>

        {/* İLETİŞİM FORMU */}
        <div>
          {submitted ? (
            <div className="bg-green-100 border border-green-300 text-green-700 p-6 rounded-lg">
              Mesajınız başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Adınız Soyadınız</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Adınız Soyadınız"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon (Opsiyonel)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+90 5XX XXX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="message">Mesajınız</Label>
                <Textarea
                  id="message"
                  placeholder="Size nasıl yardımcı olabiliriz?"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" size="lg" className="w-full bg-pink-600 hover:bg-pink-700">
                Gönder
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
