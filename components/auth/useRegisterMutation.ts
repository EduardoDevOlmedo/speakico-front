import { useMutation } from "@tanstack/react-query";
import { RegisterData } from "@/actions/auth.entity";
import { register } from "@/actions/auth";
import { useAuthStore } from "@/store/useAuthStore";

export const useRegisterMutation = () => {
    const { setUser } = useAuthStore();
    const { mutate: registerUser, isPending: isRegisterLoading, error: registerError } = useMutation({
        mutationFn: async (data: RegisterData) => {
            const response = await register(data);
            setUser(response.user);
            return response;
        },
    });

    return { registerUser, isRegisterLoading, error: registerError };
};