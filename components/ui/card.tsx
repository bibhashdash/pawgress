import * as React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            className={cn(
                "rounded-xl border border-border bg-card p-5",
                className,
            )}
            {...props}
        />
    );
}

function CardHeader({ className, ...props }: React.ComponentProps<typeof View>) {
    return <View className={cn("gap-1.5 pb-4", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<typeof Text>) {
    return (
        <Text
            className={cn("text-xl font-bold text-card-foreground", className)}
            {...props}
        />
    );
}

function CardDescription({
    className,
    ...props
}: React.ComponentProps<typeof Text>) {
    return (
        <Text className={cn("text-sm text-muted-foreground", className)} {...props} />
    );
}

function CardContent({ className, ...props }: React.ComponentProps<typeof View>) {
    return <View className={cn("gap-4", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View className={cn("flex-row items-center pt-4", className)} {...props} />
    );
}

export {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
};
