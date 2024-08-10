import axios from "axios";

export const apiRoutePrefix = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const axiosApi = axios.create({
	baseURL: apiRoutePrefix
});

export default axiosApi;
