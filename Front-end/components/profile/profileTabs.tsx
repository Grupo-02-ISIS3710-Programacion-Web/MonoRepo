"use client"

import { Heart, Sun, MessageSquare, SlidersHorizontal, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useTranslations } from "next-intl"

type Props = {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function ProfileTabs({ activeTab, setActiveTab }: Props) {

  const t = useTranslations("ProfileTabs")

  const [routineDaily, setRoutineDaily] = useState("am")

  const tabs = [
    { id: "routine", label: t("myRoutine"), icon: Sun },
    { id: "favorites", label: t("myFavorites"), icon: Heart },
    { id: "forum", label: t("forumPosts"), icon: MessageSquare }
  ]

  const routines = [
    { id: "am", label: t("morning") },
    { id: "pm", label: t("evening") }
  ]

  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 overflow-hidden h-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 bg-white">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition
              ${isActive ? "text-primary" : "text-gray-500 hover:text-gray-700"}
              `}
            >
              <Icon
                size={16}
                className={`${isActive ? "fill-current text-primary" : "text-gray-500"}`}
              />
              {tab.label}
              <span
                className={`absolute left-0 bottom-0 w-full h-0.5 rounded-full
                ${isActive ? "bg-primary" : "bg-gray-200"}
                `}
              />
            </button>
          )
        })}
      </div>

      {activeTab === "routine" && (
        <div className="flex flex-col lg:flex-row bg-white gap-4 items-start lg:items-center justify-between p-4 lg:px-10">
          <div className="flex flex-wrap rounded-2xl border border-secondary p-1 gap-2 w-full lg:w-auto">
            {routines.map((routine) => {
              const dayRoutine = routineDaily === routine.id
              return (
                <Button
                  key={routine.id}
                  className={
                    dayRoutine
                      ? "text-primary-foreground"
                      : "bg-white text-foreground border-primary hover:bg-secondary hover:text-primary-foreground"
                  }
                  onClick={() => setRoutineDaily(routine.id)}
                >
                  {routine.label}
                </Button>
              )
            })}
          </div>
          <Button className="bg-white text-primary hover:bg-white hover:underline w-full lg:w-auto">
            {t("addStep")}
          </Button>
        </div>
      )}

      {activeTab === "favorites" && (
        <div className="flex flex-col lg:flex-row bg-white gap-4 items-start lg:items-center justify-between p-4 lg:px-10">
          <div className="flex items-center gap-2 w-full lg:w-96">
            <Input
              type="text"
              placeholder={t("searchProducts")}
              className="w-full"
            />
            <Button variant="outline" size="icon" aria-label={t("searchProducts")}>
              <Search className="h-4 w-4" />
            </Button>
            <Button className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 transition" aria-label="Filtrar favoritos">
              <SlidersHorizontal size={18} className="text-gray-600" />
            </Button>
          </div>
          <Button className="bg-white text-primary hover:bg-white hover:underline w-full lg:w-auto">
            {t("discoverMore")}
          </Button>
        </div>
      )}
    </div>
  )
}