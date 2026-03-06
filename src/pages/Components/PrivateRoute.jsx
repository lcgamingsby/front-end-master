import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "./UserContext";
import axios from "axios";
import { config } from "../../data/config";

function PrivateRoute({ role }) {
    const { user, setUser } = useUser();
    const [finishedLoading, setFinishedLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userRes = await axios.get(
                    `${config.BACKEND_URL}/api/me`,
                    {withCredentials: true}
                );

                setUser(userRes.data);
            } catch (e) {
                setUser(null); // Not logged in
            } finally {
                setFinishedLoading(true);
            }
        }

        //console.log(user);

        if (user === undefined || user === null) {
            fetchUser();
        } else {
            setFinishedLoading(true);
        }
    }, [user, setUser]);

    if (!finishedLoading) {
        return <div>Loading...</div>;
    }
    
    if (user === null) {
        return <Navigate to="/login" replace />;
    }

    if (user && role && user.role !== role) {
        return <Navigate to="/login" replace />;
    }
    
    return <Outlet />;
}

export default PrivateRoute;