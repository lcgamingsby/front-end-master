import React, { useEffect, useRef, useState } from "react";
import Navbar from "../Components/Navbar";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { config } from "../../data/config";

function ExamTrackingPage() {
  const location = useLocation();
  const examID = location.state?.exam_id || 0;

  const ws = useRef(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    ws.current = new WebSocket(`${config.WEBSOCKET_URL}`);

    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({
        type: "auth",
        token: localStorage.getItem("jwtToken"),
      }));
    }

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setMessages((prev) => [...prev, data]);
    };

    return () => ws.current.close();
  });

  return (
    <div className="absolute bg-slate-50 w-full min-h-full h-auto">
      <Navbar />

      <main className="px-8 py-12">
        <p>Tracking exam {examID}</p>

        {messages.map((v, i) => (
          <p>
            {v}
          </p>
        ))}
      </main>
    </div>
  );
}

export default ExamTrackingPage;
