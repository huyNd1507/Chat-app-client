import axiosClient from "."

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  username: string;
  fullname: string;
  email: string;
  password: string;
}

export const register = async (payload: RegisterPayload): Promise<any> => {
    return await axiosClient.post<any>("/auth/register", payload);
};

export const login = async (payload: LoginPayload): Promise<any> => {
    return await axiosClient.post<any>("/auth/login", payload);
};

export const logout = async () => {
   return await axiosClient.post<any>("/auth/logout");
};

export const getMe = async () => {
    return await axiosClient.get("/auth/getMe");
};