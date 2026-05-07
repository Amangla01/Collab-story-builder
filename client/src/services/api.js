import axios from "axios";

const API = axios.create({
    baseURL: "http://13.232.46.81:5000/",
})

API.interceptors.request.use((req) => {
    const user = localStorage.getItem("user");
    if(user){
        req.headers.Authorization = `Bearer ${JSON.parse(user).token}`;
    }
    return req;
})

export default API;
