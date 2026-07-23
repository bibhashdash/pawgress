import {FlatList, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useState} from "react";
import {Text} from "@/components/ui/text";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {CirclePlus, EditIcon, X} from "lucide-react-native";
import {isStringBlank} from "@/lib/utils";
import {useMutation} from "convex/react";
import {api} from "@/convex/_generated/api";
import {router} from "expo-router";

export default function BehaviourClassAdd () {
    const [title, setTitle] = useState<string>("");
    const [subClass, setSubClass] = useState<string>("");
    const [subClasses, setSubClasses] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>();
    const createBehaviourClass = useMutation(api.behaviourClasses.create);

    const handleSubmit = () => {
        setIsLoading(true);
        createBehaviourClass({
            title,
            subclasses: subClasses.length > 0 ? subClasses : undefined,
        }).then(
            id => router.push({ pathname: "/(tabs)/behaviourClassDetails/[id]", params: { id } }),
        ).catch(
            err => setError(err)
        ).finally(() => setIsLoading(false))
    }
    return (
        <SafeAreaView className="flex-1 bg-background" edges={["bottom", "left", "right"]}>

            <View className="px-5 mt-5">

                <FlatList
                    contentContainerClassName="gap-2"
                    ListHeaderComponent={
                        <>
                            <Text className="mb-2">Add a category and behaviors you log against.
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
                                        onSubmitEditing={e => {
                                            setSubClasses(prevState => [...prevState, subClass])
                                            setSubClass("")
                                        }} placeholder="Add a subclass" className="flex-1 rounded-md h-[50]" value={subClass} onChangeText={setSubClass} />
                                    <Button onPress={() => {
                                        setSubClasses(prevState => [...prevState, subClass])
                                        setSubClass("")
                                    }} className="p-0 px-1" variant="icon" disabled={isStringBlank(subClass)}>
                                        <CirclePlus />
                                    </Button>
                                </View>
                            </View>

                            <View className="mt-5">
                                <Button
                                    disabled={isStringBlank(title)}
                                    onPress={() => handleSubmit()}
                                    variant="primary" className="rounded-md">
                                    <Text>Save</Text>
                                </Button>
                            </View>
                        </>
                    }
                    data={ subClasses }
                    renderItem={
                        ({ item }) => (
                            <View className="border border-gray-400 rounded-md h-[50] px-5 ml-20 bg-white flex-row justify-between items-center">
                                <Text>{item}</Text>
                                <View className="flex-row gap-3">
                                    <Button variant="icon" size="sm" className="p-0">
                                        <EditIcon />
                                    </Button>

                                    <Button variant="icon" size="sm" className="p-0">
                                        <X />
                                    </Button>
                                </View>
                            </View>
                        )
                    }
                />
            </View>
        </SafeAreaView>
    )
}