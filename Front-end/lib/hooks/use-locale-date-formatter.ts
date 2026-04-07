"use client";

import { useMemo } from "react";

export function useLocaleDateFormatter(
    locale: string,
    options: Intl.DateTimeFormatOptions
) {
    const optionsKey = JSON.stringify(options);

    return useMemo(() => new Intl.DateTimeFormat(locale, options), [locale, optionsKey]);
}
