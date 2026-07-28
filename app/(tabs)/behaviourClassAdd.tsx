import {View, Modal, Pressable} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useCallback, useState} from "react";
import {Text} from "@/components/ui/text";
import {Button} from "@/components/ui/button";
import {router} from "expo-router";
import {useFocusEffect} from "expo-router/react-navigation";
import Toast from "react-native-toast-message";
import type {Id} from "@/convex/_generated/dataModel";
import {BehaviourClassAddForm} from "@/components/BehaviourClass/behaviourClassAddForm";

export default function BehaviourClassAdd () {
    const [formKey, setFormKey] = useState(0);
    const [createdId, setCreatedId] = useState<Id<"behaviourClasses"> | null>(null);

    useFocusEffect(
        useCallback(() => {
            setCreatedId(null);
            setFormKey(k => k + 1);
        }, [])
    );

    const handleAddAnother = () => {
        setCreatedId(null);
        setFormKey(k => k + 1);
    };

    const handleViewDetails = () => {
        if (!createdId) return;
        const id = createdId;
        setCreatedId(null);
        router.push({ pathname: "/(tabs)/behaviourClassDetails/[id]", params: { id } });
    };
    return (
        <SafeAreaView className="flex-1 bg-background" edges={["bottom", "left", "right"]}>

            <View className="px-5 mt-5">
                <BehaviourClassAddForm
                    key={formKey}
                    onCreated={setCreatedId}
                    onError={() => Toast.show({
                        type: "error",
                        text1: "There was an error creating this class",
                    })}
                />
            </View>

            <Modal
                visible={createdId !== null}
                transparent
                animationType="slide"
                onRequestClose={handleAddAnother}
            >
                <Pressable
                    className="flex-1 bg-black/40 justify-end"
                    onPress={handleAddAnother}
                >
                    {/* No-op onPress so taps inside the sheet don't fall through to the backdrop above and close it */}
                    <Pressable onPress={() => {}} className="bg-background rounded-t-xl p-5 pb-12 gap-4">
                        <Text className="text-lg font-semibold">Class successfully created</Text>
                        <View className="flex-row gap-3">
                            <Button onPress={handleAddAnother} variant="outline" className="flex-1">
                                <Text>Add another</Text>
                            </Button>
                            <Button onPress={handleViewDetails} variant="primary" className="flex-1">
                                <Text className="text-white">View details</Text>
                            </Button>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    )
}
