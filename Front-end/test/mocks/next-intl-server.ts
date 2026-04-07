export const getTranslations = async (_namespace?: string) => {
    return (key: string, values?: Record<string, string | number>) => {
        if (!values) return key

        return Object.entries(values).reduce((result, [token, value]) => {
            return result.replace(`{${token}}`, String(value))
        }, key)
    }
}

export const setRequestLocale = (_locale: string) => undefined
