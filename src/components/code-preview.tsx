"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { useI18n } from "@/i18n/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const maxCollapsedLines = 42;

export function CodePreview({
  code,
  className,
  desktopAlignBottomToId,
}: {
  code: string;
  className?: string;
  desktopAlignBottomToId?: string;
}) {
  const { messages } = useI18n();
  const rootRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [expanded, setExpanded] = useState(false);
  const lineCount = code.split(/\r?\n/).length;
  const [canExpand, setCanExpand] = useState(lineCount > maxCollapsedLines);
  const [desktopCollapsedHeight, setDesktopCollapsedHeight] = useState<number | null>(null);

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
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5">
        <pre
          ref={preRef}
          style={
            canExpand && !expanded && desktopCollapsedHeight
              ? { maxHeight: `${desktopCollapsedHeight}px` }
              : undefined
          }
          className={cn(
            "code-scrollbar h-full min-h-0 overflow-auto p-4 text-[12px] leading-6 text-white/85 sm:p-5 sm:text-[13px]",
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
            className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15"
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
