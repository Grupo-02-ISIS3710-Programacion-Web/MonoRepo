"use client";

import { AnimatePresence, motion } from "motion/react";
import { Bot, MessageSquareText, SendHorizontal } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { ChatPanelProps } from "@/components/ai-routine/types";

export default function ChatPanel({
  userName,
  messages,
  inputValue,
  setInputValue,
  onSubmit,
  t,
}: ChatPanelProps) {
  return (
    <Card className="overflow-hidden border-[#e8ebf1] py-0 shadow-none">
      <CardHeader className="border-b bg-card py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl">{t("chat.title")}</CardTitle>
            <CardDescription>{t("chat.description")}</CardDescription>
          </div>

          <div className="inline-flex rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
            {t("chat.status")}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-col">
          <div className="space-y-4 px-5 py-6 md:px-6">
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
                      <p className="text-sm leading-6">{message.content}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="border-t bg-background/80 px-4 py-4 md:px-6">
            <form
              className="space-y-3"
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
                  placeholder={t("composer.placeholder")}
                  rows={5}
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
        </div>
      </CardContent>
    </Card>
  );
}
