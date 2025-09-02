import { useMutation } from "@tanstack/react-query";
import { login } from "@/actions/auth";
import { LoginData } from "@/actions/auth.entity";

export const useLoginMutation = () => {

  const mutation = useMutation(
    {
      mutationFn: async (credentials: LoginData) => {
        return await login(credentials);
      },
    }
  );

  return {
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
    hasError: mutation.isError,
    error: mutation.error,
  };
};
