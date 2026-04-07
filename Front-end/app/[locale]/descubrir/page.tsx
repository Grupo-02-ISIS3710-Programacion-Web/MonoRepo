import { Category } from "@/types/product";
import DiscoveryClient from "@/components/products/DiscoveryClient";

export default async function DiscoveryPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined> | undefined> }) {
    const resolved = await Promise.resolve(searchParams);
    const categoryParam = resolved?.category;
    const queryParam = resolved?.q;
    const selectedCategory = typeof categoryParam === "string" ? (categoryParam as Category) : "ALL";
    const searchQuery = typeof queryParam === "string" ? queryParam : "";

    return <DiscoveryClient selectedCategory={selectedCategory} searchQuery={searchQuery} />;
}
