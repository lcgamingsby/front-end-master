import React, { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

function PrivateRoute(role) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) return <Navigate to="/login" replace />;
    if (role && loggedInUser.role !== role) {
        <Navigate to="/login" replace />
    }

    return <Outlet />;
}

export default PrivateRoute;