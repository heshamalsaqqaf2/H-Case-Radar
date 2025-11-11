"use client";
import { ArrowDownRight, Menu, Star, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ProtectedComponent } from "@/components/auth/protected-component";
import CardFlip from "@/components/main/card-flip";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/magic-ui/animated-theme-toggler";
import { AnimatedTooltipPreview } from "./animated-tooltip";
import { StarsBackgroundDemo } from "./demo-components-backgrounds-stars";
import { FollowingPointerDemo } from "./following-pointer-demo";

interface HeroSectionProps {
  heading?: string;
  description?: string;
  buttons?: {
    primary?: {
      text: string;
      url: string;
    };
    secondary?: {
      text: string;
      url: string;
    };
  };
  reviews?: {
    count: number;
    avatars: {
      src: string;
      alt: string;
    }[];
    rating?: number;
  };
}

export function HeroSection(_props: HeroSectionProps) {
  const menuItems = [
    { name: "Features", href: "#" },
    { name: "Solution", href: "#" },
    { name: "Pricing", href: "#" },
    { name: "About", href: "#" },
  ];
  const [menuState, setMenuState] = useState(false);
  const heading = "H-Case Radar Solution & Manage";
  const description =
    "منصة تابعة لوزارة الصحة في المملكة العربية السعودية في منطقة حائل, تهدف لمساعدة المستفيدين في حلقة الحوادث الطبية والطبيعية والإصابات الطبية.";
  const buttons = {
    primary: {
      text: "Admin",
      url: "/admin/dashboard",
    },
    secondary: {
      text: "Dashboard",
      url: "/dashboard",
    },
  };
  const reviews = {
    count: 200,
    rating: 5.0,
    avatars: [
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
        alt: "Avatar 1",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp",
        alt: "Avatar 2",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
        alt: "Avatar 3",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp",
        alt: "Avatar 4",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp",
        alt: "Avatar 5",
      },
    ],
  };
  return (
    <section className="relative min-h-screen overflow-hidden md:py-0 md:px-20">
      <header className="relative z-10 mb-5">
        <nav
          data-state={menuState && "active"}
          className="relative z-20 w-full"
        >
          <div className="m-auto max-w-5xl px-6">
            <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
              <div className="flex w-full justify-between lg:w-auto">
                <Link
                  href="/"
                  aria-label="home"
                  className="flex items-center space-x-2"
                >
                  <Image src="/next.svg" alt="logo" height={100} width={100} />
                </Link>

                <Button
                  onClick={() => setMenuState(!menuState)}
                  aria-label={menuState === true ? "Close Menu" : "Open Menu"}
                  className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
                >
                  <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                  <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                </Button>
              </div>

              <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                <div className="lg:pr-4">
                  <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                    {menuItems.map((item, index) => (
                      <li key={index.toString()}>
                        <Link
                          href={item.href}
                          className="text-black hover:text-white dark:text-white hover:dark:text-neutral-950 block duration-150"
                        >
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                  <Button asChild variant="default" size="sm">
                    <Link href="/sign-in">
                      <span>Sign In</span>
                    </Link>
                  </Button>

                  <Button asChild size="sm" variant="secondary">
                    <Link href="/sign-up">
                      <span>Sign Up</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <div className="absolute inset-0 z-0">
        {/* <HexagonBackgroundDemo /> */}
        <StarsBackgroundDemo />
      </div>

      <div className="container relative z-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div className="mx-auto flex flex-col items-center text-center md:ml-auto lg:max-w-4xl lg:items-start lg:text-left">
          <h1 className="my-6 text-pretty text-4xl font-bold lg:text-5xl xl:text-6xl">
            {heading}
          </h1>
          <p className="text-white mb-8 max-w-xl lg:text-xl">{description}</p>
          <div className="mb-12 flex w-fit flex-col gap-10 sm:flex-row">
            <span className="inline-flex items-center -space-x-4">
              <AnimatedTooltipPreview />
            </span>
            <div className="mt-1">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    key={index}
                    className="size-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="mr-1 font-semibold">
                  {reviews.rating?.toFixed(1)}
                </span>
              </div>
              <p className="text-muted-foreground text-left font-medium">
                from {reviews.count}+ reviews
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
            {buttons.primary && (
              <Button asChild className="w-full sm:w-auto">
                <Link href={buttons.primary.url}>{buttons.primary.text}</Link>
              </Button>
            )}
            {buttons.secondary && (
              <Button asChild variant="outline">
                <Link href={buttons.secondary.url}>
                  {buttons.secondary.text}
                  <ArrowDownRight className="size-4" />
                </Link>
              </Button>
            )}

            {/* Start Theme Toggler */}
            <AnimatedThemeToggler />
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <FollowingPointerDemo />
          <CardFlip />
        </div>
      </div>
    </section>
  );
}
