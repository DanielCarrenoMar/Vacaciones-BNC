import {createBrowserRouter} from "react-router-dom";
import Register from "#ui/pages/auth/register.tsx"
import Login from "#ui/pages/auth/login.tsx";

export const router = createBrowserRouter([
    {path: "/", element: <div>Home</div>},
    {path: "/register", element: <Register />},
    {path: "/login", element: <Login />},
    {path: "/dashboard", element: <div>Dashboard</div>},
])