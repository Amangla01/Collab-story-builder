import API from "./api";

export const registerUser = async (name, email, password) => {
    const {data} = await API.post("/auth/register", {name, email, password});
    return data;
}

export const loginUser = async (email, password) => {
    const {data} = await API.post("/auth/login", {email, password});
    return data;
}

export const getMe = async () => {
    const {data} = await API.get("/auth/me");
    return data;
}

