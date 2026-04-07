import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Login from "./page";


jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({ children }: any) => children,
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

jest.mock("@/lib/hooks/use-auth-session", () => ({
  useAuthSession: () => ({
    login: (emailOrLogin: string, password: string) => {
      if (emailOrLogin && password) {
        return { id: "u1" };
      }
      return null;
    },
  }),
}));


const renderLoginPage = async () => {
  const element = await Login({ searchParams: {} });
  return render(element);
};

describe("HU-02: Login", () => {


  test("muestra errores si el formulario está vacío", async () => {
    await renderLoginPage();

    fireEvent.click(screen.getByText("login"));

    expect(await screen.findByText("emailRequired")).toBeInTheDocument();
    expect(await screen.findByText("passwordRequired")).toBeInTheDocument();
  });


  test("muestra error si falta contraseña", async () => {
    await renderLoginPage();

    fireEvent.change(
      screen.getByPlaceholderText("glowing.skin@example.com"),
      { target: { value: "test@test.com" } }
    );

    fireEvent.click(screen.getByText("login"));

    expect(await screen.findByText("passwordRequired")).toBeInTheDocument();
  });


  test("muestra error si falta email", async () => {
    await renderLoginPage();

    fireEvent.change(
      screen.getByPlaceholderText("••••••••"),
      { target: { value: "123456" } }
    );

    fireEvent.click(screen.getByText("login"));

    expect(await screen.findByText("emailRequired")).toBeInTheDocument();
  });


  test("permite enviar formulario con datos válidos", async () => {
    await renderLoginPage();

    fireEvent.change(
      screen.getByPlaceholderText("glowing.skin@example.com"),
      { target: { value: "test@test.com" } }
    );

    fireEvent.change(
      screen.getByPlaceholderText("••••••••"),
      { target: { value: "123456" } }
    );

    fireEvent.click(screen.getByText("login"));

    expect(screen.queryByText("emailRequired")).not.toBeInTheDocument();
    expect(screen.queryByText("passwordRequired")).not.toBeInTheDocument();
  });


  test("permite mostrar y ocultar la contraseña", async () => {
    await renderLoginPage();

    const input = screen.getByPlaceholderText("••••••••");


    const toggleBtn = screen.getAllByRole("button")[0];

    expect(input).toHaveAttribute("type", "password");

    fireEvent.click(toggleBtn);

    expect(input).toHaveAttribute("type", "text");

    fireEvent.click(toggleBtn);

    expect(input).toHaveAttribute("type", "password");
  });


  test("tiene enlace a registro", async () => {
    await renderLoginPage();

    expect(screen.getByText(/register/i)).toBeInTheDocument();
  });

});