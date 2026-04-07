"use client";

import { useMemo } from "react";

export function useFormattedCommentDate(createdAt: string | undefined, locale: string) {
    return useMemo(() => {
        if (!createdAt) {
            return "";
        }

        const date = new Date(createdAt);
        return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    }, [createdAt, locale]);
}
