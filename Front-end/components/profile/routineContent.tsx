"use client"

import { Trash2, Sun, Moon, Edit } from "lucide-react"
import { Routine } from "@/types/routine"
import { useTranslations } from "next-intl"
import { getProducts } from "@/lib/api"
import { Link } from "@/i18n/navigation"
import { toLowerCaseAndReplaceSpacesWithHyphens } from "@/lib/string-utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { useRoutineContentState } from "@/lib/hooks/use-routine-content-state"
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { getProtectedRoute } from "@/lib/protected-route";

export default function RoutineContent({
  filteredRoutines,
}: {
  filteredRoutines: Routine[]
}) {
  const productsAvailable = getProducts();
  const { isLoggedIn } = useAuthSession();
  const t = useTranslations("RoutineContent")
  const {
    deletingRoutineId,
    setDeletingRoutineId,
    routines,
    handleDeleteRoutine,
  } = useRoutineContentState({
    filteredRoutines,
    deletedLabel: t("deleted"),
  })

  return (
    <div className="flex flex-col gap-6">
      {routines.map((routine) => (
        <div
          key={routine.id}
          className="relative group bg-white border border-gray-200 
                     rounded-2xl p-5 sm:p-6 shadow-sm
                     hover:shadow-md transition-all duration-200"
        >
          <Link
            href={`/routine/detail/${routine.id}`}
            aria-label={routine.name}
            className="absolute inset-0 z-0 rounded-2xl"
          />

          <div className="flex justify-between items-start gap-4">

            <div className="flex flex-col gap-2 flex-1">

              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full font-medium uppercase
                    ${routine.type.toLowerCase() === "am"
                      ? "bg-yellow-50 text-amber-700 border border-amber-200"
                      : "bg-purple-50 text-purple-700 border border-purple-200"}
                  `}
                >
                  {routine.type.toLowerCase() === "am" ? (
                    <Sun size={14} className="stroke-amber-500" />
                  ) : (
                    <Moon size={14} className="stroke-purple-500" />
                  )}
                  {routine.type.toUpperCase()}
                </span>

                <span className="text-xs text-gray-400">
                  {routine.steps.length} {t("steps")}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {routine.name}
              </h2>

              <p className="text-sm text-gray-500">
                {routine.description}
              </p>

            </div>

            <div className="relative z-20 flex items-center self-start gap-1">
              <Link href={getProtectedRoute(`/routine/editar?id=${routine.id}`, isLoggedIn)}>
                <button
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md transition text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                  title={t("editButton")}
                  disabled={!isLoggedIn}
                >
                  <Edit size={18} />
                </button>
              </Link>

              <Dialog open={deletingRoutineId === routine.id} onOpenChange={(open) => {
                if (!open) setDeletingRoutineId(null)
                else setDeletingRoutineId(routine.id)
              }}>
                <DialogTrigger asChild>
                  <button
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md transition text-gray-400 hover:bg-red-50 hover:text-red-500"
                    title={t("deleteDialog.title")}
                    disabled={!isLoggedIn}
                  >
                    <Trash2 size={18} />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
                    <DialogDescription>
                      {t("deleteDialog.description")} <span className="font-semibold text-gray-900">"{routine.name}"</span>{t("deleteDialog.descriptionWarning")}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeletingRoutineId(null)}
                    >
                      {t("deleteDialog.cancel")}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteRoutine(routine.id)}
                    >
                      {t("deleteDialog.delete")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

          </div>

          <div className="relative z-10 mt-4 flex flex-wrap gap-3">


            {routine.steps.map((step) => {
              const product = productsAvailable.find((prod) => prod.id === step.productId)
              const productHref = product
                ? `/descubrir/${toLowerCaseAndReplaceSpacesWithHyphens(product.name)}`
                : null

              return (
                <Link
                  key={step.id}
                  href={productHref ?? "#"}
                  onClick={(event) => {
                    if (!productHref) {
                      event.preventDefault()
                    }
                  }}
                  className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 transition hover:border-rose-200 hover:bg-rose-50"
                >
                  <div className="w-6 h-6 rounded-full bg-rose-100 
                                  text-rose-600 text-xs flex items-center 
                                  justify-center font-semibold">
                    {step.order}
                  </div>

                  <span className="text-xs sm:text-sm text-gray-700">
                    {product?.name || "Producto no encontrado"}
                  </span>
                </Link>
              )
            })}

          </div >

        </div >
      ))}
    </div >
  )
}