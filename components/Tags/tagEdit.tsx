import {TextInput, View, Modal, Pressable, FlatList} from "react-native";
import {Text} from "@/components/ui/text";
import {useEffect, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {CheckIcon, Trash2Icon, X, Square} from "lucide-react-native";
import {Input} from "@/components/ui/input";
import {useMutation} from "convex/react";
import {api} from "@/convex/_generated/api";
import type {Doc} from "@/convex/_generated/dataModel";
import {TAG_COLOR_PRESETS} from "@/lib/tagColors";
import {cn} from "@/lib/utils";

export const TagEdit = ({tag, onResult}: {
    tag: Doc<"tags">,
    onResult: (result: { label: string, message: string }) => void,
}) => {
    const updateTag = useMutation(api.tags.update)
    const removeTag = useMutation(api.tags.remove)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const [editMode, setEditMode] = useState<boolean>(false)
    const [deleteMode, setDeleteMode] = useState<boolean>(false)
    const [newTagName, setNewTagName] = useState<string>(tag.name)
    const [colorPickerOpen, setColorPickerOpen] = useState<boolean>(false);
    const [newTagColor, setNewTagColor] = useState<string>(tag.color);
    const inputRef = useRef<TextInput>(null)

    useEffect(() => {
        setEditMode(false)
        setNewTagName(tag.name)
        setNewTagColor(tag.color)
    }, []);

    const saveTag = (newColor?: string) => {
        setIsLoading(true)
        updateTag({
            id: tag._id,
            name: newTagName,
            color: newColor ?? tag.color,
        }).then(() => {
            onResult({
                label: "Success",
                message: "Tag successfully updated"
            })
        })
            .catch(() => {
                onResult({
                    label: "Error",
                    message: "There was an error updating the tag"
                })
            })
            .finally(() => {
                setIsLoading(false)
                setEditMode(false)
            })
    }

    const deleteTag = () => {
        setIsDeleting(true)
        removeTag({
            id: tag._id,
        }).then(() => {
            onResult({
                label: "Success",
                message: "Tag successfully deleted"
            })
        })
            .catch(() => {
                onResult({
                    label: "Error",
                    message: "There was an error deleting the tag"
                })
            })
            .finally(() => {
                setIsDeleting(false)
                setDeleteMode(false)
            })
    }

    return (
        <View className="gap-2">
            <View className="flex-row gap-3 items-center">
                <Button variant="icon" className="p-0" onPress={() => setColorPickerOpen(true)}>
                    <Square size={40} color={newTagColor} fill={newTagColor} />
                </Button>
                <View className="flex-1">
                    <Input
                        ref={inputRef}
                        onFocus={() => {
                            if (!deleteMode) setEditMode(true)
                        }}
                        className="rounded-md h-[50] w-full border border-input bg-white"
                        value={newTagName} onChangeText={setNewTagName}
                        readOnly={isLoading || isDeleting}
                        onSubmitEditing={() => saveTag()}
                    />
                </View>
                <View className="flex-row gap-3">
                    <Button
                        loading={isLoading}
                        disabled={isLoading || isDeleting || !editMode}
                        onPress={() => saveTag()} variant="icon" size="sm" className="p-0">
                        <CheckIcon color="#16a34a"/>
                    </Button>

                    {
                        (editMode || deleteMode)
                            ? <Button
                                variant="icon" size="sm" className="p-0"
                                onPress={() => {
                                    if (editMode) {
                                        setNewTagName(tag.name)
                                        setEditMode(false)
                                    } else if (deleteMode) {
                                        setDeleteMode(false)
                                    }
                                }}>
                                <X />
                            </Button>
                            : <Button onPress={() => setDeleteMode(true)} variant="icon" size="sm" className="p-0">
                                <Trash2Icon/>
                            </Button>
                    }
                </View>
            </View>
            {
                deleteMode
                && <View className="items-end gap-2">
                    <Text>Remove tag?</Text>
                    <View className="flex-row gap-2">
                        <Button onPress={() => setDeleteMode(false)} variant="outline">
                            <Text>Cancel</Text>
                        </Button>
                        <Button loading={isDeleting} disabled={isDeleting} onPress={() => deleteTag()} variant="destructive">
                            <Text className="text-white">Confirm</Text>
                        </Button>
                    </View>
                </View>
            }
            <Modal
                visible={colorPickerOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setColorPickerOpen(false)}
            >
                <Pressable
                    className="flex-1 bg-black/40 justify-end"
                    onPress={() => setColorPickerOpen(false)}
                >
                    {/* No-op onPress so taps inside the sheet don't fall through to the backdrop above and close it */}
                    <Pressable onPress={() => {}} className="bg-background rounded-t-xl max-h-[70%] pb-6">
                        <Text className="text-lg font-semibold px-5 py-4">Select a color</Text>
                        <FlatList
                            data={TAG_COLOR_PRESETS ?? []}
                            keyExtractor={(item) => item.hex}
                            ItemSeparatorComponent={() => <View className="h-px bg-border" />}
                            ListEmptyComponent={
                                <Text className="px-5 py-4 text-muted-foreground">No categories yet.</Text>
                            }
                            renderItem={({item}) => (
                                <Pressable
                                    onPress={() => {
                                        setNewTagColor(item.hex);
                                        setColorPickerOpen(false);
                                        saveTag(item.hex)
                                    }}
                                    className="px-5 py-4 flex-row justify-between items-center"
                                >
                                    <Text className={cn(item.hex === newTagColor && "text-accent font-semibold")}>
                                        {item.name}
                                    </Text>
                                    <Square size={40} color={item.hex} fill={item.hex} />
                                </Pressable>
                            )}
                        />
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    )
}
