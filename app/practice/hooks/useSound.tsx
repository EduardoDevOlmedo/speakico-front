"use client";
import { useSound as useSoundHook } from "use-sound";

export const useSound = () => {

    const [playCorrectSound] = useSoundHook('/SpeaKico/happy.mp3', {
        volume: 0.6,
        playbackRate: 1,
        soundEnabled: true,
        interrupt: false,
        onload: () => {
            console.log("Correct sound loaded");
        }
    });

    const [playIncorrectSound] = useSoundHook('/SpeaKico/angry.mp3', {
        volume: 0.6,
        playbackRate: 1,
        soundEnabled: true,
        interrupt: false,
        onload: () => {
            console.log("Incorrect sound loaded");
        }
    });

    const play = (isValid: boolean) => {
        if (isValid) {
            playCorrectSound();
        } else {
            playIncorrectSound();
        }
    };

    return {
        play
    };
};