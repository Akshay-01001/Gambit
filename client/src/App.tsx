import "./App.css";
import { Home } from "./components/Home/Home.js";
import Login from "./components/Login/Login";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import OnboardingPage from "./components/Onboarding/OnboardingPage.js";
import ProtectedRoute from "./components/ProtectedRoute.js";
import { AuthProvider } from "./contexts/AuthContext.js";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/login",
        element: <Login />,
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
