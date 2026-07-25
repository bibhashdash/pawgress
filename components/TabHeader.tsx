import { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

export function TabHeader({
    title,
    right,
    left
}: {
    title: string;
    right?: ReactNode;
    left?: ReactNode;
}) {
    return (
    <View className="h-14 flex-row items-center justify-between px-5">
            <View className="flex-row items-center">
                {left}
                <Text className="text-2xl font-bold">{title}</Text>
            </View>
            {right}
        </View>
    );
}
