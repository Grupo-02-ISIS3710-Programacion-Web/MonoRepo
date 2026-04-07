import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductDetailPage from "./page";
import { Category, ProductType } from "@/types/product";

const mockProduct = {
  id: "prod-1",
  name: "Hydra Cream",
  brand: "Brand A",
  description: "Deep hydration cream for daily use",
  skin_type: [],
  product_type: ProductType.CREAM,
  category: [Category.HIDRATACION],
  ingredients: ["niacinamide", "hyaluronic acid"],
  rating: 4.5,
  review_count: 120,
  image_url: ["image-1", "image-2", "image-3"],
};

jest.mock("next/navigation", () => ({
  useParams: () => ({
    slug: "hydra-cream",
  }),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const { unoptimized, ...rest } = props;
    return <img {...rest} />;
  },
}));

jest.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => {
    if (namespace === "Categories" && key === "hidratacion.label") {
      return "Hidratacion";
    }

    if (namespace === "ProductTypes" && key === "cream") {
      return "Cream";
    }

    return key;
  },
}));

jest.mock("@/lib/api", () => ({
  getProductByName: () => mockProduct,
}));

jest.mock("@/lib/hooks/use-auth-session", () => ({
  useAuthSession: () => ({
    isLoggedIn: true,
  }),
}));

jest.mock("@/components/comments/CommentsSection", () => ({
  __esModule: true,
  default: () => <div data-testid="comments-section" />,
}));

jest.mock("@/components/products/star-rating", () => ({
  __esModule: true,
  default: ({ rating, reviewCount }: { rating: number; reviewCount: number }) => (
    <div data-testid="star-rating">rating-{rating}-reviews-{reviewCount}</div>
  ),
}));

jest.mock("@/components/products/image-carousel", () => ({
  __esModule: true,
  default: ({
    imagesURL,
    currentIndex,
    onNextImage,
    onPreviousImage,
  }: {
    imagesURL: string[];
    currentIndex: number;
    onNextImage: () => void;
    onPreviousImage: () => void;
  }) => (
    <div data-testid="image-carousel">
      <p data-testid="main-image-src">{imagesURL[currentIndex]}</p>
      <button onClick={onPreviousImage}>prev-image</button>
      <button onClick={onNextImage}>next-image</button>
    </div>
  ),
}));

jest.mock("@/components/ui/breadcrumb", () => ({
  Breadcrumb: ({ children }: any) => <nav>{children}</nav>,
  BreadcrumbList: ({ children }: any) => <ol>{children}</ol>,
  BreadcrumbItem: ({ children }: any) => <li>{children}</li>,
  BreadcrumbLink: ({ children, href }: any) => <a href={href}>{children}</a>,
  BreadcrumbSeparator: () => <span>/</span>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ asChild, children, ...props }: any) => {
    if (asChild) {
      return children;
    }

    return <button {...props}>{children}</button>;
  },
}));

jest.mock("@/components/ui/carousel", () => ({
  Carousel: ({ children }: any) => <div data-testid="thumb-carousel">{children}</div>,
  CarouselContent: ({ children }: any) => <div>{children}</div>,
  CarouselItem: ({ children }: any) => <div>{children}</div>,
  CarouselNext: () => <button>carousel-next</button>,
  CarouselPrevious: () => <button>carousel-prev</button>,
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("HU-07: Detalle de producto", () => {
  test("muestra carrusel, marca, descripcion, rating, categoria, tipo e ingredientes", () => {
    render(<ProductDetailPage />);

    expect(screen.getByTestId("image-carousel")).toBeInTheDocument();
    expect(screen.getByText("Brand A")).toBeInTheDocument();
    expect(screen.getByText("Deep hydration cream for daily use")).toBeInTheDocument();
    expect(screen.getByTestId("star-rating")).toHaveTextContent("rating-4.5-reviews-120");
    expect(screen.getAllByText("Hidratacion").length).toBeGreaterThan(0);
    expect(screen.getByText("Cream")).toBeInTheDocument();
    expect(screen.getByText("Niacinamide")).toBeInTheDocument();
    expect(screen.getByText("Hyaluronic acid")).toBeInTheDocument();
  });

  test("cambia la imagen principal al navegar carrusel y miniaturas", () => {
    render(<ProductDetailPage />);

    expect(screen.getByTestId("main-image-src")).toHaveTextContent("image-1");

    fireEvent.click(screen.getByText("next-image"));
    expect(screen.getByTestId("main-image-src")).toHaveTextContent("image-2");

    fireEvent.click(screen.getByText("prev-image"));
    expect(screen.getByTestId("main-image-src")).toHaveTextContent("image-1");

    const thumbnails = screen.getAllByAltText("Hydra Cream");
    fireEvent.click(thumbnails[1]);

    expect(screen.getByTestId("main-image-src")).toHaveTextContent("image-2");
  });

  test("navega al formulario de rutina con el producto preseleccionado", () => {
    render(<ProductDetailPage />);

    const addToRoutineLink = screen.getByRole("link", { name: "addToRoutine" });
    expect(addToRoutineLink).toHaveAttribute("href", "/routine/crear?product=prod-1");
  });

  test("al activar y desactivar favorito cambia el estado visual del boton", () => {
    render(<ProductDetailPage />);

    const favoriteButton = screen.getByRole("button", { name: "Agregar a favoritos" });
    expect(favoriteButton).toBeInTheDocument();

    fireEvent.click(favoriteButton);
    expect(screen.getByRole("button", { name: "Quitar de favoritos" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Quitar de favoritos" }));
    expect(screen.getByRole("button", { name: "Agregar a favoritos" })).toBeInTheDocument();
  });
});
