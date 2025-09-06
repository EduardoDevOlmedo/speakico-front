"use client";
import { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Button } from "@heroui/button";
import dynamic from "next/dynamic";
import { Spinner } from "@heroui/spinner";
import { useGenerate } from "./actions/useGenerate";
import { addToast } from "@heroui/toast";
import Link from "next/link";
import { useUpdateUser } from "./actions/useUpdate";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { checkGrammar } from "@/app/api/grammar/grammar-check";
import { mapGrammarCheckResponse } from "./utils";
const TWYH = dynamic(() => import('./components/TWYH'), {
    ssr: false,
    loading: () => <Spinner />
})

const SpeechToText = dynamic(() => import('./components/SpeechToText'), {
    ssr: false,
    loading: () => <Spinner />
})

const PhraseOrderSelector = dynamic(() => import('./components/BlockOrder'), {
    ssr: false,
    loading: () => <Spinner />
})

const IncorrectToast = ({  mostSimilar, incorrectWord }: { mostSimilar?: string, incorrectWord?: string }) => {
    const { t } = useTranslation('common', { keyPrefix: 'practice' });
    return (
        <div className="flex items-center">
            <Image src="/SpeaKico/angry kico.png" alt="Angry" width={85} height={85} />
            <div className="flex flex-col">
                {t("toasts.incorrect")}
                {incorrectWord && mostSimilar && <p className="text-sm mt-2">{t("toasts.hint")} <span className="font-bold">{incorrectWord}</span> {t("toasts.for")} <span className="font-bold">{mostSimilar}</span></p>}
            </div>
        </div>
    )
}

const CorrectToast = () => {
    const { t } = useTranslation('common', { keyPrefix: 'practice' });
    return (
        <div className="flex items-center">
            <Image src="/SpeaKico/happy kico.png" alt="Happy" width={85} height={85} />
            {t("toasts.correct")}
        </div>
    )
}


export default function Practice() {
    const { t } = useTranslation('common', { keyPrefix: 'practice' });
    const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(true);
    const { exercises, isLoading, error } = useGenerate();
    const [activeStep, setActiveStep] = useState(0);
    const [attempt, setAttempt] = useState({
        audio: 0,
        text: 0,
        speech: 0,
    });
    const { updateUserMutation, error: updateUserError } = useUpdateUser();


    const steps = [
        {
            label: t("audioPractice"), content: <TWYH audioSrc={exercises?.[activeStep]?.audio || ""} phrase={exercises?.[activeStep]?.phrase || ""}
                onConfirm={async ({ input, isValid }) => {
                    setAttempt({ ...attempt, audio: attempt.audio + 1 });
                    if (isValid) {
                        setIsNextButtonDisabled(false);
                        addToast({
                            description: <CorrectToast />,
                            color: "success",
                            hideIcon: true,
                        });
                    } else {
                        const res = await checkGrammar(input);
                        const { mostSimilar, incorrectWord } = mapGrammarCheckResponse(res, input);

                        setIsNextButtonDisabled(true);
                        addToast({
                            description: <IncorrectToast mostSimilar={mostSimilar} incorrectWord={incorrectWord} />,
                            color: "danger",
                            hideIcon: true,
                        });
                    }
                }}
            />
        },
        {
            label: t("textPractice"), content: <PhraseOrderSelector audioSrc={exercises?.[activeStep]?.audio || ""} phrase={exercises?.[activeStep]?.phrase || ""} onConfirm={({ isValid }) => {
                setAttempt({ ...attempt, text: attempt.text + 1 });
                if (isValid) {
                    setIsNextButtonDisabled(false);
                    addToast({
                        description: <CorrectToast />,
                        color: "success",
                        hideIcon: true,
                    });
                } else {
                    setIsNextButtonDisabled(true);
                    addToast({
                        description: <IncorrectToast />,
                        color: "danger",
                        hideIcon: true,
                    });
                }
            }} />
        },
        {
            label: t("speechPractice"), content: <SpeechToText
                audioSrc={exercises?.[activeStep]?.audio || ""}
                phrase={exercises?.[activeStep]?.phrase || ""}
                onConfirm={(isCorrect) => {
                    setAttempt({ ...attempt, speech: attempt.speech + 1 });
                    if (isCorrect) {
                        setIsNextButtonDisabled(false);
                        addToast({
                            description: <CorrectToast />,
                            color: "success",
                            hideIcon: true,
                        });
                    } else {
                        setIsNextButtonDisabled(true);
                        addToast({
                            description: <IncorrectToast />,
                            color: "danger",
                            hideIcon: true,
                        });
                    }
                }}
            />
        },
        {
            label: t("audioPractice2"), content: <TWYH audioSrc={exercises?.[1]?.audio || ""} phrase={exercises?.[1]?.phrase || ""}
                onConfirm={async ({ input, isValid }) => {
                    setAttempt({ ...attempt, audio: attempt.audio + 1 });
                    if (isValid) {
                        setIsNextButtonDisabled(false);
                        addToast({
                            description: <CorrectToast />,
                            color: "success",
                            hideIcon: true,
                        });
                    } else {
                        const res = await checkGrammar(input);
                        const { mostSimilar, incorrectWord } = mapGrammarCheckResponse(res, input);

                        setIsNextButtonDisabled(true);
                        addToast({
                            description: <IncorrectToast mostSimilar={mostSimilar} incorrectWord={incorrectWord} />,
                            color: "danger",
                            hideIcon: true,
                        });
                    }
                }}
            />
        },
    ];

    const [completed, setCompleted] = useState<boolean[]>(Array(steps.length).fill(false));
    const [showResult, setShowResult] = useState(false);

    const handleNext = () => {
        const newCompleted = [...completed];
        newCompleted[activeStep] = true;
        setCompleted(newCompleted);
        if (activeStep < steps.length - 1) {
            setActiveStep(activeStep + 1);
            setIsNextButtonDisabled(true);
        } else {
            setShowResult(true);

        }
    };

    const audioSuccess = attempt.audio > 0 ? (1 / attempt.audio) * 100 : 0;
    const textSuccess = attempt.text > 0 ? (1 / attempt.text) * 100 : 0;
    const speechSuccess = attempt.speech > 0 ? (1 / attempt.speech) * 100 : 0;
    const totalAttempts = attempt.audio + attempt.text + attempt.speech;


    const { setUser, user } = useAuthStore();


    return (
        <div className="pt-20 flex flex-col items-center justify-center">
            <div className="w-full max-w-4xl space-y-8">
                <h2 className="text-3xl font-bold text-center mb-6 dark:text-white">
                    {t("title")}
                </h2>
                <div className="flex justify-between items-center mb-8">
                    {steps.map((step, idx) => (
                        <div
                            key={step.label} className="flex flex-col items-center flex-1 cursor-default" onClick={() => {
                                if (idx === activeStep) {
                                    setActiveStep(idx);
                                }
                            }}>
                            <div
                                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 
                                ${completed[idx] ? "border-blue-600 bg-blue-100 text-blue-700" : ""}
                                ${idx === activeStep ? "border-blue-500 bg-white text-blue-700" : ""}
                                ${!completed[idx] && idx !== activeStep ? "border-gray-300 bg-gray-100 text-gray-400" : ""}
                                font-bold text-lg transition-colors`}
                            >
                                {completed[idx] ? (
                                    <CheckCircleIcon className="w-7 h-7 text-blue-600" />
                                ) : (
                                    idx + 1
                                )}
                            </div>
                            <div
                                className={`h-1 w-full mt-1 mb-1 transition-colors ${idx === activeStep
                                    ? "bg-blue-400"
                                    : "bg-gray-200"
                                    }`}
                            />
                        </div>
                    ))}
                </div>
                {/* Step Content */}
                {!showResult ? (
                    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-indigo-950 dark:via-purple-950 dark:to-black shadow-2xl border border-gray-300/50 dark:border-indigo-700/30">
                        <h3 className="text-xl mb-2r text-gray-800 dark:text-gray-100 mb-2">{steps[activeStep].label}</h3>
                        {isLoading ?
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                                <p className="text-gray-800 dark:text-gray-400">{t("generatingExercises")}</p>
                                <Spinner />
                            </div> :
                            error ?
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <p className="text-red-500">{t("errorGeneratingExercises")}</p>
                                </div> :
                                steps[activeStep].content}
                        <Button
                            as="button"
                            className="mt-6 w-full px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                            onPress={() => {
                                if (activeStep === steps.length - 1) {
                                    updateUserMutation({
                                        totalAttempts,
                                        audioSuccessRate: audioSuccess,
                                        speechSuccessRate: speechSuccess,
                                        textSuccessRate: textSuccess,
                                    });
                                    setUser({
                                        ...user!,
                                        totalAttempts,
                                        audioSuccessRate: audioSuccess,
                                        speechSuccessRate: speechSuccess,
                                        textSuccessRate: textSuccess,
                                    })
                                    if (updateUserError) {
                                        addToast({
                                            title: "Error!",
                                            description: t("toasts.errorUpdatingUser"),
                                            color: "danger",
                                        });
                                    }
                                    else {
                                        addToast({
                                            title: "Success!",
                                            description: t("toasts.successUpdatingUser"),
                                            color: "success",
                                        });
                                    }
                                }
                                handleNext();
                            }}
                            isDisabled={isNextButtonDisabled}
                        >
                            {activeStep < steps.length - 1 ? t("next") : t("finish")}
                        </Button>
                        {activeStep > 0 && (
                            <Button
                                as="button"
                                className="mt-4 w-full px-4 py-2 rounded-lg font-semibold bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
                                onPress={() => {
                                    setActiveStep(activeStep - 1);
                                }}
                            >
                                {t("previous")}
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="bg-blue-100 rounded-xl shadow p-8 flex flex-col items-center">
                        <CheckCircleIcon className="w-12 h-12 text-blue-600 mb-2" />
                        <h4 className="text-2xl font-bold text-blue-700 mb-2">{t("congratulations")}</h4>
                        <p className="text-lg text-blue-800 text-center">
                            {t("completed")} <Link
                                className="text-blue-600 hover:text-blue-700 underline"
                                href="/chat">chat</Link>.
                        </p>
                        <Button
                            as="button"
                            className="mt-6 w-full px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                            onPress={() => {
                                location.reload();
                            }}
                        >
                            {t("startOver")}
                        </Button>
                    </div>
                )}
            </div>
        </div >
    );
}