import { User } from "@/actions/auth.entity";
import { generateExercises } from "./generate-exercises";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";

interface Exercise {
    phrase: string;
    audio: string;
}

interface GenerateResponse {
    exercises: Exercise[];
}

export const useGenerate = () => {

    const user = useAuthStore((state) => state.user);

    const { data, isLoading, error } = useQuery<GenerateResponse>({
        queryKey: ["exercises"],
        queryFn: () => generateExercises(user as User),
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        refetchIntervalInBackground: false,
    });

    const exercises = data?.exercises;

    return { exercises, isLoading, error };
};