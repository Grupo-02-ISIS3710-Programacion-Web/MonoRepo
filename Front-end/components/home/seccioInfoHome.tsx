import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"

export default function SeccionInfoHome() {

  const t = useTranslations("SeccionInfoHome")

  return (
    <div className="grid md:grid-cols-2  items-center h-full">

      <div className="flex flex-col justify-center px-6">

        <span className="bg-secondary text-xs px-3 py-1 rounded-full font-medium text-gray-800 w-fit">
          {t("badge")}
        </span>

        <h1 className="mt-4 text-5xl font-bold leading-tight text-gray-900">
          {t("title1")} <br />
          <span className="text-primary">{t("title2")}</span> {t("title3")}
        </h1>

        <p className="mt-6 text-gray-600 max-w-lg">
          {t("description")}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">

          <Link href="/register" className="inline-flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-8 text-white shadow-md transition hover:bg-secondary">
            {t("register")}
            <ArrowRight size={18} />
          </Link>

          <Link href="/descubrir" className="inline-flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-foreground px-8 text-white shadow-md transition hover:opacity-90">
            {t("explorer")}
          </Link>

          <div className="flex w-full items-center gap-3 sm:ml-2 sm:w-auto">

            <div className="flex shrink-0 -space-x-3">
              <img src="/avatar1.png" alt="" aria-hidden="true" className="w-8 h-8 rounded-full border-2 border-white" />
              <img src="/avatar2.jpeg" alt="" aria-hidden="true" className="w-8 h-8 rounded-full border-2 border-white" />
              <img src="/avatar3.webp" alt="" aria-hidden="true" className="w-8 h-8 rounded-full border-2 border-white" />
            </div>

            <span className="min-w-0 text-sm leading-snug text-gray-600">
              <span className="font-semibold">50k+</span> {t("trusted")}
            </span>

          </div>

        </div>

      </div>

      <div className="flex justify-center items-center h-full">

        <Image
          src="https://bebeautycol.com/cdn/shop/products/image_33008b22-795b-41a9-bc5f-cbcc31a1f602_1024x1024.jpg?v=1704781533"
          alt="Productos de skincare"
          width={505}
          height={300}
          className="h-auto w-100 rounded-2xl object-cover shadow-lg sm:w-128 md:w-auto"
          unoptimized={true}
        />

      </div>

    </div>
  )
}