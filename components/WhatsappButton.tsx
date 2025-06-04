import React from "react"
import { RiWhatsappFill } from "react-icons/ri";

const WhatsappButton = () => {
  return (
    <a
      href="https://api.whatsapp.com/send?phone=905342335716"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:bg-green-600"
      aria-label="WhatsApp ile iletişime geç"
    >
      <RiWhatsappFill size={28} />
    </a>
  )
}

export default WhatsappButton
