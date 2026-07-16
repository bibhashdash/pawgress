import {Pressable, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useState} from "react";
import {Text} from "@/components/ui/text";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {CirclePlus} from "lucide-react-native";

export default function BehaviourClassAdd () {
    const [title, setTitle] = useState<string>("");
    const [subClasses, setSubClasses] = useState<string[]>([]);
    const [subClassEditMode, setSubClassEditMode] = useState<boolean>(false);
    return (
        <SafeAreaView className="flex-1 bg-background" edges={["bottom", "left", "right"]}>

            <View className="px-5 mt-5">
                <Text className="mb-2">Add, rename, or remove the categories and behaviors you log
                    against. Renaming relabels
                    matching past logs (and re-syncs them); removing keeps the logs but drops the class
                    from the
                    picker.
                </Text>

                <View className="mt-5">
                    <Text className="mb-2">Name</Text>
                    <Input className="rounded-md h-[50]" value={title} onChangeText={setTitle} />
                </View>

                <View className="mt-5 pl-24">
                    <View className="flex-row items-center gap-2">
                        <Pressable>
                            <CirclePlus />
                        </Pressable>
                        <View className="rounded-md border-2 border-muted flex-1 py-4 pl-3">
                            <Text className="text-muted-foreground">Add a subclass</Text>
                        </View>
                    </View>
                </View>

                <View className="mt-5">
                    <Button variant="primary" className="rounded-md">
                        <Text>Save</Text>
                    </Button>
                </View>
            </View>
        </SafeAreaView>
    )
}