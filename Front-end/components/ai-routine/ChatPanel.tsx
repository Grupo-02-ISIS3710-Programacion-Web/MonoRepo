"use client";

import { useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bot, MessageSquareText, SendHorizontal, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { ChatPanelProps } from "@/components/ai-routine/types";
import ChatProductRecommendation from "@/components/ai-routine/ChatProductRecommendation";

export default function ChatPanel({
  userName,
  messages,
  inputValue,
  setInputValue,
  onSubmit,
  t,
  addProductToRoutine,
  isLoading,
}: ChatPanelProps) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }, [onSubmit]);

  return (
    <Card className="flex flex-col overflow-hidden border-[#e8ebf1] shadow-none min-h-0">
      <CardHeader className="flex-shrink-0 border-b bg-card py-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl">{t("chat.title")}</CardTitle>
            <CardDescription>{t("chat.description")}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`flex flex-col p-0 min-h-0 ${messages.length > 0 ? "flex-1" : ""}`}>
        <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => {
              const isAssistant = message.role === "assistant";

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut", delay: Math.min(index * 0.03, 0.12) }}
                  className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-3xl border px-4 py-3 ${isAssistant
                        ? "border-border bg-card text-card-foreground"
                        : "border-border bg-primary/8 text-primary"
                      }`}
                  >
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide opacity-80">
                      {isAssistant ? <Bot size={14} /> : <MessageSquareText size={14} />}
                      <span>
                        {isAssistant
                          ? t("chat.assistantLabel")
                          : t("chat.userLabel", { name: userName })}
                      </span>
                    </div>
                    <div className="text-sm leading-6 prose prose-sm max-w-none">
                      {isAssistant ? (
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>

                    {message.recommendedProducts && message.recommendedProducts.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {message.recommendedProducts.map((rec, idx) => (
                          rec.product && (
                            <ChatProductRecommendation
                              key={`${message.id}-rec-${idx}`}
                              product={rec.product}
                              reason={rec.reason}
                              alternativesDetails={rec.alternativesDetails}
                              onAddToRoutine={(product) => addProductToRoutine?.(product)}
                            />
                          )
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {isLoading && (
              <motion.div
                key="thinking"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="max-w-[88%] rounded-3xl border px-4 py-3 border-border bg-card text-card-foreground">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide opacity-80">
                    <Bot size={14} />
                    <span>{t("chat.assistantLabel")}</span>
                    <Loader2 size={14} className="animate-spin" />
                  </div>
                  <div className="text-sm leading-6">
                    <p className="text-muted-foreground italic">AI is thinking...</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t bg-background/80 px-4 py-3 md:px-6 flex-shrink-0">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
          >
            <InputGroup className="rounded-3xl border-[#e5e7eb] bg-card">
              <InputGroupAddon align="block-start" className="border-b">
                <InputGroupText>
                  <MessageSquareText size={16} />
                  {t("composer.label")}
                </InputGroupText>
              </InputGroupAddon>

              <InputGroupTextarea
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("composer.placeholder")}
                rows={3}
              />

              <InputGroupAddon align="block-end" className="justify-between gap-3 border-t">
                <InputGroupText className="max-w-xl text-balance">
                  {t("composer.hint")}
                </InputGroupText>

                <InputGroupButton type="submit" variant="default" size="sm">
                  <SendHorizontal size={16} />
                  {t("composer.send")}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
