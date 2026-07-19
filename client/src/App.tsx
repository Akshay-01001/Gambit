import "./App.css";
import { Home } from "./components/Home/Home.js";
import Login from "./components/Login/Login";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import OnboardingPage from "./components/Onboarding/OnboardingPage.js";
import ProtectedRoute from "./components/ProtectedRoute.js";
import RequireOnboardingRoute from "./components/RequireOnboardingRoute.js";
import { AuthProvider } from "./contexts/AuthContext.js";

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
            <RouterProvider router={router} />
        </AuthProvider>
    )
}

export default App;
