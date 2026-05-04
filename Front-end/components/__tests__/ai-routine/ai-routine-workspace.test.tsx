import { fireEvent, render, screen, act } from "@testing-library/react";

import AiRoutineWorkspace from "@/components/ai-routine/AiRoutineWorkspace";

jest.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string } & Record<string, unknown>) => {
    const React = require("react");
    return React.createElement("a", { href, ...props }, children);
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

jest.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: () => null,
  }),
}));

let currentInputValue = "";
const mockSetInputValue = jest.fn((val: string | ((prev: string) => string)) => {
  currentInputValue = typeof val === "function" ? val(currentInputValue) : val;
});

const mockApplyStarterPrompt = jest.fn((_id: string, value: string) => {
  currentInputValue = value;
  mockSetInputValue(value);
});

const mockSubmitMessage = jest.fn(() => {
  currentInputValue = "";
  mockSetInputValue("");
});

jest.mock("@/lib/hooks/use-ai-routine-chat", () => ({
  useAiRoutineChat: jest.fn(() => ({
    messages: [],
    inputValue: currentInputValue,
    setInputValue: mockSetInputValue,
    isLoading: false,
    isInitializing: false,
    starterPrompts: [
      { id: "hydration", label: "starterPrompts.hydration.label", value: "starterPrompts.hydration.value" },
    ],
    focusAreas: [],
    selectedFocusAreaIds: [],
    routineDraft: { steps: [] },
    recommendedProducts: [],
    continuousRecommendations: [],
    appendPrompt: jest.fn(),
    applyStarterPrompt: mockApplyStarterPrompt,
    toggleFocusArea: jest.fn(),
    updateRoutineField: jest.fn(),
    toggleProductInRoutine: jest.fn(),
    updateStepName: jest.fn(),
    updateStepNotes: jest.fn(),
    moveStep: jest.fn(),
    removeStep: jest.fn(),
    submitMessage: mockSubmitMessage,
    addProductToRoutine: jest.fn(),
  })),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/components/ai-routine/ChatPanel", () => ({
  __esModule: true,
  default: ({ inputValue, setInputValue, onSubmit, t }: any) => (
    <div>
      <input
        placeholder={t("composer.placeholder")}
        value={inputValue}
        onChange={(e: any) => setInputValue(e.target.value)}
      />
      <button onClick={onSubmit}>{t("composer.send")}</button>
    </div>
  ),
}));

jest.mock("@/components/ai-routine/StarterPromptsPanel", () => ({
  __esModule: true,
  default: ({ starterPrompts, applyStarterPrompt }: any) => (
    <div>
      {starterPrompts.map((prompt: any) => (
        <button key={prompt.id} onClick={() => applyStarterPrompt(prompt.id, prompt.value)}>
          {prompt.label}
        </button>
      ))}
    </div>
  ),
}));

jest.mock("@/components/ai-routine/DraftEditor", () => ({
  __esModule: true,
  default: () => <div>Mocked DraftEditor</div>,
}));

jest.mock("@/components/ai-routine/SuggestionsSheetContent", () => ({
  __esModule: true,
  default: () => <div>Mocked SuggestionsSheetContent</div>,
}));

describe("AiRoutineWorkspace", () => {
  const user = {
    id: "u1",
    name: "Sofia",
    avatarUrl: "https://example.com/avatar.png",
    email: "sofia@skin4all.com",
    login: "sofia",
    password: "secret",
    city: "Madrid",
    skinType: "Combination",
    bio: "Skincare lover",
    reviewCount: 3,
    favoriteProductIds: ["1"],
    createdRoutineIds: ["r1"],
  };

  beforeEach(() => {
    currentInputValue = "";
    jest.clearAllMocks();
  });

  it("applies a starter prompt to the chat composer", () => {
    render(<AiRoutineWorkspace user={user} />);

    fireEvent.click(screen.getByRole("button", { name: "starterPrompts.hydration.label" }));

    expect(mockApplyStarterPrompt).toHaveBeenCalledWith("hydration", "starterPrompts.hydration.value");
  });

  it("adds a new iteration to the conversation", async () => {
    render(<AiRoutineWorkspace user={user} />);

    const input = screen.getByPlaceholderText("composer.placeholder");
    fireEvent.change(input, {
      target: { value: "Necesito una recomendacion nocturna" },
    });

    fireEvent.click(screen.getByRole("button", { name: "composer.send" }));

    expect(mockSubmitMessage).toHaveBeenCalled();
  });
});
