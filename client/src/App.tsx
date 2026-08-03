import "./App.css";
import { Home } from "./Pages/Home/Home";
import Login from "./Pages/Login/Login";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import OnboardingPage from "./Pages/Onboarding/OnboardingPage";
import ProtectedRoute from "./components/Routes/ProtectedRoute";
import RequireOnboardingRoute from "./components/Routes/OnboardingRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import VerifyOtp from "./components/Onboarding/VerifyOtp";
import Board from "./components/Game/Board";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />,
    },
    {
        element: <RequireOnboardingRoute />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
            {
                path: "/game",
                element: <Board />
            }
        ]
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/onboarding",
                element: <OnboardingPage />
            },
            {
                path: '/verify-otp',
                element: <VerifyOtp />
            }
        ]
    }
]);

function App() {
    return (
        <AuthProvider>
            <OnboardingProvider>
                <RouterProvider router={router} />
            </OnboardingProvider>
        </AuthProvider>
    )
}

export default App;
