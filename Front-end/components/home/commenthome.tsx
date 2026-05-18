"use client"

import { Check } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { useLocaleDateFormatter } from "@/lib/hooks/use-locale-date-formatter"
import { useState, useEffect } from "react"
import RoutineCard, { RoutineCardPost } from "@/components/community/RoutineCard"
import { fetchRoutines, fetchUsers } from "@/lib/api-client"

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

    const [routineCards, setRoutineCards] = useState<RoutineCardPost[]>([])

    useEffect(() => {
        let ignore = false

        const loadData = async () => {
            try {
                const data = await fetchRoutines(1, locale, "newest")
                const routines = data.routines || []
                const users = await fetchUsers()
                const usersMap: Record<string, any> = {}
                for (const u of users) {
                    const uid = u._id || u.id
                    if (uid) usersMap[uid] = u
                }

                const cards = routines
                    .map((routine: any) => {
                        const user = usersMap[routine.userId]
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
                    .sort((left: any, right: any) => right.publishedAtTs - left.publishedAtTs)
                    .slice(0, 3)
                    .map(({ publishedAtTs, ...card }: any) => card)

                if (!ignore) setRoutineCards(cards)
            } catch {
                if (ignore) return
            }
        }

        loadData()
        return () => { ignore = true }
    }, [locale, publishedDateFormatter, tSkin])

    return (

        <div className="flex flex-col bg-muted/50">

            <div className="max-w-7xl mx-auto px-5 mt-8 mb-10 grid md:grid-cols-2 gap-8 md:gap-14 items-start">

                <div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                        {t("title")}
                    </h2>
                    <p className="text-muted-foreground mb-8 max-w-lg">
                        {t("description")}
                    </p>
                    <ul className="space-y-5 mb-8 py-5">
                        <li className="flex items-center gap-3 text-muted-foreground">
                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                                <Check size={14} className="text-secondary-foreground" />
                            </div>
                            <span>{t("feature1")}</span>
                        </li>
                        <li className="flex items-center gap-3 text-muted-foreground">
                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                                <Check size={14} className="text-secondary-foreground" />
                            </div>
                            <span>{t("feature2")}</span>
                        </li>
                        <li className="flex items-center gap-3 text-muted-foreground">
                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                                <Check size={14} className="text-secondary-foreground" />
                            </div>
                            <span>{t("feature3")}</span>
                        </li>
                    </ul>
                    <Link href="/community" className="inline-flex bg-foreground text-background px-6 py-3 rounded-lg font-medium hover:opacity-90 transition">
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


            <div className="min-h-foreground flex items-center bg-primary mt-5 py-10 sm:py-16 lg:py-20">

                <div className="max-w-4xl mx-auto px-6 text-center w-full">

                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-primary-foreground mb-6 md:mb-8 leading-tight">
                        {t("ctaTitle")}
                    </h2>

                    <p className="text-primary-foreground text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 lg:mb-12 max-w-2xl mx-auto">
                        {t("ctaDescription")}
                    </p>

                    <div className="flex flex-col py-10 sm:flex-row justify-center items-center gap-4">

                        <input
                            type="email"
                            placeholder={t("emailPlaceholder")}
                            className="w-full max-w-md px-4 sm:px-8 py-3 bg-card rounded-full border-none outline-none text-muted-foreground shadow-md"
                        />

                        <button className="flex p-5 bg-foreground text-background px-12 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg ">
                            {t("joinNow")}
                        </button>

                    </div>

                </div>

            </div>

        </div>
    )
}