import axios from "axios";
import { config } from "./config";

export async function getRefreshToken() {
    const res = await axios.post(
        `${config.BACKEND_URL}/refresh`,
        {},
        { withCredentials: true },
    )

    if (res.status === 401) {
        return {
            status: res.status,
            message: res.message,
        }
    } else if (res.status === 500) {
        return {
            status: res.status,
            message: res.message,
        }
    }

    return {
        status: res.status,
        message: "",
    }
}