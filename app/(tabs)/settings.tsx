import {SafeAreaView} from "react-native-safe-area-context";
import {api} from "@/convex/_generated/api";
import {TabHeader} from "@/components/TabHeader";
import {useAuth, useUser} from "@clerk/expo";
import {View, Image, Alert, Pressable} from "react-native";
import {Text} from "@/components/ui/text";
import {X, EditIcon, LogOut, PlusCircle, Square} from "lucide-react-native";
import {useCallback, useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {useMutation, useQuery} from "convex/react";
import {TagEdit} from "@/components/Tags/tagEdit";
import {useFocusEffect} from "expo-router/react-navigation";
import {KeyboardAwareScrollView} from "react-native-keyboard-controller";
import {Input} from "@/components/ui/input";
import {TAG_COLOR_PRESETS} from "@/lib/tagColors";
import {isStringBlank} from "@/lib/utils";
export default function Settings() {
    const {user} = useUser();
    const [editVisible, setEditVisible] = useState(false);
    const addTag = useMutation(api.tags.create)

    const {signOut} = useAuth();
    const tags = useQuery(api.tags.list);
    const [showAddTag, setShowAddTag] = useState(false);
    const [firstName, setFirstName] = useState(user?.firstName ?? "");
    const [lastName, setLastName] = useState(user?.lastName ?? "");
    const [newTagName, setNewTagName] = useState<string>("")
    const [newTagColor, setNewTagColor] = useState<string>("#64748b");
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false)

    const [result, setResult] = useState<{
        label: string,
        message: string
    } | null>(null)

    useEffect(() => {
        if (result !== null) {
            Alert.alert(
                result.label,
                result.message,
                [
                    {
                        text: 'Ok',
                        onPress: () => setResult(null),
                        style: 'default',
                    },
                ]
            );
        }
    }, [result]);

    useFocusEffect(
        useCallback(() => {
            setShowAddTag(false);
            setNewTagName("")
            setNewTagColor("")
            setFirstName(user?.firstName ?? "")
            setLastName(user?.lastName ?? "")
            setEditVisible(false)
        }, [])
    );

    const addNewTag = () => {
        setIsLoading(true)
        addTag({
            name: newTagName,
            color: newTagColor ?? "#64748b",
        }).then(() => {
            setResult({
                label: "Success",
                message: "Tag successfully added"
            })
        })
            .catch(() => {
                setResult({
                    label: "Error",
                    message: "There was an error adding the tag"
                })
            })
            .finally(() => {
                setIsLoading(false)
                setShowAddTag(false);
                setNewTagName("")
                setNewTagColor("")
            })
    }

    const updateUserDetails = () => {
        setIsUpdatingProfile(true)
        user?.update({
            firstName,
            lastName,
        }).then(() => {
            setResult({
                label: "Success",
                message: "Profile successfully updated"
            })
            setEditVisible(false)
        })
            .catch(() => {
                setResult({
                    label: "Error",
                    message: "There was an error updating your profile"
                })
            })
            .finally(() => {
                setIsUpdatingProfile(false)
            })
    }

    const handleSignOut = () => {
        Alert.alert("Sign out", "Are you sure you want to sign out?", [
            {text: "Cancel", style: "cancel"},
            {text: "Sign out", style: "destructive", onPress: () => signOut()},
        ]);
    };
    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <TabHeader
                title="Settings"
                right={
                    <Button className="p-0" variant="icon" onPress={handleSignOut}>
                        <LogOut />
                    </Button>
                }
            />
            <KeyboardAwareScrollView
                className="px-5 mt-5"
                bottomOffset={20}
                keyboardShouldPersistTaps="handled"
            >
                <View className="px-6 mt-4 gap-3">
                    <View className="items-center">
                        <Image src={user?.imageUrl} className="rounded-full w-[96] h-[96]"/>
                        <Text className="text-base  text-primary">{user?.primaryEmailAddress?.emailAddress}</Text>
                    </View>

                    <View className="gap-4">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-lg font-bold text-primary">Profile</Text>
                            {
                                editVisible
                                ? <Button className="p-0" variant="icon" onPress={() => {
                                        setEditVisible(false)
                                    setLastName(user?.lastName ?? "")
                                    setFirstName(user?.firstName ?? "")
                                    }}>
                                        <X color="#22333B"/>
                                    </Button>
                                    : <Button className="p-0" variant="icon" onPress={() => setEditVisible(true)}>
                                        <EditIcon color="#22333B"/>
                                    </Button>
                            }

                        </View>

                        <View className="gap-1">
                            <Text className="text-xs font-semibold text-muted-foreground">First name</Text>
                            <Input onChangeText={text => setFirstName(text)} value={firstName} readOnly={!editVisible || isUpdatingProfile} className={`rounded-md text-primary ${editVisible ? "bg-white" : ""}`} />
                        </View>

                        <View className="gap-1">
                            <Text className="text-xs font-semibold text-muted-foreground">Last name</Text>
                            <Input onChangeText={text => setLastName(text)} value={lastName} readOnly={!editVisible || isUpdatingProfile} className={`rounded-md text-primary ${editVisible ? "bg-white" : ""}`} />
                        </View>
                        {
                            editVisible && (
                                <View className="flex-row gap-2 flex-1">
                                    <Button disabled={isUpdatingProfile} onPress={() => {
                                        setFirstName(user?.firstName ?? "")
                                        setLastName(user?.lastName ?? "")
                                        setEditVisible(false)

                                    }} className="flex-1" variant="outline">
                                        <Text>Cancel</Text>
                                    </Button>
                                    <Button
                                        disabled={isStringBlank(firstName) || isUpdatingProfile}
                                        loading={isUpdatingProfile}
                                        onPress={updateUserDetails}
                                        className="flex-1" variant="primary">
                                        <Text className="text-white">Submit</Text>
                                    </Button>

                                </View>
                            )
                        }
                    </View>

                    <View className="gap-2 mt-4 flex-row justify-between">
                        <Text className="text-lg font-bold text-primary">Tags</Text>
                        {!showAddTag
                            ? <Button variant="icon" className="p-0 m-0" onPress={() => setShowAddTag(true)}>
                                <PlusCircle/>
                            </Button>
                            : <Button variant="icon" className="p-0 m-0" onPress={() => setShowAddTag(false)}>
                                <X />
                            </Button>
                        }
                    </View>

                    {
                        showAddTag
                        && (
                            <View className="gap-3 bg-popover border border-input rounded-md p-4">
                                <Text className="font-semibold">Tag name</Text>
                                <Input
                                    className="rounded-md h-[50] w-full border border-input bg-white"
                                    value={newTagName} onChangeText={setNewTagName}
                                    onSubmitEditing={() => addNewTag()}
                                />
                                <Text className="font-semibold">Tag Color</Text>
                                <View className="flex-row flex-wrap gap-3">
                                    {
                                        TAG_COLOR_PRESETS.map((color) => (
                                            <Pressable key={color.hex} onPress={() => setNewTagColor(color.hex)}>
                                                <Square
                                                    strokeWidth={newTagColor === color.hex ? 1 : 0}
                                                    stroke={newTagColor === color.hex ? "#000" : "" }
                                                    size={40} color={color.hex} fill={color.hex}
                                                />
                                            </Pressable>
                                        ))
                                    }
                                </View>
                                <View className="flex-row gap-2 flex-1">
                                    <Button onPress={() => {
                                        setShowAddTag(false);
                                        setNewTagName("")
                                        setNewTagColor("")
                                    }} className="flex-1" variant="outline">
                                        <Text>Cancel</Text>
                                    </Button>
                                    <Button onPress={addNewTag} disabled={!newTagName || !newTagColor} className="flex-1" variant="primary">
                                        <Text className="text-white">Submit</Text>
                                    </Button>

                                </View>
                            </View>
                        )
                    }

                    <View className="gap-3">
                        {tags?.map((item) => (
                            <TagEdit key={item._id} tag={item} onResult={setResult} />
                        ))}
                    </View>
                </View>

            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}
