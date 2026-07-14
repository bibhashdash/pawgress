import { Slot } from "@rn-primitives/slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Pressable, ActivityIndicator } from "react-native";
import { TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "flex-row items-center justify-center gap-2 rounded-lg",
    {
        variants: {
            variant: {
                default: "bg-primary active:opacity-90",
                destructive: "bg-destructive active:opacity-90",
                outline: "border border-border bg-background active:bg-muted",
                secondary: "bg-secondary active:opacity-90",
                ghost: "active:bg-muted",
                link: "",
            },
            size: {
                default: "h-12 px-5",
                sm: "h-10 px-4",
                lg: "h-14 px-6",
                icon: "size-12",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

const buttonTextVariants = cva("text-base font-semibold", {
    variants: {
        variant: {
            default: "text-primary-foreground",
            destructive: "text-destructive-foreground",
            outline: "text-foreground",
            secondary: "text-secondary-foreground",
            ghost: "text-foreground",
            link: "text-accent underline",
        },
        size: {
            default: "",
            sm: "text-sm",
            lg: "text-lg",
            icon: "",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});

function Button({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    disabled,
    children,
    ...props
}: React.ComponentProps<typeof Pressable> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
        loading?: boolean;
    }) {
    const Component = asChild ? Slot : Pressable;
    return (
        <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
            <Component
                className={cn(
                    buttonVariants({ variant, size }),
                    (disabled || loading) && "opacity-50",
                    className,
                )}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? <ActivityIndicator /> : children}
            </Component>
        </TextClassContext.Provider>
    );
}

export { Button, buttonTextVariants, buttonVariants };
