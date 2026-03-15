import Link from "next/link";

import { UserRole } from "@prisma/client";
import {
  Bookmark,
  LayoutTemplate,
  Menu,
  Plus,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { type AppLocale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { withLocalePath } from "@/i18n/routing";
import { type Viewer } from "@/lib/viewer";
import { googleSignInAction, signOutAction } from "@/lib/actions/auth-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function initials(name: string | null | undefined) {
  return (name ?? "CM")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function SiteHeader({
  viewer,
  locale,
  messages,
}: {
  viewer: Viewer | null;
  locale: AppLocale;
  messages: Messages;
}) {
  const isStaff = viewer && viewer.role !== UserRole.USER;
  const isAdmin = viewer?.role === UserRole.ADMIN;

  return (
    <header className="sticky top-0 z-50 border-b border-black/6 bg-[rgba(252,251,247,0.88)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-4 xl:gap-8">
          <Link href={withLocalePath(locale, "/")} className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f97316_0%,#fb7185_45%,#0ea5e9_100%)] text-sm font-bold text-white shadow-lg sm:size-10">
              CM
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold tracking-tight text-foreground sm:text-lg">
                {messages.app.name}
              </p>
            </div>
          </Link>
        </div>

        <div className="hidden items-center gap-3 xl:flex">
          {viewer ? (
            <>
              <Link
                href={withLocalePath(locale, "/dashboard/components/new")}
                className={cn(buttonVariants({ size: "sm" }), "rounded-full")}
              >
                <Plus className="size-4" />
                {messages.header.newComponent}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "h-12 items-center gap-3 rounded-full border-black/8 bg-white/90 px-2.5 shadow-sm"
                  )}
                  aria-label={messages.header.menu}
                >
                  <Avatar size="sm">
                    <AvatarImage
                      src={viewer.image ?? undefined}
                      alt={viewer.name ?? messages.common.user}
                    />
                    <AvatarFallback>{initials(viewer.name)}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-28 truncate text-left font-medium text-foreground">
                    {viewer.name ?? messages.common.signedIn}
                  </span>
                  <Menu className="size-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={12}
                  className="min-w-64 rounded-[1.4rem] border border-black/6 bg-[rgba(252,251,247,0.98)] p-3 shadow-[0_26px_80px_-48px_rgba(22,18,12,0.42)] backdrop-blur"
                >
                  <div className="mb-3 flex items-center gap-3 rounded-[1rem] border border-black/6 bg-white/90 px-3 py-2.5">
                    <Avatar size="sm">
                      <AvatarImage
                        src={viewer.image ?? undefined}
                        alt={viewer.name ?? messages.common.user}
                      />
                      <AvatarFallback>{initials(viewer.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {viewer.name ?? messages.common.signedIn}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{viewer.email}</p>
                    </div>
                  </div>

                  <div className="grid gap-1 rounded-[1rem] border border-black/6 bg-white/90 p-1.5">
                    <DropdownMenuItem
                      render={<Link href={withLocalePath(locale, "/dashboard")} />}
                      className="justify-start rounded-[0.8rem] px-3 py-2.5"
                    >
                      <LayoutTemplate className="size-4" />
                      {messages.header.dashboard}
                    </DropdownMenuItem>
                    {isStaff ? (
                      <DropdownMenuItem
                        render={<Link href={withLocalePath(locale, "/moderation")} />}
                        className="justify-start rounded-[0.8rem] px-3 py-2.5"
                      >
                        <ShieldCheck className="size-4" />
                        {messages.header.moderation}
                      </DropdownMenuItem>
                    ) : null}
                    {isAdmin ? (
                      <DropdownMenuItem
                        render={<Link href={withLocalePath(locale, "/admin")} />}
                        className="justify-start rounded-[0.8rem] px-3 py-2.5"
                      >
                        <SlidersHorizontal className="size-4" />
                        {messages.header.admin}
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem
                      render={<Link href={withLocalePath(locale, "/favorites")} />}
                      className="justify-start rounded-[0.8rem] px-3 py-2.5"
                    >
                      <Bookmark className="size-4" />
                      {messages.header.favorites}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      render={<Link href={withLocalePath(locale, "/purchases")} />}
                      className="justify-start rounded-[0.8rem] px-3 py-2.5"
                    >
                      <ShoppingBag className="size-4" />
                      {messages.header.purchases}
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator className="my-3 bg-black/6" />

                  <form action={signOutAction}>
                    <Button type="submit" variant="outline" size="sm" className="w-full rounded-full">
                      {messages.header.signOut}
                    </Button>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <form action={googleSignInAction}>
              <Button type="submit" size="sm" className="rounded-full">
                {messages.header.signInWithGoogle}
              </Button>
            </form>
          )}
          <LocaleSwitcher
            locale={locale}
            label={messages.localeSwitcher.label}
            languageLabels={messages.languages}
            className="flex"
          />
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          {!viewer ? (
            <form action={googleSignInAction}>
              <Button type="submit" size="sm" className="rounded-full px-4 sm:px-5">
                {messages.header.signInWithGoogle}
              </Button>
            </form>
          ) : null}

          <Dialog>
            <DialogTrigger
              render={
                <Button
                  variant="outline"
                  size={viewer ? "sm" : "icon-sm"}
                  className={cn(
                    "rounded-full border-black/8 bg-white/90 shadow-sm",
                    viewer ? "h-12 max-w-[min(17rem,calc(100vw-8rem))] gap-3 px-2.5" : ""
                  )}
                  aria-label={messages.header.menu}
                />
              }
            >
              {viewer ? (
                <>
                  <Avatar size="sm">
                    <AvatarImage
                      src={viewer.image ?? undefined}
                      alt={viewer.name ?? messages.common.user}
                    />
                    <AvatarFallback>{initials(viewer.name)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate text-left font-medium text-foreground">
                    {viewer.name ?? messages.common.signedIn}
                  </span>
                  <Menu className="size-4 shrink-0 text-muted-foreground" />
                </>
              ) : (
                <Menu className="size-4" />
              )}
            </DialogTrigger>

            <DialogContent className="w-[min(23rem,calc(100vw-2rem))] rounded-[1.8rem] border border-black/6 bg-[rgba(252,251,247,0.98)] p-4 shadow-[0_35px_90px_-45px_rgba(22,18,12,0.45)] backdrop-blur">
              <div className="space-y-4">
                <DialogHeader className="sr-only">
                  <DialogTitle>{messages.header.menu}</DialogTitle>
                  <DialogDescription>{messages.app.description}</DialogDescription>
                </DialogHeader>

                {viewer ? (
                  <div className="flex items-center gap-3 rounded-[1.4rem] border border-black/6 bg-white/90 px-4 py-3">
                    <Avatar size="sm" className="size-10">
                      <AvatarImage
                        src={viewer.image ?? undefined}
                        alt={viewer.name ?? messages.common.user}
                      />
                      <AvatarFallback>{initials(viewer.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {viewer.name ?? messages.common.signedIn}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{viewer.email}</p>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-2 rounded-[1.4rem] border border-black/6 bg-white/90 p-2">
                  {viewer ? (
                    <Link
                      href={withLocalePath(locale, "/dashboard/components/new")}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "justify-start rounded-[1rem] px-3"
                      )}
                    >
                      <Plus className="size-4" />
                      {messages.header.newComponent}
                    </Link>
                  ) : null}
                </div>

                <LocaleSwitcher
                  locale={locale}
                  label={messages.localeSwitcher.label}
                  languageLabels={messages.languages}
                  className="w-full"
                />

                {viewer ? (
                  <div className="rounded-[1.4rem] border border-black/6 bg-white/90 p-2">
                    <div className="grid gap-2">
                      <Link
                        href={withLocalePath(locale, "/dashboard")}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "justify-start rounded-[1rem] px-3"
                        )}
                      >
                        <LayoutTemplate className="size-4" />
                        {messages.header.dashboard}
                      </Link>
                      {isStaff ? (
                        <Link
                          href={withLocalePath(locale, "/moderation")}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "justify-start rounded-[1rem] px-3"
                          )}
                        >
                          <ShieldCheck className="size-4" />
                          {messages.header.moderation}
                        </Link>
                      ) : null}
                      {isAdmin ? (
                        <Link
                          href={withLocalePath(locale, "/admin")}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "justify-start rounded-[1rem] px-3"
                          )}
                        >
                          <SlidersHorizontal className="size-4" />
                          {messages.header.admin}
                        </Link>
                      ) : null}
                      <Link
                        href={withLocalePath(locale, "/favorites")}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "justify-start rounded-[1rem] px-3"
                        )}
                      >
                        <Bookmark className="size-4" />
                        {messages.header.favorites}
                      </Link>
                      <Link
                        href={withLocalePath(locale, "/purchases")}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "justify-start rounded-[1rem] px-3"
                        )}
                      >
                        <ShoppingBag className="size-4" />
                        {messages.header.purchases}
                      </Link>
                      <form action={signOutAction}>
                        <Button type="submit" variant="outline" size="sm" className="w-full rounded-full">
                          {messages.header.signOut}
                        </Button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <form action={googleSignInAction}>
                    <Button type="submit" size="sm" className="w-full rounded-full">
                      {messages.header.signInWithGoogle}
                    </Button>
                  </form>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
