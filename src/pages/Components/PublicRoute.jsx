import React, { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

function PublicRoute() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) return <Outlet />;

    if (loggedInUser.role === "admin") return <Navigate to="/admin" replace />;
    if (loggedInUser.role === "mahasiswa") return <Navigate to="/student" replace />;

    return <Navigate to="/" replace />;
}

export default PublicRoute;