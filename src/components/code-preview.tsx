"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { useI18n } from "@/i18n/client";
import { SourceThemeToggle } from "@/components/source-theme-toggle";
import { Button } from "@/components/ui/button";
import {
  getInitialSourceTheme,
  readStoredSourceTheme,
  storeSourceTheme,
  type SourceTheme,
} from "@/lib/source-theme";
import { cn } from "@/lib/utils";

const maxCollapsedLines = 42;

export function CodePreview({
  code,
  className,
  desktopAlignBottomToId,
  containerThemeTargetId,
}: {
  code: string;
  className?: string;
  desktopAlignBottomToId?: string;
  containerThemeTargetId?: string;
}) {
  const { messages } = useI18n();
  const rootRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const hasRestoredThemeRef = useRef(false);
  const [expanded, setExpanded] = useState(false);
  const [sourceTheme, setSourceTheme] = useState<SourceTheme>(getInitialSourceTheme);
  const lineCount = code.split(/\r?\n/).length;
  const [canExpand, setCanExpand] = useState(lineCount > maxCollapsedLines);
  const [desktopCollapsedHeight, setDesktopCollapsedHeight] = useState<number | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      hasRestoredThemeRef.current = true;
      setSourceTheme(readStoredSourceTheme());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hasRestoredThemeRef.current) {
      return;
    }

    storeSourceTheme(sourceTheme);
  }, [sourceTheme]);

  useEffect(() => {
    if (!containerThemeTargetId) {
      return;
    }

    const container = document.getElementById(containerThemeTargetId);
    if (!container) {
      return;
    }

    container.setAttribute("data-source-theme", sourceTheme);
  }, [containerThemeTargetId, sourceTheme]);

  useEffect(() => {
    let frame = 0;
    const applyFallback = () => {
      const fallbackExpand = lineCount > maxCollapsedLines;
      setDesktopCollapsedHeight((current) => (current === null ? current : null));
      setCanExpand((current) => (current === fallbackExpand ? current : fallbackExpand));
    };

    if (!desktopAlignBottomToId) {
      frame = window.requestAnimationFrame(applyFallback);
      return () => window.cancelAnimationFrame(frame);
    }

    const measure = () => {
      const root = rootRef.current;
      const pre = preRef.current;
      const target = document.getElementById(desktopAlignBottomToId);
      const isDesktop = window.matchMedia("(min-width: 1280px)").matches;

      if (!root || !pre || !target || !isDesktop) {
        applyFallback();
        return;
      }

      const rootBottom = root.getBoundingClientRect().bottom;
      const preRect = pre.getBoundingClientRect();
      const preTop = preRect.top;
      const belowPreviewOffset = Math.max(0, rootBottom - preRect.bottom);
      const targetBottom = target.getBoundingClientRect().bottom;
      const alignmentFudge = 1;
      const available = targetBottom - preTop - belowPreviewOffset - alignmentFudge;
      const nextHeight = Math.max(280, available);

      if (!Number.isFinite(nextHeight)) {
        return;
      }

      const overflow = pre.scrollHeight > nextHeight + 1;
      const nextCollapsedHeight = overflow ? nextHeight : null;

      setDesktopCollapsedHeight((current) => {
        if (current === null && nextCollapsedHeight === null) {
          return current;
        }
        if (
          current !== null &&
          nextCollapsedHeight !== null &&
          Math.abs(current - nextCollapsedHeight) < 0.5
        ) {
          return current;
        }
        return nextCollapsedHeight;
      });
      setCanExpand((current) => (current === overflow ? current : overflow));
    };

    frame = window.requestAnimationFrame(measure);
    window.addEventListener("resize", measure);

    const target = document.getElementById(desktopAlignBottomToId);
    const root = rootRef.current;
    const pre = preRef.current;
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            measure();
          })
        : null;

    if (resizeObserver && target) {
      resizeObserver.observe(target);
      if (root) {
        resizeObserver.observe(root);
      }
      if (pre) {
        resizeObserver.observe(pre);
      }
    }

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      resizeObserver?.disconnect();
    };
  }, [desktopAlignBottomToId, expanded, lineCount]);

  return (
    <div ref={rootRef} className={cn("flex min-h-0 flex-col pb-4 sm:pb-5", className)}>
      <div className="mb-3 flex justify-end">
        <SourceThemeToggle
          value={sourceTheme}
          onChange={setSourceTheme}
          surface={sourceTheme}
        />
      </div>
      <div
        className={cn(
          "flex min-h-0 flex-1 overflow-hidden rounded-[1.6rem] border",
          sourceTheme === "dark" ? "border-white/10 bg-white/5" : "border-black/10 bg-[#f7f7f8]"
        )}
      >
        <pre
          ref={preRef}
          style={
            canExpand && !expanded && desktopCollapsedHeight
              ? { maxHeight: `${desktopCollapsedHeight}px` }
              : undefined
          }
          className={cn(
            "code-scrollbar h-full min-h-0 overflow-auto p-4 text-[12px] leading-6 sm:p-5 sm:text-[13px]",
            sourceTheme === "dark" ? "text-white/85" : "text-foreground",
            canExpand && !expanded
              ? "max-h-[66vh] lg:max-h-[74vh]"
              : ""
          )}
        >
          <code>{code}</code>
        </pre>
      </div>

      {canExpand ? (
        <div className="mt-3 flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "rounded-full",
              sourceTheme === "dark"
                ? "border-white/20 bg-white/10 text-white hover:bg-white/15"
                : "border-black/12 bg-white text-foreground hover:bg-muted"
            )}
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            {expanded ? messages.codeCopy.collapse : messages.codeCopy.expand}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
