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
            message: "You don't have a proper refresh token. Please try relogging in.",
        }
    } else if (res.status === 500) {
        return {
            status: res.status,
            message: "Something went wrong. Please try again.",
        }
    }

    return {
        status: res.status,
        message: "",
    }
}