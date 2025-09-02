"use client";
import React, { useState } from "react";
import { Card } from "@heroui/card";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@heroui/button";
import { shuffleArray } from "../utils";
import { useAuthStore } from "@/store/useAuthStore";
import AudioPlayer from "./AudioPlayer";
import { useSound } from "../hooks/useSound";
import { useTranslation } from "react-i18next";
function DraggableWord({ word, index, moveWord }: { word: string, index: number, moveWord: (fromIndex: number, toIndex: number) => void }) {
  const [{ isDragging }, dragRef] = useDrag({
    type: "WORD",
    item: { index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [, dropRef] = useDrop({
    accept: "WORD",
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveWord(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <Card
      ref={(node) => {
        dragRef(node);
        dropRef(node);
      }}
      className={`px-4 py-2 cursor-move transition ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      {word}
    </Card>
  );
}


export default function PhraseOrderSelector({
  phrase = "This is a sample phrase",
  audioSrc,
  onConfirm = () => { },
}: {
  phrase: string;
  audioSrc: string;
  onConfirm: ({ isValid, input }: { isValid: boolean, input: string }) => void;
}) {
  const { t } = useTranslation('common', { keyPrefix: 'practice' });
  const words = phrase.split(" ");
  const { user } = useAuthStore();
  const [order, setOrder] = useState(shuffleArray(words, user?.level || "basic"));
  const { play } = useSound();
  const moveWord = (fromIndex: number, toIndex: number) => {
    const updated = [...order];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setOrder(updated);
  };

  const handleConfirm = () => {
    const isCorrect = order.join(" ") === words.join(" ");
    play(isCorrect);
    onConfirm({ isValid: isCorrect, input: order.join(" ") });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-4 flex-wrap justify-center border-b border-gray-300 pb-4">
          {order.map((word, i) => (
            <DraggableWord key={i} word={word} index={i} moveWord={moveWord} />
          ))}
          <AudioPlayer audioSrc={audioSrc} />
        </div>
        <Button
          className="light:bg-white dark:bg-black light:text-black dark:text-white"
          fullWidth onPress={() => handleConfirm()}>
          {t("verifyAnswer")}
        </Button>
      </div>
    </DndProvider>
  );
}
