import { ArrowDownRight, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MagicCard } from "@/components/ui/magic-ui/magic-card";
import { AnimatedTooltipPreview } from "./animated-tooltip";
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

const HeroSection = ({
  heading = "H-Case Radar Solution & Manage",
  description = "منصة تابعة لوزارة الصحة في المملكة العربية السعودية في منطقة حائل, تهدف لمساعدة المستفيدين في حلقة الحوادث الطبية والطبيعية والإصابات الطبية.",

  buttons = {
    primary: {
      text: "Sign In",
      url: "/sign-in",
    },
    secondary: {
      text: "Get Admin",
      url: "/admin",
    },
  },
  reviews = {
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
  },
}: HeroSectionProps) => {
  return (
    <section>
      <div className="container grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div className="mx-auto flex flex-col items-center text-center md:ml-auto lg:max-w-4xl lg:items-start lg:text-left">
          <h1 className="my-6 text-pretty text-4xl font-bold lg:text-5xl xl:text-6xl">
            {heading}
          </h1>
          <p className="text-muted-foreground mb-8 max-w-xl lg:text-xl">
            {description}
          </p>
          <div className="mb-12 flex w-fit flex-col gap-10 sm:flex-row">
            <span className="inline-flex items-center -space-x-4">
              {/* {reviews.avatars.map((avatar, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <Avatar key={index} className="size-12 border">
                  <AvatarImage src={avatar.src} alt={avatar.alt} />
                </Avatar>
              ))} */}
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
          </div>
        </div>
        <div className="">
          <FollowingPointerDemo />
        </div>
      </div>
    </section>
  );
};

export { HeroSection };
