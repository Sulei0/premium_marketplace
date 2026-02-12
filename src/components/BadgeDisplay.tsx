import React from "react";
import { ShieldCheck, Crown } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type BadgeType = "verified_seller" | "admin";

interface BadgeConfig {
    icon: React.ElementType;
    label: string;
    description: string;
    className: string;
}

export const BADGE_CONFIG: Record<BadgeType, BadgeConfig> = {
    verified_seller: {
        icon: ShieldCheck,
        label: "Onaylanmış Satıcı",
        description: "Bu satıcının kimliği ve güvenilirliği platform tarafından doğrulanmıştır.",
        className: "text-blue-500 fill-blue-500/10",
    },
    admin: {
        icon: Crown,
        label: "Admin",
        description: "Giyenden Platform Yöneticisi.",
        className: "text-yellow-500 fill-yellow-500/10",
    },
};

interface BadgeDisplayProps {
    badges: string[]; // We receive raw strings from DB
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function BadgeDisplay({ badges, className, size = "md" }: BadgeDisplayProps) {
    if (!badges || badges.length === 0) return null;

    const iconSizes = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
    };

    return (
        <div className={cn("flex items-center gap-1.5", className)}>
            <TooltipProvider delayDuration={300}>
                {badges.map((badgeKey) => {
                    const config = BADGE_CONFIG[badgeKey as BadgeType];
                    if (!config) return null;

                    const Icon = config.icon;

                    return (
                        <Tooltip key={badgeKey}>
                            <TooltipTrigger asChild>
                                <div
                                    className={cn(
                                        "cursor-help transition-transform hover:scale-110",
                                        config.className
                                    )}
                                >
                                    <Icon className={cn(iconSizes[size])} strokeWidth={2.5} />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-popover/95 backdrop-blur-sm border-border">
                                <div className="space-y-1">
                                    <p className="font-semibold text-sm flex items-center gap-1.5">
                                        <Icon className="w-3.5 h-3.5" />
                                        {config.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {config.description}
                                    </p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </TooltipProvider>
        </div>
    );
}
