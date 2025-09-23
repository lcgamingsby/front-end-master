import axios from "axios";
import { config } from "../../data/config"; // sesuaikan path

export const sendLog = async (data) => {
  try {
    const token = localStorage.getItem("jwtToken");
    await axios.post(`${config.BACKEND_URL}/api/student/logs`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("sendLog error:", error);
  }
};
