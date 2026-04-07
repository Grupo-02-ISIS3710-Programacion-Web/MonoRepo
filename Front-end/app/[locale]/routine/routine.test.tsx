import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import RoutineForm from "@/components/routines/RoutineForm";
import RoutineContent from "@/components/profile/routineContent";
import { mockRoutines } from "@/components/test-fixtures/routines";
import { Category, ProductType, SkinType, type Product } from "@/types/product";
import { toast } from "sonner";

let mockSearchParams: Record<string, string | undefined> = {};

const stableSearchParams = {
    get: (key: string) => mockSearchParams[key] ?? null,
};

const mockedProducts: Product[] = [
    {
        id: "12",
        name: "Hydra Mock",
        brand: "Mock Brand",
        description: "Hydration product",
        skin_type: [SkinType.NORMAL],
        product_type: ProductType.CREAM,
        category: [Category.HIDRATACION],
        ingredients: ["glycerin"],
        rating: 4.4,
        review_count: 20,
        image_url: ["/hydra.png"],
    },
    {
        id: "5",
        name: "Clean Mock",
        brand: "Mock Brand",
        description: "Cleanser product",
        skin_type: [SkinType.NORMAL],
        product_type: ProductType.CLEANSER,
        category: [Category.LIMPIEZA],
        ingredients: ["niacinamide"],
        rating: 4.1,
        review_count: 10,
        image_url: ["/clean.png"],
    },
    {
        id: "15",
        name: "Serum Mock",
        brand: "Mock Brand",
        description: "Serum product",
        skin_type: [SkinType.NORMAL],
        product_type: ProductType.SERUM,
        category: [Category.ANTIOXIDANTE],
        ingredients: ["vitamin c"],
        rating: 4.8,
        review_count: 30,
        image_url: ["/serum.png"],
    },
    {
        id: "p1",
        name: "Fixture Product 1",
        brand: "Fixture",
        description: "Fixture product",
        skin_type: [SkinType.NORMAL],
        product_type: ProductType.CREAM,
        category: [Category.HIDRATACION],
        ingredients: ["x"],
        rating: 4.0,
        review_count: 1,
        image_url: ["/p1.png"],
    },
    {
        id: "p2",
        name: "Fixture Product 2",
        brand: "Fixture",
        description: "Fixture product",
        skin_type: [SkinType.NORMAL],
        product_type: ProductType.CREAM,
        category: [Category.HIDRATACION],
        ingredients: ["x"],
        rating: 4.0,
        review_count: 1,
        image_url: ["/p2.png"],
    },
    {
        id: "p3",
        name: "Fixture Product 3",
        brand: "Fixture",
        description: "Fixture product",
        skin_type: [SkinType.NORMAL],
        product_type: ProductType.CREAM,
        category: [Category.HIDRATACION],
        ingredients: ["x"],
        rating: 4.0,
        review_count: 1,
        image_url: ["/p3.png"],
    },
];

const mockSession = {
    isReady: true,
    isLoggedIn: true,
    user: {
        id: "u1",
        name: "Tester",
        city: "Bogota",
        skinType: "normal",
        reviewCount: 1,
        createdRoutineIds: ["r1", "r7"],
        favoriteProductIds: [],
        bio: "bio",
        avatarUrl: "https://example.com/avatar.png",
    },
};

jest.mock("next/navigation", () => ({
    useSearchParams: () => stableSearchParams,
}));

jest.mock("@/lib/api", () => ({
    getProducts: () => mockedProducts,
}));

jest.mock("@/lib/hooks/use-auth-session", () => ({
    useAuthSession: () => mockSession,
}));

jest.mock("@/i18n/navigation", () => ({
    Link: ({ children, href, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        refresh: jest.fn(),
        prefetch: jest.fn(),
    }),
}));

jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
    },
}));

describe("HU-04: Gestionar mis rutinas", () => {
    beforeEach(() => {
        mockSearchParams = {};
        jest.clearAllMocks();
    });

    test("Dado que creo una rutina valida, cuando guardo, entonces se muestra confirmacion visual de creacion", async () => {
        mockSearchParams = { product: "12" };

        render(<RoutineForm mode="create" />);

        fireEvent.click(screen.getByRole("button", { name: "GuardarRutina.infoCard.selectProductsButton" }));
        fireEvent.click((await screen.findAllByRole("button", { name: "CardProducto.addToRoutine" }))[0]);

        await waitFor(() => {
            expect(screen.queryByText("GuardarRutina.steps.empty")).not.toBeInTheDocument();
        });

        fireEvent.change(screen.getAllByPlaceholderText("GuardarRutina.steps.namePlaceholder")[0], {
            target: { value: "Paso 1" },
        });
        fireEvent.change(screen.getAllByPlaceholderText("GuardarRutina.steps.descriptionPlaceholder")[0], {
            target: { value: "Descripcion del paso valida" },
        });

        fireEvent.change(screen.getByPlaceholderText("GuardarRutina.steps.routineNamePlaceholder"), {
            target: { value: "Rutina HU04" },
        });
        fireEvent.change(screen.getByPlaceholderText("GuardarRutina.infoCard.descriptionPlaceholder"), {
            target: { value: "Descripcion valida para cumplir el minimo requerido." },
        });
        fireEvent.change(screen.getByLabelText("GuardarRutina.infoCard.skinTypeLabel"), {
            target: { value: "normal" },
        });

        const routineForm = document.querySelector("form");
        expect(routineForm).not.toBeNull();
        fireEvent.submit(routineForm as HTMLFormElement);

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith("CrearRutina.toasts.created");
        });
    });

    test("Dado que consulto mis rutinas en perfil, cuando se renderiza la lista, entonces veo nombre, descripcion, momento y cantidad de pasos", () => {
        render(<RoutineContent filteredRoutines={[mockRoutines[0]]} />);

        expect(screen.getByText("Morning Basic")).toBeInTheDocument();
        expect(screen.getByText("Simple AM routine")).toBeInTheDocument();
        expect(screen.getByText("AM")).toBeInTheDocument();
        expect(screen.getByText("2 RoutineContent.steps")).toBeInTheDocument();
    });

    test("Dado que abro la edicion de una rutina existente, cuando carga el formulario, entonces se precargan datos y pasos", async () => {
        mockSearchParams = { id: "r1" };

        render(<RoutineForm mode="edit" />);

        expect(await screen.findByDisplayValue("Rutina básica de mañana")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Rutina sencilla de 3 pasos para comenzar el día con la piel limpia e hidratada.")).toBeInTheDocument();
    });

    test("Dado que guardo cambios de una rutina existente, cuando envio el formulario, entonces se muestra confirmacion visual de actualizacion", async () => {
        mockSearchParams = { id: "r1" };

        render(<RoutineForm mode="edit" />);

        fireEvent.change(await screen.findByDisplayValue("Rutina básica de mañana"), {
            target: { value: "Rutina básica de mañana actualizada" },
        });

        fireEvent.click(screen.getByRole("button", { name: "EditarRutina.submitButton" }));

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith("EditarRutina.toasts.saved");
        });
    });

    test("Dado que elimino una rutina desde perfil, cuando confirmo en el dialogo, entonces la rutina desaparece de la lista", () => {
        render(<RoutineContent filteredRoutines={[mockRoutines[0]]} />);

        fireEvent.click(screen.getByTitle("RoutineContent.deleteDialog.title"));
        fireEvent.click(screen.getByRole("button", { name: "RoutineContent.deleteDialog.delete" }));

        expect(screen.queryByText("Morning Basic")).not.toBeInTheDocument();
    });
});

describe("HU-05: Gestionar los pasos de una rutina", () => {
    beforeEach(() => {
        mockSearchParams = {};
        jest.clearAllMocks();
    });

    test("Dado que agrego productos al selector de rutina, cuando confirmo, entonces se crean pasos asociados a esos productos", async () => {
        render(<RoutineForm mode="create" />);

        fireEvent.click(screen.getByRole("button", { name: "GuardarRutina.infoCard.selectProductsButton" }));

        const addButtons = await screen.findAllByRole("button", { name: "CardProducto.addToRoutine" });
        fireEvent.click(addButtons[0]);
        fireEvent.click(addButtons[1]);

        await waitFor(() => {
            expect(screen.getAllByPlaceholderText("GuardarRutina.steps.namePlaceholder").length).toBe(2);
        });
    });

    test("Dado que intento guardar sin pasos, cuando envio, entonces se muestra un error indicando que se requiere al menos un paso", async () => {
        render(<RoutineForm mode="create" />);

        fireEvent.change(screen.getByPlaceholderText("GuardarRutina.steps.routineNamePlaceholder"), {
            target: { value: "Rutina sin pasos" },
        });
        fireEvent.change(screen.getByPlaceholderText("GuardarRutina.infoCard.descriptionPlaceholder"), {
            target: { value: "Descripcion valida para intentar guardar sin pasos." },
        });
        fireEvent.change(screen.getByLabelText("GuardarRutina.infoCard.skinTypeLabel"), {
            target: { value: "normal" },
        });

        const routineForm = document.querySelector("form");
        expect(routineForm).not.toBeNull();
        fireEvent.submit(routineForm as HTMLFormElement);

        expect(await screen.findByText("GuardarRutina.steps.errors.atLeastOneStep")).toBeInTheDocument();
    });

    test("Dado que muevo pasos hacia arriba o abajo, cuando ejecuto la accion, entonces cambia su orden dentro de la rutina", async () => {
        render(<RoutineForm mode="create" />);

        fireEvent.click(screen.getByRole("button", { name: "GuardarRutina.infoCard.selectProductsButton" }));
        const addButtons = await screen.findAllByRole("button", { name: "CardProducto.addToRoutine" });
        fireEvent.click(addButtons[0]);
        fireEvent.click(addButtons[1]);
        fireEvent.click(screen.getByRole("button", { name: "Close" }));

        await waitFor(() => {
            expect(screen.getAllByPlaceholderText("GuardarRutina.steps.namePlaceholder").length).toBe(2);
        });

        const stepNameInputsBefore = screen.getAllByPlaceholderText("GuardarRutina.steps.namePlaceholder") as HTMLInputElement[];
        fireEvent.change(stepNameInputsBefore[0], { target: { value: "Paso A" } });
        fireEvent.change(stepNameInputsBefore[1], { target: { value: "Paso B" } });

        fireEvent.click(screen.getAllByRole("button", { name: "Mover paso abajo" })[0]);

        await waitFor(() => {
            const stepNameInputsAfter = screen.getAllByPlaceholderText("GuardarRutina.steps.namePlaceholder") as HTMLInputElement[];
            expect(stepNameInputsAfter[0].value).toBe("Paso B");
            expect(stepNameInputsAfter[1].value).toBe("Paso A");
        });
    });

    test("Dado que elimino un paso, cuando confirmo, entonces se remueve de la secuencia y de la seleccion de productos", async () => {
        render(<RoutineForm mode="create" />);

        fireEvent.click(screen.getByRole("button", { name: "GuardarRutina.infoCard.selectProductsButton" }));
        fireEvent.click((await screen.findAllByRole("button", { name: "CardProducto.addToRoutine" }))[0]);
        fireEvent.click(screen.getByRole("button", { name: "Close" }));

        await waitFor(() => {
            expect(screen.queryByText("GuardarRutina.steps.empty")).not.toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: "Eliminar paso" }));

        await waitFor(() => {
            expect(screen.getByText("GuardarRutina.steps.empty")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: "GuardarRutina.infoCard.selectProductsButton" }));
        fireEvent.click(screen.getAllByRole("button", { name: "CardProducto.addToRoutine" })[0]);

        expect(toast.info).not.toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith("GuardarRutina.toast.added");
    });
});
