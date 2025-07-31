import dotenv from "dotenv";
dotenv.config();

export const config = {
    BACKEND_URL: process.env.BACKEND_URL,
}