import Image from "next/image";
import { FollowerPointerCard } from "@/components/ui/Aceternity-UI/following-pointer";
import { BorderBeam } from "@/components/ui/magic-ui/border-beam";

export function FollowingPointerDemo() {
  return (
    <div className="mx-auto w-80">
      <FollowerPointerCard
        title={
          <TitleComponent
            title={blogContent.author}
            avatar={blogContent.authorAvatar}
          />
        }
      >
        <div className="group relative h-full overflow-hidden rounded-2xl bg-white dark:bg-background transition duration-200 hover:shadow-xl ">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-tl-lg rounded-tr-lg bg-gray-100 dark:bg-zinc-800">
            <Image
              src={blogContent.image}
              width={400}
              height={400}
              alt="thumbnail"
              className="h-full transform object-cover transition duration-200 group-hover:scale-95 group-hover:rounded-2xl"
            />
          </div>
          <div className="p-4">
            <h2 className="my-4 text-lg font-bold text-zinc-700">
              {blogContent.title}
            </h2>
            <h2 className="my-4 text-sm font-normal text-zinc-500">
              {blogContent.description}
            </h2>
            <div className="mt-10 flex flex-row items-center justify-between">
              <span className="text-sm text-gray-500">{blogContent.date}</span>
              <div className="relative z-10 block rounded-xl bg-black px-6 py-2 text-xs font-bold text-white">
                Read More
              </div>
            </div>
          </div>
          {/* <BorderBeam
            duration={4}
            size={300}
            reverse
            className="from-transparent via-green-500 to-transparent"
          /> */}
          <BorderBeam duration={8} size={100} />
        </div>
      </FollowerPointerCard>
    </div>
  );
}

const blogContent = {
  slug: "amazing-tailwindcss-grid-layouts",
  author: "H-CASE RADAR",
  date: "14th March, 2025",
  title: "Complaint Management System For SMEs In Ksa",
  description:
    "Grids are cool, but Tailwindcss grids are cooler. In this article, we will learn how to create amazing Grid layouts with Tailwindcs grid and React.",
  image: "/images/5.jpg",
  authorAvatar: "/images/avatar.jpg",
};

const TitleComponent = ({
  title,
  avatar,
}: {
  title: string;
  avatar: string;
}) => (
  <div className="flex items-center space-x-2">
    <Image
      src={avatar}
      height={20}
      width={20}
      alt="thumbnail"
      className="rounded-full border-2 border-white"
    />
    <p>{title}</p>
  </div>
);
