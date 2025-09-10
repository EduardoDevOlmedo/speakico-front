import { langApi } from "@/api/langApi";
import { RegisterData, LoginData } from "./auth.entity";

export const checkToken = async (token: string) => {
    const response = await langApi.post(`/auth/check-token`, {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
    return response.data.ok;
}

export const register = async (data: RegisterData) => {
    const response = await langApi.post("/auth/create", data);
    return response.data;
}

export const login = async (data: LoginData) => {
    const response = await langApi.post("/auth/login", data);
    return response.data;
}

