import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const RequireOnboardingRoute = () => {
    const { isLoading, isLoggedIn, isOnboarded } = useAuth();

    if (isLoading) {
        return <div className="h-screen w-screen flex justify-center items-center text-lg">Loading....</div>;
    }

    if (isLoggedIn && !isOnboarded) {
        return <Navigate to="/onboarding" replace />;
    }

    return <Outlet />;
};

export default RequireOnboardingRoute;
