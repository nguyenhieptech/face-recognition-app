import axios from "axios";

export const httpClient = axios.create({
  baseURL: "http://0.0.0.0/api/",
});
