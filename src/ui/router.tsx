import {createBrowserRouter, Outlet} from "react-router-dom";
import Register from "#ui/pages/auth/register.tsx"
import Login from "#ui/pages/auth/login.tsx";
import VerifyAuthProvider from "#providers/VerifyAuthProvider.tsx"

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
            { index: true, element: <div>Dashboard</div> },
            { path: "/auth/register", element: <Register /> },
            { path: "/auth/login", element: <Login /> },
        ],
    },
])