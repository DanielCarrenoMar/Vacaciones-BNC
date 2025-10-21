import {createBrowserRouter, Outlet} from "react-router-dom";
import Register from "#ui/pages/auth/register.tsx"
import Login from "#ui/pages/auth/login.tsx";
import VerifyAuthProvider from "#providers/VerifyAuthProvider.tsx"
import DashBoard from "#ui/pages/DashBoard.tsx";
import Calendar from "#ui/pages/Calendar.tsx";
import Configuration from "#ui/pages/Configuration.tsx";
import CreateRequest from "#ui/pages/CreateRequest.tsx";
import MyRequest from "#ui/pages/MyRequest.tsx";
import Request from "#ui/pages/Request.tsx";
import ApproveRequest from "#ui/pages/gestion/ApproveRequest.tsx";
import ReviewRequestNivel1 from "#ui/pages/nivel1/ReviewRequestNivel1.tsx";
import ReviewRequestNivel2 from "#ui/pages/nivel2/ReviewRequestNivel2.tsx";
import Assistant from "./pages/Assistant";
import MenuLayer from "./layers/menuLayer";
import Logout from "./pages/auth/logout";

// Root routes: wrap all routes with VerifyAuthProvider so that
// the provider can use react-router hooks (useNavigate/useLocation).
export const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <VerifyAuthProvider>
                <Outlet />
            </VerifyAuthProvider>
        ),
        children: [
            { path: "/auth/register", element: <Register /> },
            { path: "/auth/login", element: <Login /> },
            { path: "/auth/logout", element: <Logout /> },
            {
                element: <MenuLayer />,
                children: [
                    { index: true, element: <DashBoard /> },
                    { path: "/calendar", element: <Calendar /> },
                    { path: "/config", element: <Configuration /> },
                    { path: "/create-request", element: <CreateRequest /> },
                    { path: "/assistant", element: <Assistant /> },
                    { path: "/my-requests", element: <MyRequest /> },
                    { path: "/request", element: <MyRequest /> },
                    { path: "/gestion/approve", element: <ApproveRequest /> },
                    { path: "/nivel1/review", element: <ReviewRequestNivel1 /> },
                    { path: "/nivel2/review", element: <ReviewRequestNivel2 /> },
                ]
            },
            { path: "/request/:id", element: <Request /> },
        ],
    },
])