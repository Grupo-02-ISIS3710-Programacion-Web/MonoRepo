"use client";
import AuthRequiredCard from "@/components/auth/AuthRequiredCard";
import ProductForm from "@/components/products/product-form";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { Container } from "@mui/material";

export default function CreateProductPage() {
  const { isReady, isLoggedIn, user } = useAuthSession();

  if (!isReady) {
    return null;
  }

  if (!isLoggedIn || !user) {
    return <AuthRequiredCard redirectPath="/create-product" />;
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        backgroundImage: `url(/background-reg.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container className="pt-10 pb-10">
        <ProductForm />
      </Container>
    </div>
  );
}