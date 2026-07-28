import {SafeAreaView} from "react-native-safe-area-context";
import {api} from "@/convex/_generated/api";
import {TabHeader} from "@/components/TabHeader";
import {useAuth, useUser} from "@clerk/expo";
import {View, Image, Modal, Pressable} from "react-native";
import {Text} from "@/components/ui/text";
import {X, EditIcon, LogOut, PlusCircle} from "lucide-react-native";
import {useCallback, useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {useQuery} from "convex/react";
import {TagEdit} from "@/components/Tags/tagEdit";
import {TagAdd} from "@/components/Tags/tagAdd";
import {useFocusEffect} from "expo-router/react-navigation";
import {KeyboardAwareScrollView} from "react-native-keyboard-controller";
import {Input} from "@/components/ui/input";
import {isStringBlank} from "@/lib/utils";
import Toast from 'react-native-toast-message';

export default function Settings() {
    const {user} = useUser();
    const [editVisible, setEditVisible] = useState(false);

    const {signOut} = useAuth();
    const tags = useQuery(api.tags.list);
    const [showAddTag, setShowAddTag] = useState(false);
    const [firstName, setFirstName] = useState(user?.firstName ?? "");
    const [lastName, setLastName] = useState(user?.lastName ?? "");
    const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false)
    const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);

    const [result, setResult] = useState<{
        label: string,
        message: string
    } | null>(null)

    useEffect(() => {
        if (result !== null) {
            Toast.show({
                type: result.label,
                text1: result.message,
            });
            setResult(null);
        }
    }, [result]);

    useFocusEffect(
        useCallback(() => {
            setShowAddTag(false);
            setFirstName(user?.firstName ?? "")
            setLastName(user?.lastName ?? "")
            setEditVisible(false)
        }, [])
    );

    const updateUserDetails = () => {
        setIsUpdatingProfile(true)
        user?.update({
            firstName,
            lastName,
        }).then(() => {
            setResult({
                label: "success",
                message: "Profile successfully updated"
            })
            setEditVisible(false)
        })
            .catch(() => {
                setResult({
                    label: "error",
                    message: "There was an error updating your profile"
                })
            })
            .finally(() => {
                setIsUpdatingProfile(false)
            })
    }

    const confirmSignOut = () => {
        setSignOutConfirmOpen(false);
        signOut();
    };
    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <TabHeader
                title="Settings"
                right={
                    <Button className="p-0" variant="icon" onPress={() => setSignOutConfirmOpen(true)}>
                        <LogOut />
                    </Button>
                }
            />
            <KeyboardAwareScrollView
                className="px-5 mt-5"
                bottomOffset={20}
                keyboardShouldPersistTaps="handled"
            >
                <View className="mt-4 gap-3">
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
                            <TagAdd
                                onResult={setResult}
                                onCancel={() => setShowAddTag(false)}
                                onAdded={() => setShowAddTag(false)}
                            />
                        )
                    }

                    <View className="gap-3">
                        {tags?.map((item) => (
                            <TagEdit key={item._id} tag={item} onResult={setResult} />
                        ))}
                    </View>
                </View>

            </KeyboardAwareScrollView>

            <Modal
                visible={signOutConfirmOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setSignOutConfirmOpen(false)}
            >
                <Pressable
                    className="flex-1 bg-black/40 justify-end"
                    onPress={() => setSignOutConfirmOpen(false)}
                >
                    {/* No-op onPress so taps inside the sheet don't fall through to the backdrop above and close it */}
                    <Pressable onPress={() => {}} className="bg-background rounded-t-xl p-5 pb-12 gap-4">
                        <Text className="text-lg font-semibold">Sign out?</Text>
                        <Text className="text-muted-foreground">Are you sure you want to sign out?</Text>
                        <View className="flex-row gap-3">
                            <Button
                                onPress={() => setSignOutConfirmOpen(false)}
                                variant="outline" className="flex-1">
                                <Text>Cancel</Text>
                            </Button>
                            <Button
                                onPress={confirmSignOut}
                                variant="destructive" className="flex-1">
                                <Text className="text-white">Sign out</Text>
                            </Button>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}
