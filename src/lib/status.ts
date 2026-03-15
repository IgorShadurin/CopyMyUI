import { ComponentStatus } from "@prisma/client";

export const statusClassMap: Record<ComponentStatus, string> = {
  [ComponentStatus.DRAFT]:
    "border-amber-200 bg-amber-50 text-amber-700",
  [ComponentStatus.PENDING_REVIEW]:
    "border-sky-200 bg-sky-50 text-sky-700",
  [ComponentStatus.APPROVED]:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  [ComponentStatus.DECLINED]:
    "border-rose-200 bg-rose-50 text-rose-700",
};
