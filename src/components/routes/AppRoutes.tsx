import { Routes, Route } from "react-router-dom";
import App from "../../App";
import Login from "../pages/login";
import Signup from "../pages/signup";
const AppRoutes = () => {
    return(
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
        </Routes>
    )
}
export default AppRoutes;