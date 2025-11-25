import axios from "axios";
import { config } from "../../data/config"; // sesuaikan path

export const sendLog = async (data) => {
  try {
    await axios.post(`${config.BACKEND_URL}/api/student/logs`,
      data, 
      { withCredentials: true }
    );
  } catch (error) {
    console.error("sendLog error:", error);
  }
};
