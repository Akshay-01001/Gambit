import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = () => {
    const { isLoading, isLoggedIn } = useAuth();

    if (isLoading) {
        return <div>
            Loading....
        </div>
    }
    return (
        isLoggedIn ? <Outlet /> : <Navigate to={"/login"} replace />
    )
}

export default ProtectedRoute;
