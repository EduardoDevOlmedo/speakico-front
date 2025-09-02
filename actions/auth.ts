import { langApi } from "@/api/langApi";
import { RegisterData, LoginData } from "./auth.entity";

export const register = async (data: RegisterData) => {
    const response = await langApi.post("/auth/create", data);
    return response.data;
}

export const login  = async (data: LoginData) => {
    const response = await langApi.post("/auth/login", data);
    return response.data;
}

