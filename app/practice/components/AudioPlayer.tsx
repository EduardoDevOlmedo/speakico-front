import { PauseIcon, SpeakerWaveIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";
import { useRef, useState, useEffect } from "react";

export default function AudioPlayer({ audioSrc }: { audioSrc: string }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            setIsPlaying(false);
        };

        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("ended", handleEnded);
        };
    }, [audioSrc]);

    const handlePlayAudio = () => {
        if (isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
            return;
        }
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    return (
        <>
            <audio
                ref={audioRef}
                src={audioSrc}
                style={{ display: "none" }}
            />
            <Button
                isIconOnly
                onPress={handlePlayAudio}
                color="secondary"
                className="flex items-center gap-2 rounded"
                aria-label="Play audio"
            >
                {isPlaying ? <PauseIcon className="w-6 h-6" /> : <SpeakerWaveIcon className="w-6 h-6" />}
            </Button>
        </>
    );
}