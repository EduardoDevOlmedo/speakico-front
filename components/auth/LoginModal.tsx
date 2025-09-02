"use client";
import { useEffect, useState } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
} from "@heroui/modal";
import { Tabs, Tab } from "@heroui/tabs";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import {
    Autocomplete,
    AutocompleteItem,
} from "@heroui/autocomplete";
import { Tooltip } from "@heroui/tooltip";
import { Select, SelectItem } from "@heroui/select";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Level } from "@/actions/auth.entity";
import { useLoginMutation } from "./useLoginMutation";
import { useRouter } from "next/navigation";
import { useRegisterMutation } from "@/components/auth/useRegisterMutation";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from 'react-i18next';
import i18n from "@/lib/i18n";
import { useHobbies } from "./useHobbies";
const MAX_HOBBIES = 5;


export const LoginModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { user } = useAuthStore();
    const token = user?.token;
    useEffect(() => {
        if (token) {
            setIsOpen(false);
            const targetUrl = location.pathname === "/" ? "/" : location.pathname;
            router.replace(targetUrl);
        } else {
            setIsOpen(true);
        }
    }, [token]);

    return (
        <Modal
            isOpen={isOpen}
            hideCloseButton
        >
            <ModalContent>
                <AuthTabs />
            </ModalContent>
        </Modal>
    );
}

function AuthTabs() {
    const [tab, setTab] = useState<"login" | "register">("login");
    const hobbies = useHobbies();
    const { setUser } = useAuthStore();
    const { t } = useTranslation('common', { keyPrefix: "auth" });
    const { mutate: loginUser, isLoading: isLoginLoading, hasError: isLoginError } = useLoginMutation();
    const { registerUser, isRegisterLoading, error: registerError } = useRegisterMutation();
    // Formik for Login
    const loginFormik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: Yup.object({
            email: Yup.string().email(t('errors.invalidEmailAddress')).required(t('errors.required')),
            password: Yup.string().required(t('errors.required')),
        }),
        onSubmit: (values) => {
            loginUser(values, {
                onSuccess: (response) => {
                    useAuthStore.setState({ language: response.user.targetLanguage === 'en' ? 'es' : 'en' });
                    setUser(response.user);
                    location.reload();
                },
                onError: (error) => {
                    console.log("Login error", error);
                }
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
            email: Yup.string().email(t('errors.invalidEmailAddress')).required(t('errors.required')),
            name: Yup.string().min(2, t('errors.nameTooShort')).required(t('errors.required')),
            password: Yup.string()
                .min(6, t('errors.passwordTooShort'))
                .required(t('errors.required')),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref("password")], t('errors.passwordsMustMatch'))
                .required(t('errors.required')),
            targetLanguage: Yup.string().required(t('errors.required')),
            hobbies: Yup.array()
                .min(1, t('errors.addAtLeastOneInterest'))
                .max(MAX_HOBBIES, t('registerModal.youCanAddUpTo', { max: MAX_HOBBIES })),
            level: Yup.string().required(t('errors.required')),
        }),
        onSubmit: (values) => {
            const { hobbies, ...rest } = values;
            const onlyHobbieValues = hobbies.map((hobby) => hobby.value).join(',');
            registerUser({
                ...rest,
                interests: onlyHobbieValues,
            }, {
                onSuccess: () => {
                    useAuthStore.setState({ language: values.targetLanguage === 'en' ? 'es' : 'en' });
                    location.reload();
                },
                onError: (error: any) => {
                    console.log("Register error", error);
                }
            });
        },
    });

    const handleSelectHobby = (key: string) => {
        const hobby = hobbies.find((h) => h.value === key);
        if (!hobby) return;
        if (!registerFormik.values.hobbies.some((h) => h.value === key)) {
            if (registerFormik.values.hobbies.length < MAX_HOBBIES) {
                registerFormik.setFieldValue("hobbies", [
                    ...registerFormik.values.hobbies,
                    hobby,
                ]);
            }
        }
    };

    const handleRemoveHobby = (value: string) => {
        registerFormik.setFieldValue(
            "hobbies",
            registerFormik.values.hobbies.filter((h) => h.value !== value)
        );
    };

    return (
        <Tabs
            aria-label="Tabs variants"
            variant="underlined"
            selectedKey={tab}
            onSelectionChange={(key) => setTab(key as "login" | "register")}
        >
            <Tab key="login" title={t('login')}>
                <ModalHeader>{t('loginModal.welcome')}</ModalHeader>
                <ModalBody>
                    <form onSubmit={loginFormik.handleSubmit} noValidate>
                        <Input
                            type="email"
                            label={t('loginModal.email')}
                            name="email"
                            value={loginFormik.values.email}
                            onChange={loginFormik.handleChange}
                            onBlur={loginFormik.handleBlur}
                            isInvalid={!!(loginFormik.touched.email && loginFormik.errors.email)}
                            errorMessage={loginFormik.touched.email && loginFormik.errors.email ? loginFormik.errors.email : undefined}
                            className="mb-4"
                            autoComplete="off"
                        />
                        <Input
                            type="password"
                            label={t('loginModal.password')}
                            name="password"
                            value={loginFormik.values.password}
                            onChange={loginFormik.handleChange}
                            onBlur={loginFormik.handleBlur}
                            isInvalid={!!(loginFormik.touched.password && loginFormik.errors.password)}
                            errorMessage={loginFormik.touched.password && loginFormik.errors.password ? loginFormik.errors.password : undefined}
                            className="mb-4"
                            autoComplete="off"
                        />
                        <Button fullWidth className="mt-2 mb-2" type="submit" isDisabled={!loginFormik.isValid} isLoading={isLoginLoading || loginFormik.isSubmitting && !isLoginError} >
                            {t('login')}
                        </Button>
                        {isLoginError && <p className="text-red-500 text-sm">{t('loginModal.error')}</p>}
                    </form>
                </ModalBody>
            </Tab>

            <Tab key="register" title={t('register')}>
                <ModalHeader>
                    {t('registerModal.welcome')}
                </ModalHeader>
                <ModalBody>
                    <form onSubmit={registerFormik.handleSubmit} noValidate>
                        <Input
                            type="email"
                            label={t('registerModal.email')}
                            name="email"
                            value={registerFormik.values.email}
                            onChange={registerFormik.handleChange}
                            onBlur={registerFormik.handleBlur}
                            isInvalid={!!(registerFormik.touched.email && registerFormik.errors.email)}
                            errorMessage={registerFormik.touched.email && registerFormik.errors.email ? registerFormik.errors.email : undefined}
                            className="mb-4"
                            autoComplete="off"
                        />
                        <Input
                            type="text"
                            label={t('registerModal.name')}
                            name="name"
                            value={registerFormik.values.name}
                            onChange={registerFormik.handleChange}
                            onBlur={registerFormik.handleBlur}
                            isInvalid={!!(registerFormik.touched.name && registerFormik.errors.name)}
                            errorMessage={registerFormik.touched.name && registerFormik.errors.name ? registerFormik.errors.name : undefined}
                            className="mb-4"
                        />
                        <Input
                            type="password"
                            label={t('registerModal.password')}
                            name="password"
                            value={registerFormik.values.password}
                            onChange={registerFormik.handleChange}
                            onBlur={registerFormik.handleBlur}
                            isInvalid={!!(registerFormik.touched.password && registerFormik.errors.password)}
                            errorMessage={registerFormik.touched.password && registerFormik.errors.password ? registerFormik.errors.password : undefined}
                            className="mb-4"
                            autoComplete="off"
                        />
                        <Input
                            type="password"
                            label={t('registerModal.confirmPassword')}
                            name="confirmPassword"
                            value={registerFormik.values.confirmPassword}
                            onChange={registerFormik.handleChange}
                            onBlur={registerFormik.handleBlur}
                            isInvalid={!!(registerFormik.touched.confirmPassword && registerFormik.errors.confirmPassword)}
                            errorMessage={registerFormik.touched.confirmPassword && registerFormik.errors.confirmPassword ? registerFormik.errors.confirmPassword : undefined}
                            className="mb-4"
                            autoComplete="new-password"
                        />

                        <Select
                            label={t('registerModal.targetLanguage')}
                            placeholder={t('registerModal.selectYourTargetLanguage')}
                            className="mb-4"
                            name="targetLanguage"
                            multiple={false}
                            onSelectionChange={(key) => {
                                i18n.changeLanguage(key.currentKey === 'en' ? 'es' : 'en');
                                registerFormik.setFieldValue("targetLanguage", key.currentKey as string);
                            }}
                            onBlur={registerFormik.handleBlur}
                            isInvalid={!!(registerFormik.touched.targetLanguage && registerFormik.errors.targetLanguage)}
                            errorMessage={registerFormik.touched.targetLanguage && registerFormik.errors.targetLanguage ? registerFormik.errors.targetLanguage : undefined}
                        >
                            <SelectItem key="en">{t('registerModal.english')}</SelectItem>
                            <SelectItem key="es">{t('registerModal.spanish')}</SelectItem>
                            <SelectItem style={{ opacity: 0.5 }} isReadOnly key="pt">{t('registerModal.portuguese')}</SelectItem>
                            <SelectItem style={{ opacity: 0.5 }} isReadOnly key="fr">{t('registerModal.french')}</SelectItem>
                        </Select>

                        {registerFormik.values.hobbies.length > 0 && (
                            <div className="flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-md max-h-20 overflow-y-auto">
                                {registerFormik.values.hobbies.map((hobby) => (
                                    <span
                                        key={hobby.value}
                                        className="bg-blue-500 dark:bg-blue-600 text-white px-2 py-1 rounded-full text-sm flex items-center"
                                    >
                                        {t(`hobbies.${hobby.value}`)}
                                        <button
                                            className="ml-2 text-xs"
                                            type="button"
                                            onClick={() => handleRemoveHobby(hobby.value)}
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <Tooltip
                            showArrow
                            isDisabled={registerFormik.values.hobbies.length < MAX_HOBBIES}
                            content={registerFormik.touched.hobbies?.length === 0 ? t('registerModal.addAtLeastOneInterest') : t('registerModal.youCanAddUpTo', { max: MAX_HOBBIES })}
                            placement="top"
                        >
                            <div className="mt-2">
                                <Autocomplete
                                    className="mb-2"
                                    label={t('registerModal.interests')}
                                    placeholder={t('registerModal.searchYourInterestsOrAddACustomOne')}
                                    allowsCustomValue
                                    onSelectionChange={(key) => handleSelectHobby(key as string)}
                                    onClear={() => registerFormik.setFieldValue("hobbies", [])}
                                    value={registerFormik.values.hobbies.map((hobby) => hobby.label)}
                                    isDisabled={registerFormik.values.hobbies.length >= MAX_HOBBIES}
                                >
                                    {hobbies
                                        .filter(
                                            (hobby) =>
                                                !registerFormik.values.hobbies.some(
                                                    (selected) => selected.value === hobby.value
                                                )
                                        )
                                        .map((hobby) => (
                                            <AutocompleteItem key={hobby.value}>
                                                {hobby.label}
                                            </AutocompleteItem>
                                        ))}
                                </Autocomplete>
                            </div>
                        </Tooltip>
                        <Select
                            label={t('registerModal.level')}
                            placeholder={t('registerModal.selectYourLevel')}
                            className="mt-2 mb-2"
                            name="level"
                            selectedKeys={[registerFormik.values.level]}
                            onSelectionChange={(key) => {
                                registerFormik.setFieldValue("level", key.currentKey as string);
                            }}
                            onBlur={registerFormik.handleBlur}
                            isInvalid={!!(registerFormik.touched.level && registerFormik.errors.level)}
                            errorMessage={registerFormik.touched.level && registerFormik.errors.level ? registerFormik.errors.level : undefined}
                        >
                            <SelectItem key={Level.Basic}>{t('registerModal.basic')}</SelectItem>
                            <SelectItem key={Level.Intermediate}>{t('registerModal.intermediate')}</SelectItem>
                            <SelectItem key={Level.Advanced}>{t('registerModal.advanced')}</SelectItem>
                        </Select>
                        <Button
                            className="mt-2"
                            type="submit"
                            fullWidth
                            isLoading={(isRegisterLoading || registerFormik.isSubmitting) && !registerError}
                            isDisabled={
                                !registerFormik.isValid ||
                                registerFormik.values.hobbies.length === 0
                            }
                        >
                            {t('register')}
                        </Button>
                        {registerError && <p className="text-red-500 text-sm mt-2">{t('registerModal.error')}</p>}
                    </form>
                </ModalBody>
            </Tab>
        </Tabs>
    );
}

