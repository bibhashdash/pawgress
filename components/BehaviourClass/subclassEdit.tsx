import {TextInput, View} from "react-native";
import {useCallback, useEffect, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {CheckIcon, Trash2Icon, X} from "lucide-react-native";
import {Input} from "@/components/ui/input";
import {useFocusEffect} from "expo-router/react-navigation";
import {useMutation} from "convex/react";
import {api} from "@/convex/_generated/api";
import type {Id} from "@/convex/_generated/dataModel";

export const SubclassEdit = ({subclass, subclasses, onDeletePress, behaviour}: {
    subclass: string,
    onDeletePress: (subclass: string) => void,
    subclasses: string[],
    behaviour: {
        _id: Id<"behaviourClasses">
        _creationTime: number
        subclasses?: string[] | undefined
        ownerId: string
        title: string
    } | null | undefined


}) => {
    const updateBehaviourClass = useMutation(api.behaviourClasses.update)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [editMode, setEditMode] = useState<boolean>(false)
    const [newSubclassName, setNewSubclassName] = useState<string>(subclass)
    const inputRef = useRef<TextInput>(null)

    useFocusEffect(
        useCallback(() => {
            setEditMode(false);
            setNewSubclassName(subclass);
        }, [])
    );

    useEffect(() => {
        setNewSubclassName(subclass)
    }, [subclass]);

    return (
        <View className="flex-row gap-3 items-center">
            <View
                className="flex-1 ml-20">
                <Input
                    ref={inputRef}
                    onFocus={() => setEditMode(true)}
                    className={`rounded-md h-[50] w-full border border-input bg-white`}
                    value={newSubclassName} onChangeText={setNewSubclassName}
                    readOnly={isLoading}
                />
            </View>
            <View className="flex-row gap-3">
                <Button
                    loading={isLoading}
                    disabled={isLoading || !editMode}
                    onPress={() => {
                        setIsLoading(true)
                        if (subclasses && behaviour && behaviour.subclasses) {
                            let newArray;
                            const index = behaviour.subclasses.indexOf(subclass)
                            if (index > -1) {
                                newArray = behaviour.subclasses.toSpliced(index, 1, newSubclassName)
                                updateBehaviourClass({
                                    id: behaviour._id as Id<"behaviourClasses">,
                                    title: behaviour.title,
                                    subclasses: newArray && newArray.length > 0 ? newArray : undefined,
                                }).then(() => {
                                    //     some sort of success toast
                                    setIsLoading(false)
                                })
                                    .catch(() => {
                                        setIsLoading(false)

                                    }).finally(() => setIsLoading(false))
                            }
                        }
                        setEditMode(false)
                    }} variant="icon" size="sm" className="p-0">
                    <CheckIcon color="#16a34a"/>
                </Button>

                {
                    editMode
                        ? <Button
                            variant="icon" size="sm" className="p-0"
                            onPress={() => {
                                setNewSubclassName(subclass)
                                setEditMode(false)
                            }}>
                            <X />
                        </Button>
                        : <Button onPress={() => onDeletePress(subclass)} variant="icon" size="sm" className="p-0">
                            <Trash2Icon/>
                        </Button>
                }
            </View>
        </View>
    )
}