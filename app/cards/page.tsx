"use client";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "./components/Card";
//@ts-ignore
import Slider from "react-slick";
import { Button } from "@heroui/button";
import Link from "next/link";

export default function Cards() {
    const { t } = useTranslation();
    const [cards, setCards] = useState<{ front: string, back: string }[]>([]);

    useEffect(() => {
        const cards = localStorage.getItem("cards") || "[]";
        setCards(sanitizeAndParse(cards));
    }, []);

    const settings = {
        dots: true,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
    };

    if (cards.length === 0) {
        return <div className="flex flex-col items-center justify-center mt-40">
            <h2 className="text-3xl error-text mb-4">No cards were found.</h2>
            <p className="text-sm text-gray-500">You can create cards by practicing in the chat or practice page.</p>
            <Button className="bg-blue-600 text-white hover:bg-blue-700 transition mt-2">
                <Link href="/chat">
                    {t("cards.createCards")}
                </Link>
            </Button>
        </div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold">{t("cards.title")}</h2>
            <p className="text-sm text-gray-500">Slide through the cards to see the front and back of each card.</p>
            <Slider {...settings}>
                {
                    cards.map((card, index) => {
                        if (!card) return null;
                        return (
                            <Card key={index} front={card.front} back={card.back} />
                        )
                    })
                }
            </Slider>
        </div>
    )
}

const generateCardArray = (cards: string) => {
    if (cards.length === 0) return [];
    const cardsArray = cards?.split('},') || [];
    return cardsArray.map((card) => {
        const [front, back] = card.split('",');
        if (!back || !front) return { front: "", back: "" }
        return { front: front.split('"')[1], back: back.split('"')[1] };
    });
}

function sanitizeAndParse(str: string) {
    const sanitizedStr = str.replace('```json', '').replace('```', '').trim();
    const generatedCards = generateCardArray(JSON.parse(sanitizedStr));
    return generatedCards;
}