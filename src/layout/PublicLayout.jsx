import React from "react";
import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <div>
      {/* You can add a header here if needed */}
      <Outlet /> {/* Child routes (like /login, /signup) will render here */}
    </div>
  );
};

export default PublicLayout;
