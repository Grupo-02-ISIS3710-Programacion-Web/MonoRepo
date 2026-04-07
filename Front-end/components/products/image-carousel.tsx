import Image from "next/image";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface ImageCarouselProps {
    imagesURL: string[];
    currentIndex: number;
    altText: string;
    onNextImage: () => void;
    onPreviousImage: () => void;
}

export default function ImageCarousel({ imagesURL, currentIndex, altText, onNextImage, onPreviousImage }: ImageCarouselProps) {
    const currentImage = imagesURL[currentIndex] || imagesURL[0];

    return (
        <div className={`flex justify-center items-center w-fit`}>
            {/* cuadro de imagen principal */}
            <div className="flex justify-center items-center w-full h-full">
                {imagesURL.length > 1 && <Button variant={"outline"} onClick={onPreviousImage} className="hover:bg-secondary mr-1 rounded-full" aria-label="Imagen anterior">
                    <ArrowLeft size={20} />
                </Button>}
                <div className="relative h-70 w-70 sm:h-80 sm:w-80">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={`${currentImage}-${currentIndex}`}
                            initial={{ opacity: 0, x: 20, scale: 0.98 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -20, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={currentImage}
                                alt={altText}
                                fill
                                unoptimized={true}
                                className="object-cover rounded-md"
                                sizes="(max-width: 640px) 280px, 320px"
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
                {imagesURL.length > 1 && <Button variant={"outline"} onClick={onNextImage} className="hover:bg-secondary ml-1 rounded-full" aria-label="Imagen siguiente">
                    <ArrowRight size={20} />
                </Button>}
            </div>
        </div>
    )
}