import { fireEvent, render, screen } from "@testing-library/react";

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

  it("applies a starter prompt to the chat composer", () => {
    render(<AiRoutineWorkspace user={user} />);

    fireEvent.click(screen.getByRole("button", { name: "AiRoutine.starterPrompts.hydration.label" }));

    expect(screen.getByPlaceholderText("AiRoutine.composer.placeholder")).toHaveValue(
      "AiRoutine.starterPrompts.hydration.value",
    );
  });

  it("adds a new iteration to the conversation", () => {
    render(<AiRoutineWorkspace user={user} />);

    fireEvent.change(screen.getByPlaceholderText("AiRoutine.composer.placeholder"), {
      target: { value: "Necesito una recomendacion nocturna" },
    });

    fireEvent.click(screen.getByRole("button", { name: "AiRoutine.composer.send" }));

    expect(screen.getByText("Necesito una recomendacion nocturna")).toBeInTheDocument();
    expect(screen.getByText("AiRoutine.messages.pendingReply")).toBeInTheDocument();
  });
});
