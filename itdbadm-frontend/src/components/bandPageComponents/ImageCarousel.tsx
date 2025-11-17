import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Image,
  Button,
  cn,
  Modal,
  ModalContent,
  ModalBody,
} from "@heroui/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface CarouselProps {
  images: string[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  previewSize?: "sm" | "md" | "lg";
  className?: string;
}

const Carousel: React.FC<CarouselProps> = ({
  images,
  autoPlay = true,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true,
  previewSize = "md",
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const nextSlide = () => {
    if (isAnimating || images.length <= 1) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      setIsAnimating(false);
    }, 20);
  };

  const prevSlide = () => {
    if (isAnimating || images.length <= 1) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      setIsAnimating(false);
    }, 20);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex || images.length <= 1) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsAnimating(false);
    }, 20);
  };

  const openModal = (index: number) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextModalSlide = () => {
    if (images.length <= 1) return;
    setModalImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevModalSlide = () => {
    if (images.length <= 1) return;
    setModalImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isAnimating || images.length <= 1) return;
    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isAnimating, images.length]);

  // Preview size classes
  const previewSizeClasses = {
    sm: "w-12 h-10 sm:w-16 sm:h-12",
    md: "w-14 h-12 sm:w-20 sm:h-16",
    lg: "w-16 h-14 sm:w-24 sm:h-20",
  };

  if (!images || images.length === 0) {
    return (
      <Card className={cn("w-full max-w-4xl mx-auto", className)}>
        <CardBody className="p-0">
          <div className="w-full h-64 sm:h-80 md:h-96 bg-gray-200 dark:bg-muted flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              No images available
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card
        className={cn("w-full max-w-4xl mx-auto overflow-hidden", className)}
      >
        <CardBody className="p-0">
          {/* Main Image Container */}
          <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden bg-gray-100 dark:bg-muted">
            {/* Animated Image Container */}
            <div
              className={cn(
                "flex transition-transform duration-200 ease-in-out h-full cursor-pointer"
              )}
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              onClick={() => openModal(currentIndex)}
            >
              {images.map((image, index) => (
                <div key={index} className="w-full h-full flex-shrink-0">
                  <Image
                    src={image}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-contain transition-transform duration-200"
                    removeWrapper
                  />
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            {showControls && images.length > 1 && (
              <>
                <Button
                  isIconOnly
                  variant="flat"
                  className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/30 dark:bg-input/80 hover:bg-black/50 dark:hover:bg-input backdrop-blur-sm z-10 border-none text-white"
                  onPress={prevSlide}
                  isDisabled={isAnimating}
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <Button
                  isIconOnly
                  variant="flat"
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/30 dark:bg-input/80 hover:bg-black/50 dark:hover:bg-input backdrop-blur-sm z-10 border-none text-white"
                  onPress={nextSlide}
                  isDisabled={isAnimating}
                  size="sm"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </>
            )}

            {/* Slide Counter */}
            {images.length > 1 && (
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm backdrop-blur-sm z-10">
                {currentIndex + 1} / {images.length}
              </div>
            )}

            {/* Dot Indicators */}
            {showIndicators && images.length > 1 && (
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2 z-10">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    disabled={isAnimating}
                    className={cn(
                      "w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 border border-white",
                      index === currentIndex
                        ? "bg-white scale-110"
                        : "bg-transparent hover:bg-white/50",
                      isAnimating && "pointer-events-none"
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Image Previews - ALWAYS SHOWN even with single image */}
          <div className="p-3 sm:p-4 bg-gray-50 dark:bg-background border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-center space-x-2 sm:space-x-3 overflow-x-auto py-1 sm:py-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => images.length > 1 && goToSlide(index)}
                  disabled={isAnimating || images.length <= 1}
                  className={cn(
                    "flex-shrink-0 transition-all duration-200 overflow-hidden border-2",
                    previewSizeClasses[previewSize],
                    index === currentIndex
                      ? "border-blue-500 dark:border-blue-400 scale-105 shadow-md"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:scale-102",
                    isAnimating && "pointer-events-none opacity-100",
                    images.length <= 1 && "cursor-default hover:scale-100" // Disable hover effects for single image
                  )}
                >
                  <Image
                    src={image}
                    radius="none"
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                    removeWrapper
                  />
                </button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Modal for enlarged image */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        size="5xl"
        classNames={{
          base: "bg-transparent backdrop-blur-none shadow-none",
          wrapper: "p-4",
          body: "p-0",
        }}
        hideCloseButton
        motionProps={{
          variants: {
            enter: {
              scale: 1,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: "easeOut",
              },
            },
            exit: {
              scale: 0.9,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: "easeIn",
              },
            },
          },
        }}
      >
        <ModalContent>
          <ModalBody className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
            {/* Close Button */}
            <Button
              isIconOnly
              variant="flat"
              className="absolute top-3 right-3 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm z-50 border-none text-gray-700 dark:text-gray-300"
              onPress={closeModal}
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Modal Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  isIconOnly
                  variant="flat"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm z-50 border-none text-gray-700 dark:text-gray-300"
                  onPress={prevModalSlide}
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  isIconOnly
                  variant="flat"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm z-50 border-none text-gray-700 dark:text-gray-300"
                  onPress={nextModalSlide}
                  size="sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* Modal Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm z-50">
                {modalImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Enlarged Image */}
            <div className="w-full h-96 sm:h-[500px] flex items-center justify-center p-4">
              <Image
                src={images[modalImageIndex]}
                alt={`Slide ${modalImageIndex + 1}`}
                className="w-full h-full object-contain"
                removeWrapper
              />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Carousel;
