import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductForm from "@/components/products/product-form";


jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));


jest.mock("@/types/product", () => ({
  Category: { CLEANSER: "CLEANSER" },
  SkinType: { OILY: "OILY" },
  ProductType: { SERUM: "SERUM" },
}));


jest.mock("@/components/ui/combobox", () => ({
  Combobox: ({ onValueChange, items, multiple, value }: any) => (
    <select
      data-testid="combobox"
      value={multiple ? value?.[0] || "" : value || ""}
      onChange={(e) => {
        if (multiple) {
          onValueChange([e.target.value]);
        } else {
          onValueChange(e.target.value);
        }
      }}
    >
      {items.map((item: any) => {
        const v = typeof item === "string" ? item : item.value;
        return (
          <option key={v} value={v}>
            {v}
          </option>
        );
      })}
    </select>
  ),
  ComboboxChips: ({ children }: any) => <div>{children}</div>,
  ComboboxValue: ({ children }: any) => children([]),
  ComboboxTrigger: () => null,
  ComboboxContent: ({ children }: any) => <div>{children}</div>,
  ComboboxList: ({ children }: any) => <div>{children}</div>,
  ComboboxItem: () => null,
  useComboboxAnchor: () => null,
}));


jest.mock("@/components/ui/select", () => ({
  Select: ({ onValueChange, value, children }: any) => (
    <select
      data-testid="select"
      value={value || ""}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => (
    <option value={value}>{children}</option>
  ),
  SelectValue: () => null,
}));


const mockToast = jest.fn();

jest.mock("sonner", () => ({
  toast: {
    success: (...args: any) => mockToast(...args),
  },
}));

describe("HU-08: ProductForm ", () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  
  
  test("no envía el formulario si está vacío", async () => {
    render(<ProductForm />);

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(mockToast).not.toHaveBeenCalled();
    });
  });

  
  test("no envía si falta description", async () => {
    render(<ProductForm />);

    fireEvent.change(screen.getByLabelText(/productName/i), {
      target: { value: "Cleanser X" },
    });

    fireEvent.change(screen.getByLabelText(/brand/i), {
      target: { value: "Cerave" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(mockToast).not.toHaveBeenCalled();
    });
  });

 
  test("permite seleccionar skin type", () => {
    render(<ProductForm />);

    const combobox = screen.getAllByTestId("combobox")[1];

    fireEvent.change(combobox, {
      target: { value: "OILY" },
    });

    expect(combobox).toHaveValue("OILY");
  });

  test("el botón submit está presente", () => {
    render(<ProductForm />);

    const button = screen.getByRole("button", { name: /submit/i });

    expect(button).toBeInTheDocument();
  });
});

