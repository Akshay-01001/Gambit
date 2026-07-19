import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const RequireOnboardingRoute = () => {
    const { isLoading, isLoggedIn, isOnboarded } = useAuth();

    if (isLoading) {
        return <div>Loading....</div>;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (!isOnboarded) {
        return <Navigate to="/onboarding" replace />;
    }

    return <Outlet />;
};

export default RequireOnboardingRoute;
