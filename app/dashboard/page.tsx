"use client";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { DocumentTextIcon, MicrophoneIcon, SpeakerWaveIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { Spinner } from "@heroui/spinner";

const statCards = [
    {
        key: "audioSuccessRate",
        label: "audioSuccessRate",
        color: "from-blue-400 to-blue-600",
        icon: (
            <SpeakerWaveIcon className="w-8 h-8 text-blue-500 dark:text-blue-300" />
        ),
    },
    {
        key: "speechSuccessRate",
        label: "speechSuccessRate",
        color: "from-green-400 to-green-600",
        icon: (
            <MicrophoneIcon className="w-8 h-8 text-green-500 dark:text-green-300" />
        ),
    },
    {
        key: "textSuccessRate",
        label: "textSuccessRate",
        color: "from-purple-400 to-purple-600",
        icon: (
            <DocumentTextIcon className="w-8 h-8 text-purple-500 dark:text-purple-300" />
        ),
    },
];



const LanguageHashmap = {
    "en": "english",
    "es": "spanish",
}

export default function Dashboard() {
    const { user, hydrated } = useAuthStore();
    const { t } = useTranslation('common', { keyPrefix: 'dashboard' });
    // Calculate average success rate
    const rates = [
        user?.audioSuccessRate,
        user?.speechSuccessRate,
        user?.textSuccessRate,
    ].filter((r) => typeof r === "number" && !isNaN(r)) as number[];

    const averageSuccessRate =
        rates.length > 0
            ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
            : undefined;

    const interests = user?.interests.split(",");

    function formatRate(rate?: number) {
        if (typeof rate !== "number" || isNaN(rate) || rate === 0) return t("noData");
        return `${Math.round(rate)}%`;
    }

    function formatNumber(num?: number) {
        if (typeof num !== "number" || isNaN(num) || num === 0) return t("noData");
        return num.toLocaleString();
    }

    return (
        <div className="py-4 px-4">
            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white ">
                Hello, {user?.name ?? t("loading")}
            </h1>
            {/* 2 cards in a row on md, 1 per row on sm */}
            <div className="mb-8 mt-10 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                {statCards.slice(0, 2).map((card) => (
                    <Card
                        key={card.key}
                        className={`bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-indigo-950 dark:via-purple-950 dark:to-black shadow-2xl border border-gray-300/50 dark:border-indigo-700/30`}
                    >
                        <CardHeader className="flex items-center gap-3">
                            <div className="rounded-full bg-gray-200/80 dark:bg-white/5 backdrop-blur-sm p-2 border border-gray-300/50 dark:border-white/10">
                                {card.icon}
                            </div>
                            <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {t(card.label)}
                            </span>
                        </CardHeader>
                        <CardBody>
                            <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 text-center">
                                {/* @ts-ignore */}
                                {formatRate(user?.[card.key] ?? 0)}
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
            {/* 1 card in a row on md, 1 per row on sm */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-1 gap-6">
                {statCards.slice(2, 3).map((card) => (
                    <Card
                        key={card.key}
                        className={`bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-indigo-950 dark:via-purple-950 dark:to-black shadow-2xl border border-gray-300/50 dark:border-indigo-700/30`}
                    >
                        <CardHeader className="flex items-center gap-3">
                            <div className="rounded-full bg-gray-200/80 dark:bg-white/5 backdrop-blur-sm p-2 border border-gray-300/50 dark:border-white/10">
                                {card.icon}
                            </div>
                            <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {t(card.label)}
                            </span>
                        </CardHeader>
                        <CardBody>
                            <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 text-center">
                                {/* @ts-ignore */}
                                {formatRate(user?.[card.key] ?? 0)}
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {/* Total Attempts */}
                <Card className={`bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-indigo-950 dark:via-purple-950 dark:to-black shadow-2xl border border-gray-300/50 dark:border-indigo-700/30`}>
                    <CardHeader>
                        <span className="text-lg font-semibold text-gray-800 dark:text-white">
                            {t("totalAttempts")}
                        </span>
                    </CardHeader>
                    <CardBody>
                        <div className="text-3xl font-bold text-gray-800 dark:text-white text-center">
                            {formatNumber(user?.totalAttempts ?? 0)}
                        </div>
                    </CardBody>
                </Card>
                {/* Interests */}
                <Card className={`bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-indigo-950 dark:via-purple-950 dark:to-black shadow-2xl border border-gray-300/50 dark:border-indigo-700/30`}>
                    <CardHeader>
                        <span className="text-lg font-semibold text-gray-800 dark:text-white">
                            {t("interests")}
                        </span>
                    </CardHeader>
                    <CardBody>
                        <div className="flex gap-2 justify-center flex-wrap">
                            {Array.isArray(interests) && interests.length > 0 && hydrated ? (
                                interests.map((interest: string, idx: number) => (
                                    <span
                                        key={idx}
                                        className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-2 py-0.5 rounded-full text-sm"
                                    >
                                        {interest}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-500 dark:text-gray-400">{t("noInterests")}</span>
                            )}
                        </div>
                    </CardBody>
                </Card>
                {/* Average Success Rate */}
                <Card className={`bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-indigo-950 dark:via-purple-950 dark:to-black shadow-2xl border border-gray-300/50 dark:border-indigo-700/30`}>
                    <CardHeader>
                        <span className="text-lg font-semibold text-gray-800 dark:text-white">
                            {t("averageSuccessRate")}
                        </span>
                    </CardHeader>
                    <CardBody>
                        <div className="text-3xl font-bold text-gray-800 dark:text-white text-center">
                            {formatRate(averageSuccessRate)}
                        </div>
                    </CardBody>
                </Card>
            </div>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Assistant Feedback */}
                <Card className={`bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-indigo-950 dark:via-purple-950 dark:to-black shadow-2xl border border-gray-300/50 dark:border-indigo-700/30`}>
                    <CardHeader>
                        <span className="text-lg font-semibold text-gray-800 dark:text-white">
                            {t("assistantFeedback")}
                        </span>
                    </CardHeader>
                    <CardBody>
                        <div className="text-3xl font-bold text-gray-800 dark:text-white text-center">
                            {hydrated ? user?.prevFeedback ?? t("noFeedback") : <Spinner />}
                        </div>
                    </CardBody>
                </Card>
                {/* Target Language */}
                <Card className={`bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-indigo-950 dark:via-purple-950 dark:to-black shadow-2xl border border-gray-300/50 dark:border-indigo-700/30`}>
                    <CardHeader>
                        <span className="text-lg font-semibold text-gray-800 dark:text-white">
                            {t("targetLanguage")}
                        </span>
                    </CardHeader>
                    <CardBody>
                        <div className="text-3xl font-bold text-gray-800 dark:text-white text-center">
                            {t(LanguageHashmap[user?.targetLanguage as keyof typeof LanguageHashmap] || "noTargetLanguage")}
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}