import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import AudioPlayer from "./AudioPlayer";
import { useSound } from "../hooks/useSound";
import { useTranslation } from "react-i18next";

interface TWYHProps {
    audioSrc: string;
    phrase: string;
    onConfirm: (isCorrect: { input: string, isValid: boolean }) => void;
}

export default function TWYH({ audioSrc, phrase, onConfirm }: TWYHProps) {
    const { t } = useTranslation('common', { keyPrefix: 'practice' });
    const [input, setInput] = useState("");
    const { play } = useSound();
    const handleVerify = () => {
        const isValid = input.trim().toLowerCase() === phrase.trim().toLowerCase();
        play(isValid);
        onConfirm({ input, isValid });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Input
                    value={input}
                    onChange={e => {
                        setInput(e.target.value);
                    }}
                    placeholder={t("typeWhatYouHear")}
                    classNames={{
                        inputWrapper: "pl-0",
                    }}
                    startContent={
                        <AudioPlayer audioSrc={audioSrc} />
                    }
                />
            </div>
            <Button
                onPress={handleVerify}
                className="light:bg-white dark:bg-black light:text-black dark:text-white"
                fullWidth
            >
                {t("verifyAnswer")}
            </Button>
        </div>
    );
}