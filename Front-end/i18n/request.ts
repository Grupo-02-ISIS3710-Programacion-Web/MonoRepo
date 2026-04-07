import { defaultLocale, locales, type AppLocale } from './routing';

function isSupportedLocale(value: string | undefined): value is AppLocale {
  return (locales as readonly string[]).includes(value ?? '');
}

/**
 * Static helper to load messages for a locale without using request-scoped APIs.
 * Use this from server components that receive `params.locale` so pages stay static.
 */
export async function loadLocaleMessages(localeCandidate?: string) {
  const locale: AppLocale = isSupportedLocale(localeCandidate) ? (localeCandidate as AppLocale) : defaultLocale;

  const messages = (await import(`../messages/${locale}.json`)).default;

  return { locale, messages };
}

export { locales, defaultLocale };

// Default export for next-intl compatibility.
// next-intl imports this module's default export and may call it with
// either a locale string or an object. We provide a safe wrapper that
// avoids calling any request-scoped getters (like `requestLocale`) so
// the module can be statically analyzed and won't force SSR.
export default async function defaultGetConfig(arg?: any) {
  // If arg is a string, treat it as locale
  if (typeof arg === 'string') {
    return loadLocaleMessages(arg);
  }

  // If arg is an object, prefer `locale` property if present.
  // Do NOT access `arg.requestLocale` to avoid request-scoped reads.
  const localeCandidate = arg && typeof arg === 'object' && typeof arg.locale === 'string' ? arg.locale : undefined;

  return loadLocaleMessages(localeCandidate);
}