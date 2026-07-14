import { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

export function TabHeader({
    title,
    right,
}: {
    title: string;
    right?: ReactNode;
}) {
    return (
        <View className="h-14 flex-row items-center justify-between px-5">
            <Text className="text-2xl font-bold">{title}</Text>
            {right}
        </View>
    );
}
