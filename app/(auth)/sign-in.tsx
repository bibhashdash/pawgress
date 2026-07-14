import { useSignIn } from "@clerk/expo/legacy";
import { Link, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

export default function SignIn() {
    const { signIn, setActive, isLoaded } = useSignIn();
    const router = useRouter();

    const [emailAddress, setEmailAddress] = useState("");
    const [code, setCode] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const onSignInPress = useCallback(async () => {
        if (!isLoaded) return;
        setError(null);
        setSubmitting(true);
        try {
            const attempt = await signIn.create({ identifier: emailAddress });
            const emailFactor = attempt.supportedFirstFactors?.find(
                (factor: any) => factor.strategy === "email_code",
            ) as any;

            if (!emailFactor) {
                setError("Email code sign-in isn't available for this account.");
                return;
            }

            await signIn.prepareFirstFactor({
                strategy: "email_code",
                emailAddressId: emailFactor.emailAddressId,
            });
            setPendingVerification(true);
        } catch (err: any) {
            setError(err?.errors?.[0]?.longMessage ?? "Unable to sign in. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }, [isLoaded, signIn, emailAddress]);

    const onVerifyPress = useCallback(async () => {
        if (!isLoaded) return;
        setError(null);
        setSubmitting(true);
        try {
            const attempt = await signIn.attemptFirstFactor({ strategy: "email_code", code });

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
    }, [isLoaded, signIn, code, setActive, router]);

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
                    <Text className="text-3xl font-bold">Welcome back</Text>
                    <Text className="max-w-[320] text-center text-muted-foreground">
                        Enter your email and we&#39;ll send you a code to sign in
                    </Text>
                </View>

                <View className="gap-4">
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

                    <Button onPress={onSignInPress} loading={submitting}>
                        <Text>Send code</Text>
                    </Button>

                    <View className="flex-row items-center justify-center gap-1">
                        <Text className="text-sm text-muted-foreground">Don&#39;t have an account?</Text>
                        <Link href="/(auth)/sign-up" className="text-sm font-bold text-accent">
                            Sign up
                        </Link>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
