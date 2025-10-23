import { Routes, Route } from "react-router-dom";
import App from "../../App";
import Login from "../pages/login";
import Register from "../pages/register";

const AppRoutes = () => {
    return(
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Routes>
    )
}
export default AppRoutes;