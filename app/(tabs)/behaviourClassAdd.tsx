import {FlatList, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useState} from "react";
import {Text} from "@/components/ui/text";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {CirclePlus} from "lucide-react-native";
import {isStringBlank} from "@/lib/utils";

export default function BehaviourClassAdd () {
    const [title, setTitle] = useState<string>("");
    const [subClass, setSubClass] = useState<string>("");
    const [subClasses, setSubClasses] = useState<string[]>([]);
    return (
        <SafeAreaView className="flex-1 bg-background" edges={["bottom", "left", "right"]}>

            <View className="px-5 mt-5">

                <FlatList
                    contentContainerClassName="gap-2"
                    ListHeaderComponent={
                        <>
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
                        </>
                    }
                    ListFooterComponent={
                        <>
                            <View className="mt-3 pl-20">
                                <View className="flex-row items-center gap-2">
                                    <Input
                                        onSubmitEditing={e => setSubClass(e.nativeEvent.text)} placeholder="Add a subclass" className="flex-1 rounded-md h-[50]" value={subClass} onChangeText={setSubClass} />
                                    <Button onPress={() => {
                                        setSubClasses(prevState => [...prevState, subClass])
                                        setSubClass("")
                                    }} className="p-0 px-1" variant="ghost" disabled={isStringBlank(subClass)}>
                                        <CirclePlus />
                                    </Button>
                                </View>
                            </View>

                            <View className="mt-5">
                                <Button
                                    disabled={isStringBlank(title)}
                                    variant="primary" className="rounded-md">
                                    <Text>Save</Text>
                                </Button>
                            </View>
                        </>
                    }
                    data={ subClasses }
                    renderItem={
                        ({ item }) => (
                            <View className="border border-muted-foreground rounded-md h-[50] pl-5 ml-20 justify-center bg-white">
                                <Text>{item}</Text>
                            </View>
                        )
                    }
                />
            </View>
        </SafeAreaView>
    )
}