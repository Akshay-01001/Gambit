import "./App.css";
import { Home } from "./components/Home/Home.js";
import Login from "./components/Login/Login";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import OnboardingPage from "./components/Onboarding/OnboardingPage.js";
import { useEffect } from "react";
import axios from "axios";

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
        path: "/onboarding",
        element: <OnboardingPage />
    }
]);

function App() {

    useEffect(() => {
        const fetUserDetails = async () => {
            const data = await axios.get("http://localhost:8000/api/auth/me", {
                withCredentials: true
            });
            return data;
        }
        console.log(fetUserDetails());
    }, []);

    return <RouterProvider router={router} />;
}

export default App;
