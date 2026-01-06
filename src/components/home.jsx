import { Routes, Route, Navigate } from "react-router-dom";
import Aside from "./aside";
import Header from "./header";
import Nav from "../views/navProducts";
import NavSales from "../views/navSales";
import SalesHistory from "../views/historySales";
import RegisterUsers from "../views/registerUsers";
import { useState } from "react";
function Home() {
  const [asideOpen, setAsideOpen] = useState(true);

  const toggleAside = () => {
    setAsideOpen(!asideOpen);
  }
  return (
    <div className="d-flex ">
       <Aside open={asideOpen} onClose={toggleAside} />
      <div className="flex-grow-1">
        <Header toggleAside={toggleAside}  />

        <Routes>
          <Route index element={<Navigate to="gestion-productos" replace />} />

          <Route path="gestion-productos" element={<Nav />} />
          <Route path="ventas" element={<NavSales />} />
          <Route path="historial-ventas" element={<SalesHistory />} />
          <Route path="trabajadores" element={<RegisterUsers />} />
        </Routes>
      </div>
    </div>
  );
}

export default Home;
