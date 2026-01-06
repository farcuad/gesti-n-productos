import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// --- CONFIGURACIÓN DE API ---
const API_URL = "https://u2.rsgve.com/api";

function Header({ toggleAside }) {
  const [openMenu, setOpenMenu] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  // ✅ Cerrar menús al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setOpenNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Obtener alertas de stock bajo
  const fetchLowStock = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/lowstock`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Asumiendo que la API devuelve un array de objetos con el formato mencionado
        setLowStockAlerts(data.data || data || []);
      }
    } catch (error) {
      console.error("Error al obtener stock bajo:", error);
    }
  };

  useEffect(() => {
    fetchLowStock();
    // Opcional: Polling cada 60 segundos para mantener alertas frescas
    const interval = setInterval(fetchLowStock, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="d-flex justify-content-between align-items-center border-bottom px-4 py-2 flex-wrap bg-body-tertiary shadow-sm">
      {/* Ícono para abrir/cerrar aside */}
      <div className="d-flex align-items-center">
        <i
          className="bi bi-list fs-3"
          style={{ cursor: "pointer" }}
          onClick={toggleAside}
        ></i>
      </div>

      <div className="d-flex align-items-center gap-4">
        
        {/* 🔔 Notificaciones de Stock Bajo */}
        <div className="position-relative" ref={notifRef}>
          <div 
            className="cursor-pointer position-relative" 
            style={{ cursor: "pointer" }}
            onClick={() => setOpenNotifications(!openNotifications)}
          >
            <i className="bi bi-bell fs-4"></i>
            {lowStockAlerts.length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                {lowStockAlerts.length}
              </span>
            )}
          </div>

          {openNotifications && (
            <div
              className="position-absolute bg-white border rounded-4 shadow-lg p-0 mt-3"
              style={{ right: "-50px", zIndex: 1050, width: "300px", overflow: "hidden" }}
            >
              <div className="bg-danger text-white px-3 py-2 fw-bold small d-flex justify-content-between align-items-center">
                <span>Alertas de Inventario</span>
                <span className="badge bg-white text-danger">{lowStockAlerts.length}</span>
              </div>
              <div className="overflow-auto" style={{ maxHeight: "350px" }}>
                {lowStockAlerts.length > 0 ? (
                  lowStockAlerts.map((alert, idx) => (
                    <div key={idx} className="p-3 border-bottom hover-bg-light">
                      <div className="d-flex gap-2">
                        <i className="bi bi-exclamation-triangle-fill text-warning"></i>
                        <div>
                          <p className="mb-1 fw-bold small text-dark">{alert.message}</p>
                          <div className="d-flex justify-content-between align-items-center mt-1">
                            <span className="badge bg-light text-dark border">Actual: {alert.current_stock}</span>
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>Mín: {alert.min_stock_level}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted">
                    <i className="bi bi-check-circle text-success d-block fs-2 mb-2"></i>
                    <small>Todo el stock está en niveles óptimos</small>
                  </div>
                )}
              </div>
              {lowStockAlerts.length > 0 && (
                <div className="p-2 bg-light text-center border-top">
                  <button 
                    className="btn btn-sm btn-link text-decoration-none fw-bold" 
                    onClick={() => { navigate("/inventory"); setOpenNotifications(false); }}
                  >
                    Ir al Inventario
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 👤 Menú de usuario */}
        <div className="position-relative" ref={menuRef}>
          <div
            className="d-flex align-items-center gap-2"
            style={{ cursor: "pointer" }}
            onClick={() => setOpenMenu(!openMenu)}
          >
            <div className="text-end d-none d-sm-block">
              <div className="fw-bold small leading-none">Administrador</div>
            </div>
            <i className="bi bi-person-circle fs-3 text-secondary"></i>
          </div>

          {openMenu && (
            <div
              className="position-absolute bg-white border rounded-3 shadow-sm p-2 mt-2"
              style={{ right: 0, zIndex: 1000, minWidth: "180px" }}
            >
              <div className="px-3 py-2 border-bottom mb-2 d-sm-none">
                <div className="fw-bold small">Administrador</div>
              </div>
              <button
                className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-bold"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right"></i>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>

      </div>

      <style>{`
        .hover-bg-light:hover {
          background-color: #f8f9fa;
        }
        .leading-none {
          line-height: 1;
        }
      `}</style>
    </header>
  );
}

export default Header;