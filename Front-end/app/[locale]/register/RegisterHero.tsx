"use client";

import { useTranslations } from "next-intl";

export function RegisterHero() {
    const t = useTranslations("registro.header");

    return (
        <div className="relative overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-top"
                style={{ backgroundImage: "url(/pink-bg.png)" }}
                aria-hidden="true"
            />
            <div className="absolute inset-0 bg-linear-to-b from-white/10 via-white/55 to-white" aria-hidden="true" />
            <div className="relative flex min-h-40 items-end px-6 pb-5 pt-6 sm:min-h-44">
                <div>
                <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{t("title")}</h1>
                <p className="mt-2 max-w-md text-base text-muted-foreground sm:text-lg">{t("subtitle")}</p>
                </div>
            </div>
        </div>
    );
}