import * as React from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components";
import { cn } from "@/lib/utils";

export type SectionCardAction = {
  icon?: React.ElementType;
  text: string;
  onClick?: () => void;
  variant?: React.ComponentProps<typeof Button>["variant"];
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
};

export type SectionCardProps = {
  title: React.ReactNode;
  actions?: SectionCardAction[];
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
};

export function SectionCard({
  title,
  actions,
  children,
  className,
  headerClassName,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className={cn("border-b px-3 py-2", headerClassName)}>
        <CardTitle className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 min-w-0">{title}</div>
          {actions && actions.length > 0 ? (
            <div className="flex items-center gap-2 shrink-0">
              {actions.map((a, i) => {
                const Icon = a.icon;
                return (
                  <Button
                    key={i}
                    variant={a.variant || "default"}
                    size="sm"
                    className={cn(a.className)}
                    aria-label={a.ariaLabel || a.text}
                    onClick={a.onClick}
                    disabled={a.disabled}
                  >
                    {Icon ? <Icon className="size-4" /> : null}
                    <span>{a.text}</span>
                  </Button>
                );
              })}
            </div>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className={cn("p-3", contentClassName)}>{children}</CardContent>
    </Card>
  );
}

export default SectionCard;
