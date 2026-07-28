import {Modal, Pressable, TextInput, View} from "react-native";
import {Text} from "@/components/ui/text";
import {useCallback, useEffect, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {CheckIcon, Trash2Icon, X} from "lucide-react-native";
import {Input} from "@/components/ui/input";
import {useFocusEffect} from "expo-router/react-navigation";
import {useMutation} from "convex/react";
import {api} from "@/convex/_generated/api";
import type {Doc} from "@/convex/_generated/dataModel";

export const SubclassEdit = ({subclass, onResult}: {
    subclass: Doc<"subclasses">,
    onResult: (result: { label: string, message: string }) => void,
}) => {
    const updateSubclass = useMutation(api.subclasses.update)
    const removeSubclass = useMutation(api.subclasses.remove)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const [editMode, setEditMode] = useState<boolean>(false)
    const [deleteMode, setDeleteMode] = useState<boolean>(false)
    const [newSubclassName, setNewSubclassName] = useState<string>(subclass.name)
    const inputRef = useRef<TextInput>(null)

    useFocusEffect(
        useCallback(() => {
            setEditMode(false);
            setNewSubclassName(subclass.name);
        }, [])
    );

    useEffect(() => {
        setNewSubclassName(subclass.name)
    }, [subclass.name]);

    const saveSubclass = () => {
        setIsLoading(true)
        updateSubclass({
            id: subclass._id,
            name: newSubclassName,
        }).then(() => {
            onResult({
                label: "success",
                message: "Subclass successfully updated"
            })
        })
            .catch(() => {
                onResult({
                    label: "error",
                    message: "There was an error updating the Subclass"
                })
            })
            .finally(() => {
                setIsLoading(false)
                setEditMode(false)
            })
    }

    const deleteSubclass = () => {
        setIsDeleting(true)
        removeSubclass({
            id: subclass._id,
        }).then(() => {
            onResult({
                label: "success",
                message: "Subclass successfully deleted"
            })
        })
            .catch(() => {
                onResult({
                    label: "error",
                    message: "There was an error deleting the Subclass"
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
                <View
                    className="flex-1">
                    <Input
                        ref={inputRef}
                        onFocus={() => {
                            if (!deleteMode) setEditMode(true)
                        }}
                        className={`rounded-md h-[50] w-full border border-input bg-white`}
                        value={newSubclassName} onChangeText={setNewSubclassName}
                        readOnly={isLoading || isDeleting}
                        onSubmitEditing={() => saveSubclass()}
                    />
                </View>
                <View className="flex-row gap-3">
                    <Button
                        loading={isLoading}
                        disabled={isLoading || isDeleting || !editMode}
                        onPress={() => saveSubclass() } variant="icon" size="sm" className="p-0">
                        <CheckIcon color="#16a34a"/>
                    </Button>

                    {
                        (editMode)
                            ? <Button
                                variant="icon" size="sm" className="p-0"
                                onPress={() => {
                                    if (editMode) {
                                        setNewSubclassName(subclass.name)
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
            <Modal
                visible={deleteMode}
                transparent
                animationType="slide"
                onRequestClose={() => setDeleteMode(false)}
            >
                <Pressable
                    className="flex-1 bg-black/40 justify-end"
                    onPress={() => setDeleteMode(false)}
                >
                    {/* No-op onPress so taps inside the sheet don't fall through to the backdrop above and close it */}
                    <Pressable onPress={() => {}} className="bg-background rounded-t-xl p-5 pb-12 gap-4">
                        <Text className="text-lg font-semibold">Delete this subclass?</Text>
                        <Text className="text-muted-foreground">This action cannot be undone.</Text>
                        <View className="flex-row gap-3">
                            <Button
                                onPress={() => setDeleteMode(false)}
                                disabled={isDeleting}
                                variant="outline" className="flex-1">
                                <Text>Cancel</Text>
                            </Button>
                            <Button
                                onPress={deleteSubclass}
                                loading={isDeleting}
                                disabled={isDeleting}
                                variant="destructive" className="flex-1">
                                <Text className="text-white">Delete</Text>
                            </Button>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    )
}
