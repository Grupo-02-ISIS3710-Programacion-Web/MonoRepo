"use client"

import AuthRequiredCard from "@/components/auth/AuthRequiredCard"
import UserInfo from "@/components/profile/userInfo"
import RoutineContent from "@/components/profile/routineContent"
import { ProductCard } from "@/components/products/product-card"
import { Heart, Sun, SlidersHorizontal, Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getProducts } from "@/lib/api";
import { fetchRoutinesByUserId } from "@/lib/api-client";
import Link from "next/link"
import { useTranslations, useLocale } from "next-intl"
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { getProtectedRoute } from "@/lib/protected-route";
import { Routine } from "@/types/routine";
import { Product } from "@/types/product"

export default function Profile() {

    const t = useTranslations("Profile")
    const { user, isLoggedIn, isReady } = useAuthSession()
    const locale = useLocale()
    const createRoutineHref = getProtectedRoute("/routine/crear", isLoggedIn)
    const createAiRoutineHref = getProtectedRoute("/ai-routine", isLoggedIn)
    const [products, setProducts] = useState<Product[]>([])

    const [activeTab, setActiveTab] = useState("routine")
    const [searchTerm, setSearchTerm] = useState("")
    const ITEMS_PER_PAGE = 6
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
    const [inputValue, setInputValue] = useState("")
    const [routineDaily, setRoutineDaily] = useState("am")
    const [favoriteProductIds, setFavoriteProductIds] = useState<string[]>([])
    const [userRoutines, setUserRoutines] = useState<Routine[]>([])
    const [isLoadingRoutines, setIsLoadingRoutines] = useState(false)

    const tabs = [
        { id: "routine", label: t("myRoutine"), icon: Sun },
        { id: "favorites", label: t("myFavorites"), icon: Heart }
    ]

    const routine = [
        { id: "am", label: t("morning") },
        { id: "pm", label: t("evening") }


    ]

    useEffect(() => {

        const loadProducts = async () => {

            try {

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/productos`
                )

                const data = await response.json()

                console.log("PRODUCTS RESPONSE:", data)

                setProducts(data.products || data)

            } catch (error) {

                console.error("ERROR LOADING PRODUCTS:", error)
            }
        }

        loadProducts()

    }, [])

    useEffect(() => {
        if (!user) {
            setFavoriteProductIds([])
            setUserRoutines([])
            return
        }

        setFavoriteProductIds(user.favoriteProductIds)
        
        // Fetch user routines from backend
        const loadUserRoutines = async () => {
            try {
                setIsLoadingRoutines(true)
                const data = await fetchRoutinesByUserId(user.id, 1, locale)
                setUserRoutines(data.routines || [])
            } catch (error) {
                console.error("Failed to load user routines:", error)
                setUserRoutines([])
            } finally {
                setIsLoadingRoutines(false)
            }
        }

        loadUserRoutines()
    }, [user, locale])

    const favoriteProducts = useMemo(() => {
        const favoriteProductIdSet = new Set(favoriteProductIds)
        return products.filter((product) => favoriteProductIdSet.has(product.id))
    }, [favoriteProductIds, products])

    const filteredFavorites = useMemo(() => {
        return favoriteProducts.filter((product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [favoriteProducts, searchTerm])

    const filteredRoutines = useMemo(() => {
        return userRoutines.filter((routine) =>
            routine.type.toLowerCase() === routineDaily.toLowerCase()
        );
    }, [routineDaily, userRoutines]);

const handleFavoriteSelect = async (productId: string) => {

    const selectedProduct = filteredFavorites.find(
        (product) => product.id === productId
    )

    if (!selectedProduct) {
        return
    }

    setFavoriteProductIds((currentFavoriteProductIds) => {

        if (
            currentFavoriteProductIds.includes(selectedProduct.id)
        ) {
            return currentFavoriteProductIds
        }

        return [
            ...currentFavoriteProductIds,
            selectedProduct.id
        ]
    })
}

const handleFavoriteDeselect = async (productId: string) => {

    setFavoriteProductIds((currentFavoriteProductIds) =>
        currentFavoriteProductIds.filter(
            (currentProductId) => currentProductId !== productId
        )
    )
}
    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE)
    }, [searchTerm])

    if (!isReady) {
        return <div className="min-h-screen bg-background" />
    }

    if (!user) {
        return <AuthRequiredCard redirectPath="/profile" />
    }

    return (
        <div>
            <div className="grid grid-cols-1 px-4 py-8 md:grid-cols-12 gap-6 md:px-8 md:py-12 min-h-screen">

                <div className="col-span-12 md:col-span-4">
                    <UserInfo
                        userId={user.id}
                        name={user.nombre}
                        city={user.ciudad}
                        skinType={user.tipoPiel}
                        reviews={user.reviewCount}
                        posts={user.createdRoutineIds.length}
                        bio={user.bio}
                        photo={user.avatarUrl}
                    />
                </div>

                <div className="flex flex-col col-span-12 md:col-span-8 h-full gap-5">

                    <div>
                        <div className="flex flex-col rounded-2xl border border-border overflow-visible h-full">



                            <div className="grid grid-cols-1 sm:grid-cols-2 sm:h-15 bg-background">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon
                                    const isActive = activeTab === tab.id

                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`relative flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition
                                            ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                                        >
                                            <Icon
                                                size={16}
                                                className={`${isActive ? "fill-current text-primary" : "text-gray-500"}`}
                                            />
                                            {tab.label}

                                            <span
                                                className={`absolute left-0 bottom-0 w-full h-0.5 rounded-full
                                                ${isActive ? "bg-primary" : "bg-gray-200"}`}
                                            />
                                        </button>
                                    )
                                })}
                            </div>



                            {activeTab === "routine" && (
                                <div className="flex flex-col lg:flex-row bg-background gap-4 items-start lg:items-center justify-between p-4 lg:px-10">

                                    <div className="flex flex-wrap rounded-2xl border border-secondary p-1 gap-2 w-full lg:w-auto">
                                        {routine.map((routin) => {
                                            const dayRoutine = routineDaily === routin.id

                                            return (
                                                <Button
                                                    key={routin.id}
                                                    className={dayRoutine
                                                        ? "text-primary-foreground"
                                                        : "bg-background text-foreground border-primary hover:bg-secondary hover:text-primary-foreground"
                                                    }
                                                    onClick={() => setRoutineDaily(routin.id)}
                                                >
                                                    {routin.label}
                                                </Button>
                                            )
                                        })}
                                    </div>

                                    <div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row">
                                        <Button asChild className="bg-background text-primary hover:bg-accent hover:underline w-full lg:w-auto">
                                            <Link href={createRoutineHref}>{t("addStep")}</Link>
                                        </Button>
                                        <Button asChild variant="outline" className="w-full lg:w-auto">
                                            <Link href={createAiRoutineHref}>{t("createWithAi")}</Link>
                                        </Button>
                                    </div>

                                </div>
                            )}



                            {activeTab === "favorites" && (
                                <div className="flex flex-col lg:flex-row bg-background gap-4 items-start lg:items-center justify-between p-4 lg:px-10">

                                    <div className="flex items-center gap-2 w-full lg:w-96">

                                        <Input
                                            type="text"
                                            placeholder={t("searchProducts")}
                                            className="w-full"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    setSearchTerm(inputValue)
                                                }
                                            }}
                                        />

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setSearchTerm(inputValue)}
                                            aria-label={t("searchProducts")}
                                        >
                                            <Search className="h-4 w-4" />
                                        </Button>

                                        <Button className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-background hover:bg-gray-100 transition" aria-label="Filtrar favoritos">
                                            <SlidersHorizontal size={18} className="text-gray-600" />
                                        </Button>

                                    </div>

                                    <Button asChild className="bg-background text-primary hover:bg-accent hover:underline w-full lg:w-auto">
                                        <Link href="/descubrir">{t("discoverMore")}</Link>
                                    </Button>

                                </div>
                            )}

                        </div>
                    </div>



                    <div className="flex-1">

                        <div className="flex-1 rounded-2xl">
                            {activeTab === "routine" && (
                                <RoutineContent filteredRoutines={filteredRoutines} />
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                            {activeTab === "favorites" &&
                                filteredFavorites
                                    .slice(0, visibleCount)
                                    .map((product, index) => (
                                        <ProductCard
                                            key={product.id}
                                            productIndex={index}
                                            product={product}
                                            isFavorite={true}
                                            onFavoriteSelect={handleFavoriteSelect}
                                            onFavoriteDeselect={handleFavoriteDeselect}
                                        />
                                    ))
                            }

                        </div>

                        {activeTab === "favorites" &&
                            visibleCount < filteredFavorites.length && (
                                <div className="flex justify-center mt-8">

                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setVisibleCount((prev) => prev + ITEMS_PER_PAGE)
                                        }
                                        className="px-8"
                                    >
                                        {t("loadMore")}
                                    </Button>

                                </div>
                            )}

                    </div>

                </div>

            </div>
        </div>
    )
}