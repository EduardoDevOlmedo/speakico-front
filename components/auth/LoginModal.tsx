"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import i18n from "@/lib/i18n";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/useAuthStore";
import { Level } from "@/actions/auth.entity";
import { useLoginMutation } from "./useLoginMutation";
import { useRegisterMutation } from "@/components/auth/useRegisterMutation";
import { useHobbies } from "./useHobbies";
import Input from "./components/Input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { checkToken } from "@/actions/auth";

const MAX_HOBBIES = 5;


interface Hobby {
    label: string;
    value: string;
}

interface Props {
    hobbies: Hobby[];
    maxHobbies?: number;
    selectedHobbies: Hobby[];
    setSelectedHobbies: (h: Hobby[]) => void;
}

export const SingleSelectHobbies = ({
    hobbies,
    maxHobbies = 5,
    selectedHobbies,
    setSelectedHobbies,
}: Props) => {
    const [selectedValue, setSelectedValue] = useState("");
    const { t } = useTranslation("common", { keyPrefix: "auth.registerModal" });

    const handleSelect = (value: string) => {
        const hobby = hobbies.find((h) => h.value === value);
        if (!hobby) return;
        if (!selectedHobbies.find((h) => h.value === value) && selectedHobbies.length < maxHobbies) {
            setSelectedHobbies([...selectedHobbies, hobby]);
        }
        setSelectedValue(""); // reset select
    };

    const removeHobby = (value: string) => {
        setSelectedHobbies(selectedHobbies.filter((h) => h.value !== value));
    };

    return (
        <div className="w-full">
            {/* Selected tags */}
            {selectedHobbies.length === 0 && (
                <p className="text-sm text-gray-500 mb-2 text-warning">{t("addAtLeastOneInterest")}</p>
            )}
            <div className="flex flex-wrap gap-2 bg-default-100  p-2 rounded-medium min-h-14  mb-4">
                {selectedHobbies.map((hobby) => (
                    <span
                        key={hobby.value}
                        className="bg-blue-500 dark:bg-blue-600 text-white px-2 py-1 rounded-full text-sm flex items-center max-h-8"
                    >
                        {hobby.label}
                        <Button
                            type="button"
                            variant="light"
                            onPress={() => removeHobby(hobby.value)}
                            className="ml-1 text-xs min-w-2 rounder-medium h-6 p-2"
                        >
                            ✕
                        </Button>
                    </span>
                ))}
            </div>

            {/* Normal select */}
            <select
                value={selectedValue}
                onChange={(e) => handleSelect(e.target.value)}
                className="custom-select "
                disabled={selectedHobbies.length >= maxHobbies}
                style={{
                    opacity: selectedHobbies.length >= maxHobbies ? 0.5 : 1,
                }}
            >
                <option value="">{t("searchYourInterestsOrAddACustomOne")}</option>
                {hobbies
                    .filter((h) => !selectedHobbies.find((s) => s.value === h.value))
                    .map((hobby) => (
                        <option key={hobby.value} value={hobby.value}>
                            {hobby.label}
                        </option>
                    ))}
            </select>

            {selectedHobbies.length >= maxHobbies && (
                <p className="text-warning text-sm mt-1">
                    {t("youCanAddUpTo", { max: maxHobbies })}
                </p>
            )}

        </div>
    );
};

export const LoginModal = () => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const token = useAuthStore((state) => state.user?.token);
    const hydrated = useAuthStore((state) => state.hydrated);

    useEffect(() => {
        if (!hydrated) return; 

        const validateTokenFn = async () => {
            if (!token) {
                setIsOpen(true);
                router.replace("/");
                return;
            }

            const isValid = await checkToken(token);
            if (!isValid) {
                setIsOpen(true);
                router.replace("/");
            } else {
                setIsOpen(false);
            }
        };

        validateTokenFn();
    }, [token, hydrated, router]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-content1 rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-auto px-2
            flex flex-col relative z-50 w-full box-border bg-content1 outline-solid outline-transparent mx-1 my-1 sm:mx-6 sm:my-16 max-w-md rounded-large shadow-small overflow-y-hidden
            ">
                <AuthTabs />
            </div>
        </div>
    );
};

function AuthTabs() {
    const [tab, setTab] = useState<"login" | "register">("login");
    const hobbies = useHobbies();
    const { setUser } = useAuthStore();
    const { t } = useTranslation("common", { keyPrefix: "auth" });
    const { mutate: loginUser, isLoading: isLoginLoading, hasError: isLoginError } = useLoginMutation();
    const { registerUser, isRegisterLoading, error: registerError } = useRegisterMutation();
    const tabRef = useRef<HTMLDivElement>(null);

    const loginFormik = useFormik({
        initialValues: { email: "", password: "" },
        validationSchema: Yup.object({
            email: Yup.string().email(t("errors.invalidEmailAddress")).required(t("errors.required")),
            password: Yup.string().required(t("errors.required")),
        }),
        onSubmit: (values) => {
            loginUser(values, {
                onSuccess: (response) => {
                    useAuthStore.setState({ language: response.user.targetLanguage === "en" ? "es" : "en" });
                    setUser(response.user);
                    location.reload();
                },
                onError: (error) => console.log("Login error", error),
            });
        },
    });

    const registerFormik = useFormik({
        initialValues: {
            email: "",
            name: "",
            password: "",
            confirmPassword: "",
            hobbies: [] as { label: string; value: string }[],
            level: Level.Basic,
            targetLanguage: "es",
        },
        validationSchema: Yup.object({
            email: Yup.string().email(t("errors.invalidEmailAddress")).required(t("errors.required")),
            name: Yup.string().min(2, t("errors.nameTooShort")).required(t("errors.required")),
            password: Yup.string().min(6, t("errors.passwordTooShort")).required(t("errors.required")),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref("password")], t("errors.passwordsMustMatch"))
                .required(t("errors.required")),
            targetLanguage: Yup.string().required(t("errors.required")),
            hobbies: Yup.array()
                .min(1, t("errors.addAtLeastOneInterest"))
                .max(MAX_HOBBIES, t("registerModal.youCanAddUpTo", { max: MAX_HOBBIES })),
            level: Yup.string().required(t("errors.required")),
        }),
        onSubmit: (values) => {
            const { hobbies, ...rest } = values;
            const onlyHobbieValues = hobbies.map((h) => h.value).join(",");
            registerUser(
                { ...rest, interests: onlyHobbieValues },
                {
                    onSuccess: () => {
                        useAuthStore.setState({ language: values.targetLanguage === "en" ? "es" : "en" });
                        location.reload();
                    },
                    onError: (error: any) => console.log("Register error", error),
                }
            );
        },
    });
    return (
        <div ref={tabRef} style={{
            overflowY: "auto",
        }}>
            {/* Tabs */}
            <div className="flex mb-4">
                <button
                    className={`px-2 py-2 text-center ${tab === "login" ? "border-b-2 border-black dark:border-white" : "text-gray-500 dark:text-gray-400"
                        }`}
                    style={{
                        opacity: tab === "login" ? 1 : 0.75,
                        fontSize: "0.85rem"
                    }}
                    onClick={() => setTab("login")}
                >
                    {t("login")}
                </button>
                <button
                    className={`px-2 py-2 text-center ${tab === "register" ? "border-b-2 border-black dark:border-white" : "text-gray-500 dark:text-gray-400"
                        }`}
                    style={{
                        opacity: tab === "register" ? 1 : 0.75,
                        fontSize: "0.85rem"
                    }}
                    onClick={() => setTab("register")}
                >
                    {t("register")}
                </button>
            </div>

            {/* Login Form */}
            {tab === "login" && (
                <>
                    <h4
                        className="text-md font-bold mb-4 px-4"
                    >
                        {t("loginModal.welcome")}
                    </h4>
                    <form onSubmit={loginFormik.handleSubmit} className="space-y-4 px-4 pb-4">
                        <Input formik={loginFormik} placeholder={t("loginModal.email")} name="email" type="email" />
                        <Input formik={loginFormik} placeholder={t("loginModal.password")} name="password" type="password" />
                        <Button fullWidth className="mt-2 mb-2" type="submit" isDisabled={!loginFormik.isValid} isLoading={isLoginLoading || loginFormik.isSubmitting && !isLoginError} >
                            {t('login')}
                        </Button>
                        {isLoginError && <p className="text-red-500 text-sm">{t('loginModal.error')}</p>}
                    </form>
                </>
            )}

            {/* Register Form */}
            {tab === "register" && (
                <>
                    <h4
                        className="text-md font-bold mb-4 px-4"
                    >
                        {t("registerModal.welcome")}
                    </h4>
                    <form onSubmit={registerFormik.handleSubmit} className="space-y-4 px-4 pb-4">
                        <Input formik={registerFormik} placeholder={t("registerModal.email")} name="email" type="email" />
                        <Input formik={registerFormik} placeholder={t("registerModal.name")} name="name" type="text" />
                        <Input formik={registerFormik} placeholder={t("registerModal.password")} name="password" type="password" />
                        <Input formik={registerFormik} placeholder={t("registerModal.confirmPassword")} name="confirmPassword" type="password" />
                        {/* Target Language */}
                        <Select
                            label={t("registerModal.targetLanguage")}
                            name="targetLanguage"
                            value={registerFormik.values.targetLanguage}
                            onSelectionChange={(e) => {
                                const val = e.currentKey;
                                i18n.changeLanguage(val === "en" ? "es" : "en");
                                registerFormik.setFieldValue("targetLanguage", val);
                            }}
                            className="
                            w-full inline-flex tap-highlight-transparent shadow-xs bg-default-100 data-[hover=true]:bg-default-200 
                            group-data-[focus=true]:bg-default-100 rounded-medium flex-col items-start justify-center gap-0 
                            transition-background motion-reduce:transition-none !duration-150 outline-solid outline-transparent group-data-[focus-visible=true]:z-10 
                            h-14
                            "
                        >
                            <SelectItem key="en">{t("registerModal.english")}</SelectItem>
                            <SelectItem key="es">{t("registerModal.spanish")}</SelectItem>
                        </Select>

                        {/* Hobbies */}
                        <div className="flex flex-col gap-2">
                            <SingleSelectHobbies
                                hobbies={hobbies}
                                maxHobbies={MAX_HOBBIES}
                                selectedHobbies={registerFormik.values.hobbies}
                                setSelectedHobbies={(hobbies: Hobby[]) => registerFormik.setFieldValue("hobbies", hobbies)}
                            />
                        </div>


                        {/* Level */}
                        <select
                            value={registerFormik.values.level}
                            onChange={(e) => registerFormik.setFieldValue("level", e.target.value)}
                            className="custom-select "
                        >
                            {Object.values(Level)
                                .map((level) => (
                                    <option key={level} value={level}>
                                        {t(`registerModal.${level}`)}
                                    </option>
                                ))}
                        </select>

                        <Button fullWidth className="mt-2 mb-2" type="submit" isDisabled={!registerFormik.isValid || registerFormik.values.hobbies.length === 0} isLoading={isRegisterLoading || registerFormik.isSubmitting && !registerError} >
                            {t('register')}
                        </Button>
                        {registerError && <p className="text-red-500 text-sm">{t("registerModal.error")}</p>}
                    </form>
                </>
            )}
        </div>
    );
}
