import {createBrowserRouter, Outlet} from "react-router-dom";
import Register from "#ui/pages/auth/register.tsx"
import Login from "#ui/pages/auth/login.tsx";
import VerifyAuthProvider from "#providers/VerifyAuthProvider.tsx"
import DashBoardNivel2 from "#ui/pages/nivel2/DashBoardNivel2.tsx";
import Calendar from "#ui/pages/Calendar.tsx";
import Configuration from "#ui/pages/Configuration.tsx";
import CreateRequest from "#ui/pages/CreateRequest.tsx";
import MyRequest from "#ui/pages/MyRequest.tsx";
import Request from "#ui/pages/Request.tsx";
import ApproveRequest from "#ui/pages/gestion/ApproveRequest.tsx";
import ReviewRequestNivel2 from "#ui/pages/nivel2/ReviewRequestNivel2.tsx";
import ReviewRequestDetailNivel2 from "#ui/pages/nivel2/ReviewRequestDetailNivel2.tsx";
import Assistant from "#ui/pages/Assistant.tsx";
import Team from "#ui/pages/Team.tsx";
import Statistics from "#ui/pages/Statistics.tsx";
import MenuLayer from "#ui/layers/menuLayer.tsx";
import Logout from "#ui/pages/auth/logout.tsx";
import RedirectBase from "#ui/pages/RedirectBase.tsx";
import DashBoard from "./pages/DashBoard";
import ReviewRequestNivel1 from "./pages/nivel1/ReviewRequestNivel1";
import ReviewRequestDetailNivel1 from "#ui/pages/nivel1/ReviewRequestDetailNivel1.tsx";
import ApproveRequestDetail from "./pages/gestion/ApproveRequestDetail";

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
            { index: true, element: <RedirectBase /> },
            {
                element: <MenuLayer />,
                children: [
                    { path: "/calendar", element: <Calendar /> },
                    { path: "/dashboard", element: <DashBoard /> },
                    { path: "/config", element: <Configuration /> },
                    { path: "/create-request", element: <CreateRequest /> },
                    { path: "/assistant", element: <Assistant /> },
                    { path: "/statistics", element: <Statistics /> },
                    { path: "/my-requests", element: <MyRequest /> },
                    { path: "/request", element: <MyRequest /> },
                    { path: "/team", element: <Team /> },
                    { path: "/gestion/approve", element: <ApproveRequest /> },
                    { path: "/gestion/approveDetail", element: <ApproveRequestDetail /> },
                    { path: "/nivel1/review", element: <ReviewRequestNivel1 /> },
                    { path: "/nivel1/review/:id", element: <ReviewRequestDetailNivel1 /> },
                    { path: "/nivel2/dashboard", element: <DashBoardNivel2 /> },
                    { path: "/nivel2/review", element: <ReviewRequestNivel2 /> },
                    { path: "/nivel2/review/:id", element: <ReviewRequestDetailNivel2 /> },
                    { path: "/request/:id", element: <Request /> },
                ]
            },
        ],
    },
])