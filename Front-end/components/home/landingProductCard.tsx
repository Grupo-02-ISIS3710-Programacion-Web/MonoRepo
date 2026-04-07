import Image from "next/image"
import { Product } from "@/types/product"
import StarRating from "@/components/products/star-rating"
import { getTranslations } from "next-intl/server"

interface LandingProductCardProps {
  product: Product
}

export default async function LandingProductCard({ product }: LandingProductCardProps) {

  const t = await getTranslations("ProductCard")

  return (

    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col">

      <div className="bg-gray-100 rounded-lg flex items-center justify-center h-40 mb-4">

        <Image
          src={product.image_url[0]}
          alt={product.name}
          width={120}
          height={120}
          unoptimized
          className="object-contain"
        />

      </div>

      <p className="text-xs text-gray-400 uppercase font-medium">
        {product.brand}
      </p>

      <h3 className="font-semibold text-gray-900 mt-1">
        {product.name}
      </h3>

      <div className="mt-2">
        <StarRating
          rating={product.rating}
          reviewCount={product.review_count}
          size={10}
        />
      </div>

      <button className="mt-auto w-full bg-primary text-white py-2 rounded-lg hover:bg-pink-600 transition">
        {t("viewDetails")}
      </button>

    </div>

  )
}