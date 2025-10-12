import {createBrowserRouter} from "react-router-dom";
import SignUp from "#pages/SignUp.tsx"
import SignIn from "#pages/SignIn.tsx";

export const router = createBrowserRouter([
    {path: "/", element: <div>Home</div>},
    {path: "/signup", element: <SignUp />},
    {path: "/signin", element: <SignIn />},
    {path: "/dashboard", element: <div>Dashboard</div>},
])