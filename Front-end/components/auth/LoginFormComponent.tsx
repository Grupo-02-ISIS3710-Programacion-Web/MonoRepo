"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SubmitHandler, useForm } from "react-hook-form"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link, useRouter } from "@/i18n/navigation"
import Image from "next/image"
import { useAuthSession } from "@/lib/hooks/use-auth-session"

type LoginForm = {
    emailOrLogin: string
    password: string
}

export default function LoginFormComponent({ initialRedirect }: { initialRedirect?: string }) {

    const t = useTranslations("Login")
    const router = useRouter()
    const { login } = useAuthSession()

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

    const [showPassword, setShowPassword] = useState(false)
    const [authError, setAuthError] = useState<string | null>(null)

    const onSubmit: SubmitHandler<LoginForm> = (data) => {
        setAuthError(null)

        const user = login(data.emailOrLogin, data.password)
        if (!user) {
            setAuthError(t("invalidCredentials"))
            return
        }

        const redirectTo = initialRedirect || "/home"
        router.replace(redirectTo)
    }

    return (

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div className="flex justify-center">

                <Image
                    src="/skin4all_logo.svg"
                    alt="Skin4All logo"
                    width={42}
                    height={42}
                    priority
                />

            </div>

            <div className="text-center space-y-1">

                <h1 className="text-2xl font-semibold text-gray-900">
                    {t("welcome")}
                </h1>

                <p className="text-sm text-gray-500">
                    {t("subtitle")}
                </p>

            </div>

            <div className="space-y-2">

                <label className="text-xs font-medium text-gray-500 uppercase">
                    {t("usernameEmail")}
                </label>

                <div className="relative">

                    <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />

                    <Input
                        type="text"
                        placeholder="glowing.skin@example.com"
                        className="pl-10"
                        {...register("emailOrLogin", { required: t("emailRequired") })}
                    />

                </div>

                {errors.emailOrLogin && (
                    <p className="text-xs text-red-500">{errors.emailOrLogin.message}</p>
                )}

            </div>

            <div className="space-y-2">

                <div className="flex justify-between items-center">

                    <label className="text-xs font-medium text-gray-500 uppercase">
                        {t("password")}
                    </label>

                    <Link
                        href="/forgot-password"
                        className="text-xs text-pink-500 hover:underline"
                    >
                        {t("forgotPassword")}
                    </Link>

                </div>

                <div className="relative">

                    <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                    />

                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-12 rounded-xl"
                        {...register("password", {
                            required: t("passwordRequired"),
                        })}
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>

                </div>

                {errors.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                )}

            </div>

            <Button
                type="submit"
                className="w-full text-white rounded-xl py-6"
            >
                {t("login")}
            </Button>

            <p className="text-xs text-center text-gray-500">{t("demoHint")}</p>

            {authError && (
                <p className="text-xs text-red-600 text-center">{authError}</p>
            )}

            <div className="flex items-center gap-3">

                <div className="flex-1 h-px bg-gray-200" />

                <span className="text-xs text-gray-400">
                    {t("continueWith")}
                </span>

                <div className="flex-1 h-px bg-gray-200" />

            </div>

            <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl py-6"
            >
                <img src="/google.svg" alt="Google" />
            </Button>

            <p className="text-sm text-center text-gray-500">

                {t("newUser")} {" "}

                <Link
                    href="/register"
                    className="text-pink-500 font-medium hover:underline"
                >
                    {t("register")}
                </Link>

            </p>

        </form>
    )
}
