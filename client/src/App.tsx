import "./App.css";
import { Home } from "./components/Home/Home.js";
import Login from "./components/Login/Login";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/login",
        element: <Login />,
    },
]);

function App() {
    return <RouterProvider router={ router } />;
}

export default App;
