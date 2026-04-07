"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
    rating: number | undefined;
    reviewCount?: number;
    maxStars?: number;
    size?: number;
    className?: string;
}

export default function StarRating({
    rating,
    reviewCount,
    maxStars = 5,
    size = 18,
    className,
    }: StarRatingProps) {
    if (rating === undefined) {
        return <span className="text-muted-foreground">-</span>;
    }

    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
        <div className="flex items-center gap-0.5">
            {Array.from({ length: maxStars }).map((_, index) => {
            const diff = rating - index;

            if (diff >= 1) {
                return (
                <Star
                    key={index}
                    size={size}
                    className="fill-primary text-primary"
                />
                );
            }

            if (diff >= 0.5) {
                return <HalfStar key={index} size={size} />;
            }

            return (
                <Star
                key={index}
                size={size}
                className="fill-muted text-muted"
                />
            );
            })}
        </div>

        <span className="text-sm text-primary">({rating})</span>

        {reviewCount !== undefined && (
            <span className="text-sm text-primary">
            ({reviewCount})
            </span>
        )}
        </div>
    );
}

/* ---------------- HALF STAR ---------------- */

function HalfStar({ size }: { size: number }) {
    return (
        <div
        className="relative"
        style={{ width: size, height: size }}
        >
        {/* Fondo muted completo */}
        <Star
            size={size}
            className="absolute fill-muted text-muted"
        />

        {/* Mitad izquierda secondary */}
        <div
            className="absolute overflow-hidden"
            style={{ width: "50%", height: "100%" }}
        >
            <Star
            size={size}
            className="fill-primary text-primary"
            />
        </div>
        </div>
    );
}