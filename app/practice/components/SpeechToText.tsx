import { useState, useRef } from "react";
import { Button } from "@heroui/button";
import { MicrophoneIcon, StopIcon } from "@heroicons/react/24/solid";
import { Textarea } from "@heroui/input";
import AudioPlayer from "./AudioPlayer";
import { useSound } from "../hooks/useSound";
import { useTranslation } from "react-i18next";

interface SpeechToTextProps {
    phrase: string;
    audioSrc: string;
    onConfirm?: (isCorrect: boolean) => void;
}

export default function SpeechToText({ phrase, audioSrc, onConfirm }: SpeechToTextProps) {
    const { t } = useTranslation('common', { keyPrefix: 'practice' });
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef<any>(null);
    const { play } = useSound();
    const handleStart = () => {
        setTranscript("");
        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = "es-ES";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            setTranscript(text);
            setIsRecording(false);
        };

        recognition.onerror = (event: any) => {
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognitionRef.current = recognition;
        setIsRecording(true);
        recognition.start();
    };

    const handleStop = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
    };

    const handleVerify = () => {
        const isValid = transcript.trim().toLowerCase() === phrase.trim().toLowerCase();
        play(isValid);
        if (onConfirm) {
            onConfirm(isValid);
        }
    };

    return (
        <div className="space-y-4 w-full max-w-lg mx-auto">
            <div className="flex items-center gap-2 justify-center">
                <Button
                    isIconOnly
                    onPress={isRecording ? handleStop : handleStart}
                    color={isRecording ? "danger" : "secondary"}
                    className="rounded-full"
                    aria-label={isRecording ? "Stop recording" : "Start recording"}
                >
                    {isRecording ? <StopIcon className="w-7 h-7" /> : <MicrophoneIcon className="w-7 h-7" />}
                </Button>
                <AudioPlayer audioSrc={audioSrc} />
            </div>
            <div className={`text-sm ${isRecording ? "text-red-600" : "text-gray-500"} text-center w-full`}>
                {isRecording ? t("listening") : t("clickTheMic")}
            </div>
            <Textarea
                label={t("yourSpeech")}
                value={transcript}
                readOnly
                placeholder={t("yourSpokenText")}
            />
            <Button
                onPress={handleVerify}
                className="px-4 py-2 rounded light:bg-white dark:bg-black light:text-black dark:text-white"
                fullWidth
                isDisabled={!transcript}
            >
                {t("verifyAnswer")}
            </Button>
            <div className="mt-4 text-sm">
                <span className="font-semibold dark:text-white light:text-black">{t("targetPhrase")}</span> "{phrase}"
            </div>
        </div>
    );
}