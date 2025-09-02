
import { langApi } from "@/api/langApi"
import { useAuthStore } from "@/store/useAuthStore";

export interface UpdateUserProps {
    totalAttempts?: number;
    audioSuccessRate?: number;
    speechSuccessRate?: number;
    textSuccessRate?: number;
    prevFeedback?: string;
}

export const updateUser = async (userId: string, data: UpdateUserProps, token: string) => {
    const response = await langApi.put(`/auth/${userId}`, {
        ...data,
    },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

    return response.data;
}