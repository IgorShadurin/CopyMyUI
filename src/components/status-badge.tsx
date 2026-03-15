import { type ComponentStatus } from "@prisma/client";

import { getI18n, translateStatus } from "@/i18n/server";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { statusClassMap } from "@/lib/status";

export async function StatusBadge({ status }: { status: ComponentStatus }) {
  const { messages } = await getI18n();

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full border text-[11px] font-semibold", statusClassMap[status])}
    >
      {translateStatus(status, messages)}
    </Badge>
  );
}
