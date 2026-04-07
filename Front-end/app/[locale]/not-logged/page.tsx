import AuthRequiredCard from "@/components/auth/AuthRequiredCard";

export default function NotLoggedPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const redirectParam = searchParams?.redirect;
  const redirectPath = typeof redirectParam === 'string' ? redirectParam : Array.isArray(redirectParam) ? redirectParam[0] : "/community";

  return <AuthRequiredCard redirectPath={redirectPath} />;
}
