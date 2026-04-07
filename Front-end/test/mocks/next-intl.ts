import type { ReactNode } from 'react'

type Messages = Record<string, unknown>

export const useTranslations = (_namespace?: string) => {
    return (key: string, values?: Record<string, string | number>) => {
        const resolvedKey = _namespace ? `${_namespace}.${key}` : key

        if (!values) return resolvedKey

        return Object.entries(values).reduce((result, [token, value]) => {
            return result.replace(`{${token}}`, String(value))
        }, resolvedKey)
    }
}

export const useLocale = () => 'es'
export const useNow = () => new Date('2026-01-01T00:00:00.000Z')
export const useTimeZone = () => 'UTC'
export const useMessages = (): Messages => ({})
export const useFormatter = () => ({
    dateTime: (value: Date | string | number) => String(value),
    number: (value: number) => String(value),
    relativeTime: (value: number) => String(value),
    list: (value: unknown[]) => value.join(', '),
})

export default function NextIntlClientProvider({ children }: { children: ReactNode }) {
    return children
}

export const IntlProvider = ({ children }: { children: ReactNode }) => children

export const _useExtracted = <T,>(value: T) => value
