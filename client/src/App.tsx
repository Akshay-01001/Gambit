import { Home } from "./Pages/Home/Home";
import Login from "./Pages/Login/Login";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import OnboardingPage from "./Pages/Onboarding/OnboardingPage";
import ProtectedRoute from "./components/Routes/ProtectedRoute";
import RequireOnboardingRoute from "./components/Routes/OnboardingRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import VerifyOtp from "./components/Onboarding/VerifyOtp";
import GamePage from "./components/Game/GamePage";
import PlayPage from "./Pages/Play/PlayPage";
import { useEffect } from "react";
import { gameManager } from "./game/gameManager";
import { useSelector } from "react-redux";
import type { RootState } from "./store/store";
import { getCurrentGame } from "./utils/apiFunctions";

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
                path: "/play",
                element: <PlayPage />
            },
            {
                path: "/game/:id",
                element: <GamePage />
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
    const isCompletedOnboarding = useSelector((state: RootState) => state.user.isCompletedOnboarding);

    useEffect(() => {
        // Initialize the game manager (and connect the socket) only when the user is fully onboarded!
        if (isCompletedOnboarding) {
            gameManager.init();
        }
    }, [isCompletedOnboarding]);

    const fetchCurrentGame = async () => {
        try {
            const res = await getCurrentGame("/api/game/current");
            console.log(res);
            if (res?.data?.data?.gameId) {
                const gameId = res?.data?.data?.gameId;
                gameManager.reJoinGame(gameId);
                router.navigate(`/game/${gameId}`);
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (!isCompletedOnboarding) return;
        fetchCurrentGame();
    }, [isCompletedOnboarding]);

    return (
        <AuthProvider>
            <OnboardingProvider>
                <RouterProvider router={router} />
            </OnboardingProvider>
        </AuthProvider>
    )
}

export default App;
