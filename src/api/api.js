import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:1000/api"
});

export default API;