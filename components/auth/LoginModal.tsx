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
      <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-white dark:bg-gray-800 mb-2">
        {selectedHobbies.length === 0 && <span className="text-gray-500">Select hobbies...</span>}
        {selectedHobbies.map((hobby) => (
          <span
            key={hobby.value}
            className="bg-blue-500 dark:bg-blue-600 text-white px-2 py-1 rounded-full flex items-center"
          >
            {hobby.label}
            <button
              type="button"
              onClick={() => removeHobby(hobby.value)}
              className="ml-1 text-xs"
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      {/* Normal select */}
      <select
        value={selectedValue}
        onChange={(e) => handleSelect(e.target.value)}
        className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
        disabled={selectedHobbies.length >= maxHobbies}
      >
        <option value="">-- Select a hobby --</option>
        {hobbies
          .filter((h) => !selectedHobbies.find((s) => s.value === h.value))
          .map((hobby) => (
            <option key={hobby.value} value={hobby.value}>
              {hobby.label}
            </option>
          ))}
      </select>

      {selectedHobbies.length >= maxHobbies && (
        <p className="text-red-500 text-sm mt-1">
          You can select up to {maxHobbies} hobbies
        </p>
      )}
    </div>
  );
};




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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-auto p-6">
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

    // Scroll input into view on focus
    const scrollIntoViewOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setTimeout(() => {
            e.target.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
    };

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

    const handleSelectHobby = (key: string) => {
        const hobby = hobbies.find((h) => h.value === key);
        if (!hobby) return;
        if (!registerFormik.values.hobbies.some((h) => h.value === key) && registerFormik.values.hobbies.length < MAX_HOBBIES) {
            registerFormik.setFieldValue("hobbies", [...registerFormik.values.hobbies, hobby]);
        }
    };

    const handleRemoveHobby = (value: string) => {
        registerFormik.setFieldValue(
            "hobbies",
            registerFormik.values.hobbies.filter((h) => h.value !== value)
        );
    };

    return (
        <div ref={tabRef}>
            {/* Tabs */}
            <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
                <button
                    className={`flex-1 py-2 text-center font-semibold ${tab === "login" ? "border-b-2 border-blue-500 dark:border-blue-400" : "text-gray-500 dark:text-gray-400"
                        }`}
                    onClick={() => setTab("login")}
                >
                    {t("login")}
                </button>
                <button
                    className={`flex-1 py-2 text-center font-semibold ${tab === "register" ? "border-b-2 border-blue-500 dark:border-blue-400" : "text-gray-500 dark:text-gray-400"
                        }`}
                    onClick={() => setTab("register")}
                >
                    {t("register")}
                </button>
            </div>

            {/* Login Form */}
            {tab === "login" && (
                <form onSubmit={loginFormik.handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        name="email"
                        value={loginFormik.values.email}
                        onChange={loginFormik.handleChange}
                        onBlur={loginFormik.handleBlur}
                        onFocus={scrollIntoViewOnFocus}
                        placeholder={t("loginModal.email")}
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
                    />
                    <input
                        type="password"
                        name="password"
                        value={loginFormik.values.password}
                        onChange={loginFormik.handleChange}
                        onBlur={loginFormik.handleBlur}
                        onFocus={scrollIntoViewOnFocus}
                        placeholder={t("loginModal.password")}
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
                    />
                    <button
                        type="submit"
                        disabled={!loginFormik.isValid || isLoginLoading}
                        className="w-full py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 dark:bg-blue-600"
                    >
                        {isLoginLoading ? "..." : t("login")}
                    </button>
                    {isLoginError && <p className="text-red-500 text-sm">{t("loginModal.error")}</p>}
                </form>
            )}

            {/* Register Form */}
            {tab === "register" && (
                <form onSubmit={registerFormik.handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        name="email"
                        value={registerFormik.values.email}
                        onChange={registerFormik.handleChange}
                        onBlur={registerFormik.handleBlur}
                        onFocus={scrollIntoViewOnFocus}
                        placeholder={t("registerModal.email")}
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
                    />
                    <input
                        type="text"
                        name="name"
                        value={registerFormik.values.name}
                        onChange={registerFormik.handleChange}
                        onBlur={registerFormik.handleBlur}
                        onFocus={scrollIntoViewOnFocus}
                        placeholder={t("registerModal.name")}
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
                    />
                    <input
                        type="password"
                        name="password"
                        value={registerFormik.values.password}
                        onChange={registerFormik.handleChange}
                        onBlur={registerFormik.handleBlur}
                        onFocus={scrollIntoViewOnFocus}
                        placeholder={t("registerModal.password")}
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
                    />
                    <input
                        type="password"
                        name="confirmPassword"
                        value={registerFormik.values.confirmPassword}
                        onChange={registerFormik.handleChange}
                        onBlur={registerFormik.handleBlur}
                        onFocus={scrollIntoViewOnFocus}
                        placeholder={t("registerModal.confirmPassword")}
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
                    />

                    {/* Target Language */}
                    <select
                        value={registerFormik.values.targetLanguage}
                        onChange={(e) => {
                            const val = e.target.value;
                            i18n.changeLanguage(val === "en" ? "es" : "en");
                            registerFormik.setFieldValue("targetLanguage", val);
                        }}
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
                    >
                        <option value="en">{t("registerModal.english")}</option>
                        <option value="es">{t("registerModal.spanish")}</option>
                    </select>

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
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
                    >
                        <option value={Level.Basic}>{t("registerModal.basic")}</option>
                        <option value={Level.Intermediate}>{t("registerModal.intermediate")}</option>
                        <option value={Level.Advanced}>{t("registerModal.advanced")}</option>
                    </select>

                    <button
                        type="submit"
                        disabled={!registerFormik.isValid || registerFormik.values.hobbies.length === 0 || isRegisterLoading}
                        className="w-full py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 dark:bg-blue-600"
                    >
                        {isRegisterLoading ? "..." : t("register")}
                    </button>

                    {registerError && <p className="text-red-500 text-sm">{t("registerModal.error")}</p>}
                </form>
            )}
        </div>
    );
}
