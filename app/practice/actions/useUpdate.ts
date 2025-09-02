import { useMutation } from "@tanstack/react-query";
import { updateUser, UpdateUserProps } from "./updata-user";
import { useAuthStore } from "@/store/useAuthStore";

export const useUpdateUser = () => {

    const userId = useAuthStore((state) => state.user?.id || "");
    const token = useAuthStore((state) => state.user?.token || "");
    const { user, setUser } = useAuthStore();

    const { mutate: updateUserMutation, isPending, error } = useMutation({
        mutationFn: (data: UpdateUserProps) => {
            if (user) {
                setUser({...user, ...data})
            }
            return updateUser(userId, data, token)
        },
    });

    return { updateUserMutation, isPending, error };
};