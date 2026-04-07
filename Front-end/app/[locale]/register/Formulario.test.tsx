import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FormularioRegistroComponent } from "./Formulario";

// mocks
jest.mock("next-intl", () => ({
  useTranslations: () => (key) => key,
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({ children }) => children,
}));

describe("HU-01: FormularioRegistroComponent", () => {

  
  test("muestra errores si el formulario está vacío", async () => {
    render(<FormularioRegistroComponent />);

    fireEvent.click(screen.getByText("botones.crearCuenta"));

    const error = await screen.findAllByText("validaciones.requerido");

    expect(error.length).toBeGreaterThan(0);
  });

  
  test("muestra errores si faltan campos", async () => {
    render(<FormularioRegistroComponent />);

    fireEvent.change(
      screen.getByPlaceholderText("campos.nombre.placeholder"),
      { target: { value: "Mateo" } }
    );

    fireEvent.click(screen.getByText("botones.crearCuenta"));

    const error = await screen.findAllByText("validaciones.requerido");

    expect(error.length).toBeGreaterThan(0);
  });

  
  test("muestra error si la contraseña es muy corta", async () => {
    render(<FormularioRegistroComponent />);

    fireEvent.change(
      screen.getByPlaceholderText("campos.contrasenia.placeholder"),
      { target: { value: "123" } }
    );

    fireEvent.click(screen.getByText("botones.crearCuenta"));

    const error = await screen.findByText("validaciones.contraseniaMinima");

    expect(error).toBeInTheDocument();
  });

  
  test("muestra error si las contraseñas no coinciden", async () => {
    render(<FormularioRegistroComponent />);

    fireEvent.change(
      screen.getByPlaceholderText("campos.contrasenia.placeholder"),
      { target: { value: "12345678" } }
    );

    fireEvent.change(
      screen.getByPlaceholderText("campos.confirmarContrasenia.placeholder"),
      { target: { value: "123" } }
    );

    fireEvent.click(screen.getByText("botones.crearCuenta"));

    const error = await screen.findByText("validaciones.contraseniasNoCoinciden");

    expect(error).toBeInTheDocument();
  });

  
  test("permite enviar el formulario con datos válidos", async () => {
    render(<FormularioRegistroComponent />);

    fireEvent.change(
      screen.getByPlaceholderText("campos.nombre.placeholder"),
      { target: { value: "Mateo" } }
    );

    fireEvent.change(
      screen.getByPlaceholderText("campos.email.placeholder"),
      { target: { value: "test@test.com" } }
    );

    fireEvent.change(
      screen.getByPlaceholderText("campos.contrasenia.placeholder"),
      { target: { value: "12345678" } }
    );

    fireEvent.change(
      screen.getByPlaceholderText("campos.confirmarContrasenia.placeholder"),
      { target: { value: "12345678" } }
    );

    fireEvent.click(screen.getByText("botones.crearCuenta"));

    
    expect(
      screen.queryByText("validaciones.contraseniasNoCoinciden")
    ).not.toBeInTheDocument();
  });

});