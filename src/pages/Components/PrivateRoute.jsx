import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "./UserContext";
import axios from "axios";
import { config } from "../../data/config";

const RestoreUserFromToken = async (token, setUser) => {
    const userRes = await axios.get(`${config.BACKEND_URL}/api/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    setUser(userRes.data);
}

function PrivateRoute({ role }) {
    const { user, setUser } = useUser();
    const token = localStorage.getItem("jwtToken");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user && token) {
            setLoading(true);
            RestoreUserFromToken(token, setUser)
            .catch(() => {
                // handle token error
                localStorage.removeItem("jwtToken");
            })
            .finally(() => setLoading(false));
        }
    }, [user, token, setUser]);

    if (!user && token) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role && user.role !== role) {
        return <Navigate to="/login" replace />;
    }
    
    return <Outlet />;
}

export default PrivateRoute;