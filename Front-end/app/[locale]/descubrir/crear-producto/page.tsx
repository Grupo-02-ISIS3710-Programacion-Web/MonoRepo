"use client";
import ProductForm from "@/components/products/product-form";
import { Container } from "@mui/material";

export default function CreateProductPage() {
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
                <ProductForm/>
            </Container>
        </div>
    );
}