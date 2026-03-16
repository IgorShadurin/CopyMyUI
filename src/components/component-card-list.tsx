import { ComponentCard } from "@/components/component-card";
import type { ComponentCard as ComponentCardModel } from "@/lib/server/component-service";
import { cn } from "@/lib/utils";

export function ComponentCardList({
  components,
  className,
  showFavorite = true,
}: {
  components: ComponentCardModel[];
  className?: string;
  showFavorite?: boolean;
}) {
  return (
    <div className={cn("grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4", className)}>
      {components.map((component) => (
        <ComponentCard
          key={component.id}
          component={component}
          showFavorite={showFavorite}
        />
      ))}
    </div>
  );
}
