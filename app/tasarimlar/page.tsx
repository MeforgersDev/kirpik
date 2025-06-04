"use client"

import { useState, useEffect } from "react"
import Image from "next/image" // Assuming Next.js Image component is still desired

// Define the Design interface, now allowing for multiple images for a slider
interface Design {
  id: number
  title: string
  description: string
  images?: string[] // Optional array of images for a slider
  image?: string // Optional single image for non-slider designs
}

// ImageSlider component for displaying multiple images
const ImageSlider = ({ images, title, description }: { images: string[]; title: string; description: string }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }

  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex + 1
    )
  }

  return (
    // Main container for the slider, relative positioning for children
    // Increased height to h-[80vh] for larger display in modal
    // Added max-w-screen-lg and mx-auto to allow image to dictate width for better compatibility
    <div className="relative max-w-screen-lg mx-auto h-[80vh] overflow-hidden rounded-xl group"> {/* Adjusted height and width */}
      {/* Current image */}
      <Image
        src={images[currentImageIndex]}
        alt={`Design image ${currentImageIndex + 1}`}
        // Using layout="fill" makes the image fill its parent, and object-contain ensures it's fully visible.
        layout="fill"
        objectFit="contain" // Ensures the entire image is visible within its container
        className="transition-transform duration-300 ease-in-out"
      />

      {/* Navigation buttons - Ensure they are above the description overlay */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 z-30" // z-index increased to ensure it's on top
        aria-label="Previous image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 z-30" // z-index increased
        aria-label="Next image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Image indicators - Ensure they are above the description overlay */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2 z-30"> {/* z-index increased */}
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`h-2 w-2 rounded-full ${
              currentImageIndex === index ? "bg-white" : "bg-gray-400"
            } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500`}
            aria-label={`Go to image ${index + 1}`}
          ></button>
        ))}
      </div>

      {/* Description overlay - Appears on hover, below buttons but above image */}
      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"> {/* z-index set to be lower than buttons (z-30) but higher than image */}
        <div className="text-center px-4">
          <h3 className="text-xl font-semibold text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-200 mt-2">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

// Modal component for displaying the full design
const Modal = ({ isOpen, onClose, design }: { isOpen: boolean; onClose: () => void; design: Design | null }) => {
  // Effect to handle closing modal with 'Escape' key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    } else {
      document.removeEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !design) return null;

  return (
    // Modal overlay
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose} // Close modal when clicking outside
    >
      {/* Modal content area */}
      <div
        // max-w-fit: Allows the modal to shrink to fit the content (image)
        // max-w-[calc(100vw-2rem)]: Ensures the modal doesn't exceed viewport width minus padding
        // max-h-[95vh]: Limits modal height to 95% of viewport height
        // p-4: Padding around the content inside the modal
        className="bg-white rounded-lg shadow-xl p-4 relative w-full max-w-fit max-w-[calc(100vw-2rem)] max-h-[95vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-3xl font-bold rounded-full p-1 leading-none focus:outline-none focus:ring-2 focus:ring-pink-500"
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Modal Header */}
        <h2 className="text-3xl font-bold text-pink-600 mb-4 text-center">
          {design.title}
        </h2>

        {/* Modal Image/Slider */}
        <div className="mb-6">
          {design.images ? (
            <ImageSlider images={design.images} title={design.title} description={design.description} />
          ) : (
            // Container for single image, adjusted height to h-[80vh] and width
            // Added max-w-screen-lg and mx-auto to allow image to dictate width for better compatibility
            <div className="max-w-screen-lg mx-auto h-[80vh] relative rounded-xl overflow-hidden"> {/* Adjusted height and width */}
              <Image
                src={design.image || "https://placehold.co/800x600/cccccc/000000?text=Resim+Yok"} // Fallback placeholder for single image
                alt={design.title}
                layout="fill" // Use layout="fill" for responsive images in a container
                objectFit="contain" // Ensures the entire image is visible within its container
                className="rounded-xl"
              />
            </div>
          )}
        </div>

        {/* Modal Description */}
        <p className="text-gray-700 text-lg text-center leading-relaxed">
          {design.description}
        </p>
      </div>
    </div>
  );
};

export default function DesignsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);

  const openModal = (design: Design) => {
    setSelectedDesign(design);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDesign(null);
  };

  const designs: Design[] = [
    {
      id: 1,
      title: "Doğal görünüm",
      description: "Doğal güzelliğinizi vurgulayan hafif ve zarif kirpikler.",
      images: [
        "/dogal/1.jpg",
        "/dogal/2doga.jpg",
        "/dogal/3doga.jpg",
        "/dogal/4doga.jpg",
        "/dogal/5doga.jpg",
        "/dogal/6doga.jpg",
        "/dogal/7doga.jpg",
        "/dogal/8doga.jpg",
      ],
    },
    {
      id: 2,
      title: "Kirpik Laminasyonu",
      description: "Kirpiklerinizi kıvırarak daha dolgun ve belirgin hale getirin.",
      images: [
        "/laminasyon/1.jpg",
        "/laminasyon/2.jpg",
        "/laminasyon/3.jpg",
        "/laminasyon/4.jpg",
        "/laminasyon/5.jpg",
        "/laminasyon/6.jpg",
        "/laminasyon/7.jpg",
        "/laminasyon/8.jpg",
        "/laminasyon/9.jpg",
        "/laminasyon/10.jpg",
        "/laminasyon/11.jpg",
        "/laminasyon/12.jpg",
        "/laminasyon/13.jpg",
      ],
    },
    {
      id: 3,
      title: "Mega Volüm",
      description: "Daha dramatik ve göz alıcı bir etki için yoğun hacimli kirpikler.",
      images: [
        "/megavolum/1.jpg",
        "/megavolum/2.jpg",
        "/megavolum/3.jpg",
        "/megavolum/4.jpg",
        "/megavolum/5.jpg",
        "/megavolum/6.jpg",
        "/megavolum/7.jpg",
        "/megavolum/8.jpg",
        "/megavolum/9.jpg",
        "/megavolum/10.jpg",
        "/megavolum/11.jpg",
        "/megavolum/12.jpg",
        "/megavolum/13.jpg",
        "/megavolum/14.jpg",
        "/megavolum/15.jpg",
        "/megavolum/16.jpg",
        "/megavolum/17.jpg",
        "/megavolum/18.jpg",
        "/megavolum/19.jpg",
      ],
    },
    {
      id: 4,
      title: "L Kıvrım",
      description: "Daha dramatik ve göz alıcı bir etki için yoğun hacimli kirpikler.",
      images: [
        "/lkirpik/1.jpg",
        "/lkirpik/2.jpg",
        "/lkirpik/3.jpg",
        "/lkirpik/4.jpg",
        "/lkirpik/5.jpg",
        "/lkirpik/6.jpg",
        "/lkirpik/7.jpg",
        "/lkirpik/8.jpg",
      ],
    },
    {
      id: 5,
      title: "Orta Yoğunluk",
      description: "Daha dramatik ve göz alıcı bir etki için yoğun hacimli kirpikler.",
      images: [
        "/orta/1.jpg",
        "/orta/2.jpg",
        "/orta/3.jpg",
        "/orta/4.jpg",
        "/orta/5.jpg",
        "/orta/6.jpg",
        "/orta/7.jpg",
        "/orta/8.jpg",
        "/orta/9.jpg",
        "/orta/10.jpg",
        "/orta/11.jpg",
      ],
    },
    {
      id: 6,
      title: "Renkli Kirpik",
      description: "Daha dramatik ve göz alıcı bir etki için yoğun hacimli kirpikler.",
      images: [
        "/renkli/1.jpg",
        "/renkli/2.jpg",
        "/renkli/3.jpg",
        "/renkli/4.jpg",
        "/renkli/5.jpg",
        "/renkli/6.jpg",
        "/renkli/7.jpg",
        "/renkli/8.jpg",
        "/renkli/9.jpg",
        "/renkli/10.jpg",
        "/renkli/11.jpg",
        "/renkli/12.jpg",
        "/renkli/13.jpg",
        "/renkli/14.jpg",
        "/renkli/15.jpg",
        "/renkli/16.jpg",
        "/renkli/17.jpg",
      ],
    },
    {
      id: 7,
      title: "Stil Çalışması",
      description: "Daha dramatik ve göz alıcı bir etki için yoğun hacimli kirpikler.",
      images: [
        "/stil/1.jpg",
        "/stil/2.jpg",
        "/stil/3.jpg",
        "/stil/4.jpg",
        "/stil/5.jpg",
        "/stil/6.jpg",
        "/stil/7.jpg",
        "/stil/8.jpg",
        "/stil/9.jpg",
        "/stil/10.jpg",
        "/stil/11.jpg",
        "/stil/12.jpg",
        "/stil/13.jpg",
        "/stil/14.jpg",
      ],
    },
  ]

  return (
    <div className="container mx-auto px-4 py-16 space-y-12 font-sans">
      {/* BAŞLIK & AÇIKLAMA */}
      <section className="text-center">
        <h1 className="text-5xl font-extrabold text-pink-600 mb-4">Tasarım Galerimiz</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Uzman ellerimizden çıkan en sevilen kirpik tasarımlarımızı keşfedin.
          Farklı stillerle ilham alın, size en uygun görünümü seçin!
        </p>
      </section>

      {/* TASARIM KARTLARI */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {designs.map((design) => (
            <div
              key={design.id}
              className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300"
              onClick={() => openModal(design)} // Add onClick to open modal
            >
              {design.images ? (
                // Render ImageSlider if images array exists, passing title and description
                <ImageSlider images={design.images} title={design.title} description={design.description} />
              ) : (
                // Render single Image if only image string exists
                <Image
                  src={design.image || "https://placehold.co/400x400/cccccc/000000?text=Resim+Yok"} // Fallback placeholder
                  alt={design.title}
                  width={400}
                  height={400}
                  className="object-cover w-full h-80 transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Modal Component */}
      <Modal isOpen={isModalOpen} onClose={closeModal} design={selectedDesign} />
    </div>
  )
}
