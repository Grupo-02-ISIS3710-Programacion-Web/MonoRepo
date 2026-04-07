"use client"

import { ArrowRight } from "lucide-react"
import { getProducts } from "@/lib/api"
import CommentHome from "@/components/home/commenthome"
import SeccionInfoHome from "@/components/home/seccioInfoHome"
import { useTranslations } from "next-intl"
import { ProductCard } from "@/components/products/product-card"
import { useState } from "react"
import { Product } from "@/types/product"
import { productsFavorites } from "@/lib/favorites"
import Link from "next/link"

export default function Home() {

  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([])
  const t = useTranslations("Home")

  const products = getProducts().slice(0, 4)

  const handleFavoriteSelect = (productIndex: number) => {
    const selectedProduct = productsFavorites[productIndex]
    if (!favoriteProducts.some(product => product.id === selectedProduct.id)) {
      setFavoriteProducts([...favoriteProducts, selectedProduct])
    }
  }

  const handleFavoriteDeselect = (productIndex: number) => {
    const deselectedProduct = productsFavorites[productIndex]
    setFavoriteProducts(
      favoriteProducts.filter(product => product.id !== deselectedProduct.id)
    )
  }


  return (

    <div className="">
      {/* Informacion */}
      <div className="max-w-7xl  mx-auto py-20">
        <SeccionInfoHome />
      </div>

      {/* Productos */}
      <div className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6">

          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {t("topProducts")}
              </h2>

              <p className="text-gray-700 mt-2">
                {t("topProductsDescription")}
              </p>
            </div>


            <Link href="/descubrir" className="text-primary font-semibold flex items-center gap-2 hover:underline hover:text-secondary">
              {t("seeAllProducts")} <ArrowRight size={18} />
            </Link>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-5 ">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                productIndex={index}
                product={product}
                onFavoriteSelect={handleFavoriteSelect}
                onFavoriteDeselect={handleFavoriteDeselect}
              />
            ))}
          </div>

        </div>
      </div>

      {/* Comentarios */}
      <div>
        <CommentHome />
      </div>

    </div>

  )
}