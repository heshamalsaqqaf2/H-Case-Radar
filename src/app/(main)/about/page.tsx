"use client";

import { MedalIcon, SparklesIcon, StarIcon, TargetIcon } from "lucide-react";
import { GravityStarsBackground } from "@/components/ui/animate-ui/backgrounds/gravity-stars";
import AboutUs from "../_components/about-us";

const stats = [
    {
        icon: SparklesIcon,
        value: "20+",
        description: "Years of Experience",
    },
    {
        icon: TargetIcon,
        value: "70+",
        description: "Successful Projects",
    },
    {
        icon: StarIcon,
        value: "550+",
        description: "Customer Reviews",
    },
    {
        icon: MedalIcon,
        value: "25",
        description: "Achieve Awards",
    },
];

export default function AboutPage() {
    return (
        <div>
            <GravityStarsBackground />
            <AboutUs stats={stats} />
        </div>
    );
}
