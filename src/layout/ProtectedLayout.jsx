// ProtectedLayout.jsx
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const ProtectedLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

export default ProtectedLayout;
