import { User } from "@/actions/auth.entity";
import { langApi } from "@/api/langApi";

export const generateExercises = async (user: User) => {

    const token = user.token;
    const response = await langApi.post("/generate", {
        userId: user.id,
        interests: user.interests,
        level: user.level,
    },
    {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
);


    return response.data;
};