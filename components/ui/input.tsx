import * as React from "react";
import { TextInput } from "react-native";
import { cn } from "@/lib/utils";

function Input({
    className,
    placeholderClassName,
    ...props
}: React.ComponentProps<typeof TextInput> & {
    ref?: React.RefObject<TextInput | null>;
}) {
    return (
        <TextInput
            className={cn(
                "h-12 rounded-lg border border-input font-sans bg-background px-4 text-base text-foreground",
                props.editable === false && "opacity-50",
                className,
            )}
            placeholderClassName={cn("text-muted-foreground", placeholderClassName)}
            {...props}
        />
    );
}

export { Input };
