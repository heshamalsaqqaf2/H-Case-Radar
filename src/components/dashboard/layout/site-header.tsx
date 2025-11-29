"use client";

import { IconBell, IconMaximize, IconSearch } from "@tabler/icons-react";
import { SlashIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/magic-ui/animated-theme-toggler";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 bg-transparent backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky top-0 z-50 border-b border-border/40">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 text-primary hover:bg-primary/10 hover:text-primary" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4 bg-primary/20" />

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <SlashIcon />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Search Bar */}
        <div className="relative mr-auto flex-1 justify-center items-center md:grow-0">
          <IconSearch className="absolute right-3 top-2.5 h-4 w-4 text-primary/70" />
          <input
            type="search"
            placeholder="إبحث عن أي شيء "
            className="rounded-lg bg-transparent pr-10 w-22 focus:w-[300px] h-9 text-sm outline-none focus:ring-1 focus:ring-primary border border-primary/20 text-foreground placeholder:text-muted-foreground/70 shadow-[0_0_10px_rgba(0,242,255,0.05)] transition-all focus:shadow-[0_0_15px_rgba(0,242,255,0.15)]"
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2 ml-4">
          <AnimatedThemeToggler />

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <IconMaximize className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors relative"
          >
            <IconBell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_5px_#00f2ff]" />
          </Button>

          <Avatar className="h-8 w-8 cursor-pointer border border-primary/30 hover:border-primary hover:shadow-[0_0_10px_rgba(0,242,255,0.3)] transition-all ml-2">
            <AvatarImage src="/images/avatar.jpg" alt="User" />
            <AvatarFallback className="bg-primary/10 text-primary">AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
