import "./App.css";
import { Home } from "./Pages/Home/Home";
import Login from "./Pages/Login/Login";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import OnboardingPage from "./Pages/Onboarding/OnboardingPage";
import ProtectedRoute from "./components/Routes/ProtectedRoute";
import RequireOnboardingRoute from "./components/Routes/OnboardingRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";

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
        ]
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/onboarding",
                element: <OnboardingPage />
            },
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
