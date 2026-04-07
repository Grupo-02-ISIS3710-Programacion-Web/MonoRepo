"use client"

import { Check } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { getRoutines } from "@/lib/routine"
import { getUsers } from "@/lib/api"
import { useLocaleDateFormatter } from "@/lib/hooks/use-locale-date-formatter"
import { useMemo } from "react"
import RoutineCard, { RoutineCardPost } from "@/components/community/RoutineCard"

export default function CommentHome() {

    const t = useTranslations("CommentHome")
    const tSkin = useTranslations("SkinTypes")
    const tCommunity = useTranslations("CommunityPage")
    const locale = useLocale()

    const publishedDateFormatter = useLocaleDateFormatter(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })

    const routineCards = useMemo<RoutineCardPost[]>(() => {
        const routines = getRoutines()
        const users = getUsers()

        return routines
            .map((routine) => {
                const user = users.find((candidate) => candidate.id === routine.userId) ?? users[0]
                const publishedAtDate = routine.publishedAt ? new Date(routine.publishedAt) : null
                const publishedAtTs = publishedAtDate ? publishedAtDate.getTime() : 0

                return {
                    id: routine.id,
                    title: routine.name,
                    excerpt: routine.description,
                    userName: user?.name ?? "",
                    avatarUrl: user?.avatarUrl ?? "",
                    tag: tSkin(routine.skinType),
                    upvotes: routine.upvotes?.length ?? 0,
                    downvotes: routine.downvotes?.length ?? 0,
                    hasUpvoted: false,
                    hasDownvoted: false,
                    comments: routine.comments?.length ?? 0,
                    views: routine.views ?? 0,
                    publishedAt: publishedAtDate ? publishedDateFormatter.format(publishedAtDate) : "-",
                    publishedAtTs,
                }
            })
            .sort((left, right) => right.publishedAtTs - left.publishedAtTs)
            .slice(0, 3)
            .map(({ publishedAtTs, ...card }) => card)
    }, [publishedDateFormatter, tSkin])

    return (

        <div className="flex flex-col  bg-gray-50">

            <div className="max-w-7xl mx-auto px-5 mt-23 mb-24 grid md:grid-cols-2 gap-14 items-start">

                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {t("title")}
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-md">
                        {t("description")}
                    </p>
                    <ul className="space-y-5 mb-8 py-5">
                        <li className="flex items-center gap-3 text-gray-700">
                            <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center">
                                <Check size={14} className="text-pink-600" />
                            </div>
                            <span>{t("feature1")}</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-700">
                            <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center">
                                <Check size={14} className="text-pink-600" />
                            </div>
                            <span>{t("feature2")}</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-700">
                            <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center">
                                <Check size={14} className="text-pink-600" />
                            </div>
                            <span>{t("feature3")}</span>
                        </li>
                    </ul>
                    <Link href="/community" className="inline-flex bg-foreground text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition">
                        {t("visitCommunity")}
                    </Link>
                </div>



                <div className="space-y-4">
                    {routineCards.map((card) => (
                        <RoutineCard
                            key={card.id}
                            post={card}
                            size="sm"
                            showVoting={false}
                            tCommunity={tCommunity}
                        />
                    ))}
                </div>

            </div>


            <div className="min-h-foreground flex items-center bg-primary mt-5 py-20">

                <div className="max-w-4xl mx-auto px-6 text-center w-full">

                    <h2 className="text-4xl md:text-5xl font-bold text-[#1a1c2e] mb-8 leading-tight">
                        {t("ctaTitle")}
                    </h2>

                    <p className="text-white text-xl mb-12 max-w-2xl mx-auto">
                        {t("ctaDescription")}
                    </p>

                    <div className="flex flex-col py-10 sm:flex-row justify-center items-center gap-4">

                        <input
                            type="email"
                            placeholder={t("emailPlaceholder")}
                            className="w-full max-w-md px-8 py-3 bg-white rounded-full border-none outline-none text-gray-700 shadow-md"
                        />

                        <button className="flex p-5 bg-foreground text-white px-12 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg ">
                            {t("joinNow")}
                        </button>

                    </div>

                </div>

            </div>

        </div>
    )
}