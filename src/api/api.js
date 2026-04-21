import axios from "axios";

const API = axios.create({
  baseURL: "https://axx-spaces-backend.onrender.com/api",
});

export default API;