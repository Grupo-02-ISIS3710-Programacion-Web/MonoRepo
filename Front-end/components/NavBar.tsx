"use client"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { User, Search, Menu, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState, type ComponentPropsWithoutRef } from "react";
import { useTranslations } from "next-intl";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { User as AuthUser } from "@/types/user";
import { Link, useRouter } from "@/i18n/navigation";

const linksStatic = [
    { key: "home", href: "/" },
    { key: "discover", href: "/descubrir" },
    { key: "community", href: "/community" },
    { key: "aiRoutines", href: "/ai-routine" },
];

function buildDiscoverySearchUrl(searchTerm: string) {
    const trimmedSearchTerm = searchTerm.trim();
    if (!trimmedSearchTerm) return "/descubrir";
    return `/descubrir?q=${encodeURIComponent(trimmedSearchTerm)}`;
}

interface SearchBarProps {
    initialValue?: string;
    onSearch: (searchTerm: string) => void;
    autoFocus?: boolean;
}

export default function NavBar() {
    const router = useRouter();
    const { isLoggedIn, logout, user } = useAuthSession();

    return (
        <>
            <div className="hidden md:block">
                <NavBarDesktop
                    isLoggedIn={isLoggedIn}
                    onLogout={logout}
                    onLogin={() => router.push("/login")}
                    onRegister={() => router.push("/register")}
                    onProfile={() => router.push("/profile")}
                    user={user}
                />
            </div>

            <div className="block md:hidden">
                <NavBarMobile
                    isLoggedIn={isLoggedIn}
                    onLogout={logout}
                    onLogin={() => router.push("/login")}
                    onRegister={() => router.push("/register")}
                    onProfile={() => router.push("/profile")}
                    user={user}
                />
            </div>
        </>
    );
}

export function NavBarDesktop({
    isLoggedIn = false,
    onLogout,
    onLogin,
    onRegister,
    onProfile,
    user,
}: {
    isLoggedIn?: boolean;
    onLogout?: () => void;
    onLogin?: () => void;
    onRegister?: () => void;
    onProfile?: () => void;
    user?: AuthUser | null;
}) {
    const t = useTranslations("NavBar");
    const router = useRouter();
    const [currentQuery, setCurrentQuery] = useState("");

    useEffect(() => {
        const syncQueryFromUrl = () => {
            setCurrentQuery(new URLSearchParams(window.location.search).get("q") ?? "");
        };

        syncQueryFromUrl();
        window.addEventListener("popstate", syncQueryFromUrl);

        return () => {
            window.removeEventListener("popstate", syncQueryFromUrl);
        };
    }, []);

    const handleSearch = (searchTerm: string) => {
        setCurrentQuery(searchTerm);
        router.push(buildDiscoverySearchUrl(searchTerm));
    };

    return (
        <div className="hidden md:flex items-center justify-center px-4 lg:px-10 py-3 w-full gap-12 bg-popover">
            <div className="flex items-center gap-6">
                <Link href="/">
                    <div className="flex gap-1 cursor-pointer hover:opacity-80 transition-opacity">
                        <Image className="dark:invert" src="/skin4all_logo.svg" alt="Skin4All logo" width={20} height={20} />
                        <h1 className="font-medium text-xl">Skin4All</h1>
                    </div>
                </Link>

                <NavigationMenu>
                    <NavigationMenuList className="gap-4">
                        {linksStatic.map((link) => (
                            <NavigationMenuItem key={link.key}>
                                <NavigationMenuLink asChild>
                                    <Link href={link.href} className="text-sm font-medium hover:text-primary hover:font-medium transition-colors">
                                        {t(link.key)}
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            <div className="flex items-center justify-centter">
                <div className="flex-1 max-w-1/2 mx-6">
                    <SearchBar initialValue={currentQuery} onSearch={handleSearch} />
                </div>

                <div className="flex items-center gap-3">
                    {!isLoggedIn && (
                        <div className="hidden lg:flex items-center gap-2">
                            <Button variant="outline" className=" hover:bg-secondary hover:text-secondary-foreground" onClick={onRegister}>
                                {t("register")}
                            </Button>
                            <Button className="bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground" onClick={onLogin}>
                                {t("login")}
                            </Button>
                        </div>
                    )}

                    {isLoggedIn && (
                        <>
                            <ProfileButton user={user} onClick={onProfile} />
                            <Button variant="outline" onClick={onLogout}>
                                {t("logout")}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export function SearchBar({ initialValue = "", onSearch, autoFocus = false }: SearchBarProps) {
    const [query, setQuery] = useState(initialValue);
    const t = useTranslations("NavBar");

    useEffect(() => setQuery(initialValue), [initialValue]);

    const handleSubmit: NonNullable<ComponentPropsWithoutRef<"form">["onSubmit"]> = (event) => {
        event.preventDefault();
        onSearch(query);
    };

    return (
        <form className="flex items-center gap-2 w-full" onSubmit={handleSubmit}>
            <Input type="text" placeholder={t("searchPlaceholder")} className="w-full" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus={autoFocus} />
            <Button variant="outline" size="icon" type="submit" aria-label={t("searchPlaceholder")}>
                <Search className="h-4 w-4" />
            </Button>
        </form>
    );
}


export function ProfileButton({ user, onClick }: { user?: AuthUser | null; onClick?: () => void }) {
    const t = useTranslations("NavBar");
    return (
        <Button type="button" size="icon" variant="outline" className="rounded-full overflow-hidden p-0" aria-label={t("profile")} onClick={onClick}>
            {user?.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" /> : <User className="h-5 w-5" />}
        </Button>
    );
}

export function NavBarMobile({
    isLoggedIn = false,
    onLogout,
    onLogin,
    onRegister,
    onProfile,
    user,
}: {
    isLoggedIn?: boolean;
    onLogout?: () => void;
    onLogin?: () => void;
    onRegister?: () => void;
    onProfile?: () => void;
    user?: AuthUser | null;
}) {
    const t = useTranslations("NavBar");
    const router = useRouter();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [currentQuery, setCurrentQuery] = useState("");

    useEffect(() => {
        const syncQueryFromUrl = () => {
            setCurrentQuery(new URLSearchParams(window.location.search).get("q") ?? "");
        };

        syncQueryFromUrl();
        window.addEventListener("popstate", syncQueryFromUrl);

        return () => {
            window.removeEventListener("popstate", syncQueryFromUrl);
        };
    }, []);

    const handleSearch = (searchTerm: string) => {
        setCurrentQuery(searchTerm);
        router.push(buildDiscoverySearchUrl(searchTerm));
        setIsSearchOpen(false);
    };

    return (
        <div className="md:hidden sticky top-0 z-50 border-b">
            <div className="flex items-center justify-baseline px-4 py-3">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={t("openMenu")}>
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>

                    <SheetContent side="left" className="w-72 flex flex-col">
                        <SheetHeader>
                            <SheetTitle>{t("menuTitle")}</SheetTitle>
                        </SheetHeader>

                        <div className="mt-6 flex flex-col gap-1">
                            {linksStatic.map((link) => (
                                <Button key={link.key} asChild variant="ghost" className="justify-start text-base active:text-primary transition-transform ">
                                    <Link href={link.href}>{t(link.key)}</Link>
                                </Button>
                            ))}
                        </div>

                        <div className="mt-auto pt-6 border-t flex justify-center w-full">
                            <div className=" flex flex-col gap-2 w-60">
                                {!isLoggedIn && (
                                    <>
                                        <Button variant="outline" onClick={onRegister}>
                                            {t("register")}
                                        </Button>
                                        <Button className="bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground" onClick={onLogin}>
                                            {t("login")}
                                        </Button>
                                    </>
                                )}
                                {isLoggedIn && (
                                    <Button variant="outline" onClick={onLogout}>
                                        {t("logout")}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                <div className="flex justify-between w-full items-center">
                    <Link href="/">
                        <div className="flex gap-1 cursor-pointer hover:opacity-80 transition-opacity">
                            <Image className="dark:invert" src="/skin4all_logo.svg" alt="Skin4All logo" width={20} height={20} priority />
                            <h1 className="font-medium text-lg">Skin4All</h1>
                        </div>
                    </Link>

                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen((s) => !s)} aria-label={t("openSearch") ?? "Abrir búsqueda"}>
                            <Search className="h-5 w-5" />
                        </Button>

                        <ProfileButton user={user} onClick={onProfile} />
                    </div>
                </div>
            </div>

            {isSearchOpen && (
                <div className="px-4 pb-3">
                    <SearchBar initialValue={currentQuery} onSearch={handleSearch} autoFocus />
                </div>
            )}
        </div>
    );
}
