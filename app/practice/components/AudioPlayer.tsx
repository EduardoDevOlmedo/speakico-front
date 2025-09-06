"use client";

import { PauseIcon, SpeakerWaveIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";
import { useRef, useState, useEffect } from "react";

export default function AudioPlayer({ audioSrc }: { audioSrc: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockRef = useRef(false); // For mobile unlock

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    audioRef.current = new Audio(audioSrc);
    audioRef.current.onended = () => setIsPlaying(false);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.onended = null;
      }
    };
  }, [audioSrc]);

  const handlePlayAudio = () => {
    if (!audioRef.current) return;

    if (!unlockRef.current) {
      audioRef.current.play().catch(() => {
      });
      unlockRef.current = true;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  return (
    <Button
      isIconOnly
      onPress={handlePlayAudio}
      color="secondary"
      className="flex items-center gap-2 rounded"
      aria-label="Play audio"
    >
      {isPlaying ? <PauseIcon className="w-6 h-6" /> : <SpeakerWaveIcon className="w-6 h-6" />}
    </Button>
  );
}
