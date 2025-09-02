import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useMessageStore = create(
    persist<{
        messages: { id: string, role: string, content: string, createdAt: string }[];
        clearMessages: () => void;
        setMessages: (messages: { id: string, role: string, content: string, createdAt: string }[]) => void;
    }>(
        (set) => ({
            messages: [],
            setMessages: (newMessages) =>
                set((state) => {
                    const merged = [...state.messages, ...newMessages];
                    const unique = Array.from(
                        new Map(merged.map((m) => [m.id, m])).values()
                    );
                    return { messages: unique };
                }),
            clearMessages: () => {
                localStorage.removeItem("message-storage");
                set({ messages: [] });
            },
        }),
        {
            name: "message-storage",
        }
    )
);