import React from "react";
import { Redirect, Slot } from "expo-router";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return (
            <>
                <Slot />
                <Redirect href="/login" />
            </>
        );
    }


    return <Slot />;
};
export default ProtectedRoute;