'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface CarouselSlide {
  id: number
  title: string
  subtitle: string
  description: string
  buttonText: string
  buttonLink: string
  backgroundColor: string
  textColor: string
  image?: string
}

interface CarouselProps {
  slides: CarouselSlide[]
  autoplayInterval?: number
  height?: string
}

export default function Carousel({ 
  slides, 
  autoplayInterval = 5000,
  height = "h-64 md:h-80"
}: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Pause autoplay on hover
  const [isPaused, setIsPaused] = useState(false)

  // Autoplay functionality
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, autoplayInterval)

    return () => clearInterval(timer)
  }, [slides.length, autoplayInterval, isPaused])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  if (slides.length === 0) return null

  return (
    <div 
      className="relative overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div className="flex transition-transform duration-500 ease-in-out"
           style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`min-w-full relative ${height}`}
          >
            {/* Background Image - Optimizado con Next.js Image */}
            {slide.image && (
              <>
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/20" /> {/* Optional overlay for readability if needed, matching potential previous implicit overlay or just ensuring text contrast */}
                
                {/* Content overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="space-y-4">
                      <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
                        {slide.title}
                      </h1>
                      <p className="text-lg md:text-xl text-white drop-shadow-md">
                        {slide.subtitle}
                      </p>
                      <p className="text-sm md:text-base text-white drop-shadow-md max-w-2xl mx-auto">
                        {slide.description}
                      </p>
                      <div className="pt-4">
                        <Link
                          href={slide.buttonLink}
                          className="inline-block bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-200"
                        >
                          {slide.buttonText}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {/* Fallback si no hay imagen */}
            {!slide.image && (
              <div className={`w-full h-full ${slide.backgroundColor} ${slide.textColor} flex items-center justify-center`}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <div className="space-y-4">
                    <h1 className="text-3xl md:text-5xl font-bold">
                      {slide.title}
                    </h1>
                    <p className="text-lg md:text-xl opacity-90">
                      {slide.subtitle}
                    </p>
                    <p className="text-sm md:text-base opacity-80 max-w-2xl mx-auto">
                      {slide.description}
                    </p>
                    <div className="pt-4">
                      <Link
                        href={slide.buttonLink}
                        className="inline-block bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-200"
                      >
                        {slide.buttonText}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Slide anterior"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Slide siguiente"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? 'bg-white scale-110'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {slides.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ 
              width: `${((currentSlide + 1) / slides.length) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  )
}
