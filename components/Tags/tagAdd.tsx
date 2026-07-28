import {View, Pressable} from "react-native";
import {Text} from "@/components/ui/text";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Square} from "lucide-react-native";
import {useState} from "react";
import {useMutation, useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import {TAG_COLOR_PRESETS} from "@/lib/tagColors";

// Shared add-tag form: used inline in Settings (toggled open/closed) and
// embedded directly in the onboarding carousel (always visible, no cancel).
export const TagAdd = ({onResult, onCancel, onAdded}: {
    onResult: (result: { label: string, message: string }) => void,
    onCancel?: () => void,
    onAdded?: () => void,
}) => {
    const addTag = useMutation(api.tags.create)
    const [newTagName, setNewTagName] = useState<string>("")
    const [newTagColor, setNewTagColor] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const addNewTag = () => {
        setIsLoading(true)
        addTag({
            name: newTagName,
            color: newTagColor || "#64748b",
        }).then(() => {
            onResult({
                label: "success",
                message: "Tag successfully added"
            })
            setNewTagName("")
            setNewTagColor("")
            onAdded?.()
        })
            .catch(() => {
                onResult({
                    label: "error",
                    message: "There was an error adding the tag"
                })
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    return (
        <View className="gap-3 bg-popover border border-input rounded-md p-4">
            <Text className="font-semibold">Tag name</Text>
            <Input
                className="rounded-md h-[50] w-full border border-input bg-white"
                value={newTagName} onChangeText={setNewTagName}
                onSubmitEditing={() => addNewTag()}
                readOnly={isLoading}
            />
            <Text className="font-semibold">Tag Color</Text>
            <View className="flex-row flex-wrap gap-3">
                {
                    TAG_COLOR_PRESETS.map((color) => (
                        <Pressable key={color.hex} onPress={() => setNewTagColor(color.hex)}>
                            <Square
                                strokeWidth={newTagColor === color.hex ? 1 : 0}
                                stroke={newTagColor === color.hex ? "#000" : ""}
                                size={40} color={color.hex} fill={color.hex}
                            />
                        </Pressable>
                    ))
                }
            </View>
            <View className="flex-row gap-2 flex-1">
                {onCancel && (
                    <Button onPress={onCancel} disabled={isLoading} className="flex-1" variant="outline">
                        <Text>Cancel</Text>
                    </Button>
                )}
                <Button
                    loading={isLoading}
                    onPress={addNewTag}
                    disabled={!newTagName || !newTagColor || isLoading}
                    className="flex-1 mt-10" variant="primary">
                    <Text className="text-white">Submit</Text>
                </Button>
            </View>
        </View>
    )
}
