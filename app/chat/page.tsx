"use client";
//@ts-ignore
import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { PaperAirplaneIcon, TrashIcon, UserIcon } from "@heroicons/react/24/outline";
import { Spinner } from "@heroui/spinner";
import { useAuthStore } from "@/store/useAuthStore";
import { useUpdateUser } from "../practice/actions/useUpdate";
import { addToast } from "@heroui/toast";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useMessageStore } from "./useMessageStore";
import { Tooltip } from "@heroui/tooltip";

const SAVE_FACTOR_INTERVAL = 2;

const Chat = () => {
    const { t } = useTranslation('common', { keyPrefix: 'chat' });
    const { user } = useAuthStore();
    const route = useRouter();
    const { updateUserMutation, isPending } = useUpdateUser();
    const [feedbackCounter, setFeedbackCounter] = useState(0);
    const { messages, setMessages, clearMessages } = useMessageStore();
    const {
        messages: newMessages,
        input,
        isLoading,
        error,
        handleInputChange,
        handleSubmit,
    } = useChat({
        api: "/api/chat",
        body: {
            userName: user?.name,
            newMessages: messages,
            level: user?.level,
            interests: user?.interests,
            totalAttempts: user?.totalAttempts,
            audioSuccessRate: user?.audioSuccessRate,
            speechSuccessRate: user?.speechSuccessRate,
            textSuccessRate: user?.textSuccessRate,
            prevFeedback: user?.prevFeedback,
            targetLanguage: user?.targetLanguage,
        },
        keepLastMessageOnError: true,
        onFinish: () => {
            handleFinish();
        },
    });

    useEffect(() => {
        if (newMessages.length > 0) {
            //@ts-ignore
            setMessages(newMessages);
        }
    }, [newMessages, setMessages]);

    const chatContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainer.current) {
            chatContainer.current.scrollTo({
                top: chatContainer.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    const feedback = messages[messages.length - 1]?.role === "assistant" && messages[messages.length - 1]?.content.includes("FEEDBACK (DEV INTERNAL):")
        ? messages[messages.length - 1].content.split("FEEDBACK (DEV INTERNAL):")[1]
        : undefined;

    useEffect(() => {
        const cardsMatch = messages[messages.length - 1]?.content.match(/cards:\s*(\[[\s\S]*\])/);
        if (cardsMatch) {
            const sanitizedCards: string = cardsMatch[1];
            localStorage.setItem("cards", JSON.stringify(sanitizedCards));
            window.dispatchEvent(new Event("storage"));
        }
    }, [messages]);

    const handleFinish = () => {
        setFeedbackCounter(prev => prev + 1);
        // if the modulo is 1, save the feedback, that means each N messages, we save the feedback
        if (feedbackCounter % SAVE_FACTOR_INTERVAL === 1) {
            updateUserMutation({
                prevFeedback: feedback?.toString().trim()
            }, {
                onSuccess: () => {
                    addToast({
                        title: t("toastSent"),
                        description: t("toastDescription"),
                        color: "success",
                    });
                },
                onError: (error) => {
                    console.log(error);
                }
            }
            );
            setFeedbackCounter(feedbackCounter + 1);
        }
    }

    const hasCards = messages[messages.length - 1]?.content.includes("cards:");
    
    if (!messages) return null; 
    const renderResponse = () => {
        return (
            <div
                ref={chatContainer}
                className="response space-y-4 overflow-y-auto flex-1 px-4 py-6"
            >
                {messages.length === 0 && (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-4xl mt-10 font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-blue-500 to-purple-500 animate-gradient">
                            {t("description")}
                        </p>
                    </div>
                )}

                {messages.map((m: { id: string, role: string, content: string, createdAt: string }, index: number) => (
                    <div
                        key={m.id}
                        className={`chat-line ${m.role === "user" ? "justify-end" : "justify-start"
                            } flex items-center space-x-3`}
                    >
                        {m.role === "user" ? (
                            <UserIcon className="avatar w-6 h-6 text-blue-600 dark:text-blue-300" />
                        ) : (
                            <Image src="/Speakico/KICO.png" alt="logo" width={80} height={80} />
                        )}

                        <div
                            className={`message p-4 max-w-lg rounded-xl text-sm leading-relaxed shadow-md ${m.role === "user"
                                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white dark:from-blue-600 dark:to-indigo-700"
                                : "bg-gradient-to-br from-gray-200 to-gray-300 text-black dark:from-gray-700 dark:to-gray-800 dark:text-white"
                                }`}
                        >
                            {m.role === "user"
                                ? m.content
                                : index === messages.length - 1 && isLoading
                                    ? <Spinner />
                                    : error
                                        ? <div className="text-red-500">Error: {error.message}</div>
                                        : m.content.split("FEEDBACK (DEV INTERNAL):")[0].split("cards:")[0]}

                            {index === messages.length - 1 && m.role !== "user" && !isLoading && (
                                <div className="space-y-2 mt-4">
                                    <Button
                                        className="w-full text-white bg-gradient-to-r from-red-500 to-orange-400 hover:from-orange-400 hover:to-red-500 dark:from-pink-600 dark:to-yellow-500 dark:hover:from-yellow-500 dark:hover:to-pink-600"
                                        fullWidth
                                        onPress={() => hasCards ? route.push("/cards") : route.push("/practice")}
                                    >
                                        {hasCards ? t("cards") : t("practice")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            {renderResponse()}
            <form
                onSubmit={handleSubmit}
                className="chat-form px-4 py-4"
            >
                <Input
                    name="input-field"
                    type="text"
                    placeholder={
                        messages.length === 0
                            ? t("inputPlaceholder")
                            : undefined
                    }
                    onChange={handleInputChange}
                    value={input}
                    size="lg"
                    fullWidth
                    variant="bordered"
                    className="mb-2"
                    disabled={isPending}
                    endContent={
                        <div className="flex items-center gap-2">
                            <Button
                                type="submit"
                                isIconOnly
                                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-purple-600 hover:to-violet-500 dark:from-purple-700 dark:to-indigo-700 dark:hover:from-indigo-700 dark:hover:to-purple-700 text-white"
                            >
                                <PaperAirplaneIcon className="w-5 h-5" />
                            </Button>
                            <Tooltip
                                content="Clear conversation">
                                <Button
                                    onPress={() => {
                                        clearMessages();
                                    }}
                                    type="submit"
                                    isIconOnly
                                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-purple-600 hover:to-violet-500 dark:from-purple-700 dark:to-indigo-700 dark:hover:from-indigo-700 dark:hover:to-purple-700 text-white"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </Button>
                            </Tooltip>
                        </div>
                    }
                />
            </form>
        </div>
    );
};

export default Chat;
