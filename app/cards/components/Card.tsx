"use client"
import ReactCardFlip from 'react-card-flip';
import { Button } from "@heroui/button";
import { Card as HeroCard, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { useState } from "react";


export default function Card({ front, back }: { front: string, back: string }) {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    }

    return (
        <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
            <HeroCard className="card-container" style={{ cursor: 'pointer', width: '500px', height: '400px', margin: '20px' }}>
                <CardBody onClick={handleFlip} className="text-center h-full justify-center items-center">
                    <p className="text-2xl font-bold">{front}</p>
                </CardBody>
            </HeroCard>
            <HeroCard className="card-container" style={{ cursor: 'pointer', width: '500px', height: '400px', margin: '20px' }}>
                <CardBody onClick={handleFlip} className="text-center h-full justify-center items-center">
                    <p className="text-2xl font-bold">{back}</p>
                </CardBody>
            </HeroCard>
        </ReactCardFlip>
    )
}