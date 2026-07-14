import { useSignUp } from "@clerk/expo/legacy";
import { Link, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

// Whatever fields the Clerk Dashboard is configured to *require* at sign-up
// must be collected here and passed to signUp.create(), or attempt.status
// will sit at "missing_requirements" indefinitely. Check the dashboard's
// user & authentication settings before relying on firstName/lastName below.
export default function SignUp() {
    const { signUp, setActive, isLoaded } = useSignUp();
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [emailAddress, setEmailAddress] = useState("");
    const [code, setCode] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const onSignUpPress = useCallback(async () => {
        if (!isLoaded) return;
        setError(null);
        setSubmitting(true);
        try {
            await signUp.create({ emailAddress, firstName, lastName });
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setPendingVerification(true);
        } catch (err: any) {
            setError(err?.errors?.[0]?.longMessage ?? "Unable to sign up. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }, [isLoaded, signUp, emailAddress, firstName, lastName]);

    const onVerifyPress = useCallback(async () => {
        if (!isLoaded) return;
        setError(null);
        setSubmitting(true);
        try {
            const attempt = await signUp.attemptEmailAddressVerification({ code });

            if (attempt.status === "complete") {
                await setActive({ session: attempt.createdSessionId });
                router.replace("/(tabs)");
            } else {
                setError("Unable to verify. Please check the code and try again.");
            }
        } catch (err: any) {
            setError(err?.errors?.[0]?.longMessage ?? "Unable to verify. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }, [isLoaded, signUp, code, setActive, router]);

    if (pendingVerification) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <View className="grow gap-8 px-5 pt-8">
                    <View className="items-center gap-2">
                        <Text className="text-3xl font-bold">Check your email</Text>
                        <Text className="max-w-[320] text-center text-muted-foreground">
                            Enter the verification code we sent to {emailAddress}
                        </Text>
                    </View>

                    <View className="gap-4">
                        <View className="gap-2">
                            <Text className="text-sm font-semibold">Verification code</Text>
                            <Input
                                autoCapitalize="none"
                                keyboardType="number-pad"
                                placeholder="123456"
                                value={code}
                                onChangeText={setCode}
                            />
                        </View>

                        {error ? <Text className="text-xs text-destructive">{error}</Text> : null}

                        <Button onPress={onVerifyPress} loading={submitting}>
                            <Text>Verify</Text>
                        </Button>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="grow gap-8 px-5 pt-8">
                <View className="items-center gap-2">
                    <Text className="text-3xl font-bold">Create your account</Text>
                    <Text className="max-w-[320] text-center text-muted-foreground">
                        We&#39;ll send you a code by email to verify &mdash; no password needed
                    </Text>
                </View>

                <View className="gap-4">
                    <View className="flex-row gap-3">
                        <View className="flex-1 gap-2">
                            <Text className="text-sm font-semibold">First name</Text>
                            <Input
                                autoCapitalize="words"
                                placeholder="Jamie"
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                        </View>
                        <View className="flex-1 gap-2">
                            <Text className="text-sm font-semibold">Last name</Text>
                            <Input
                                autoCapitalize="words"
                                placeholder="Rivera"
                                value={lastName}
                                onChangeText={setLastName}
                            />
                        </View>
                    </View>

                    <View className="gap-2">
                        <Text className="text-sm font-semibold">Email</Text>
                        <Input
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={emailAddress}
                            onChangeText={setEmailAddress}
                        />
                    </View>

                    {error ? <Text className="text-xs text-destructive">{error}</Text> : null}

                    <Button onPress={onSignUpPress} loading={submitting}>
                        <Text>Send code</Text>
                    </Button>

                    <View className="flex-row items-center justify-center gap-1">
                        <Text className="text-sm text-muted-foreground">Already have an account?</Text>
                        <Link href="/(auth)/sign-in" className="text-sm font-bold text-accent">
                            Sign in
                        </Link>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
