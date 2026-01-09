import React, { useState, useEffect } from "react";

// --- CONFIGURACIÓN DE API INTEGRADA ---
const API_URL = "https://u2.rsgve.com/api";

const getHeaders = () => {
  const headers = { 
    "Accept": "application/json",
    "Content-Type": "application/json"
  };
  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

async function apiRequest(endpoint, options = {}) {
  const config = {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  };
  const response = await fetch(`${API_URL}${endpoint}`, config);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error en la operación");
  }
  return response.status === 204 ? null : await response.json();
}

function SalesHistory() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState(""); // 1. Estado para búsqueda por fecha
  const [tasa, setTasa] = useState(null);

  // 2. Estados para Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchData();
    const fetchTasa = async () => {
      try {
        const res = await fetch("https://v6.exchangerate-api.com/v6/4c57d800c11ecff8f364f3e1/latest/USD");
        const data = await res.json();
        setTasa(data?.conversion_rates?.VES);
      } catch (err) { console.error("Error tasa:", err); }
    };
    fetchTasa();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await apiRequest('/sales-history');
      setVentas(result.data || []);
    } catch (error) {
      console.error("❌ Error al obtener historial de ventas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado combinado: Texto y Fecha
  const filteredSales = ventas.filter((venta) => {
    const matchesText = venta.details?.some(detail => 
      detail.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || venta.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = searchDate ? venta.created_at.includes(searchDate) : true;

    return matchesText && matchesDate;
  });

  // Lógica de Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  const totalGeneralUSD = filteredSales.reduce((acc, v) => acc + parseFloat(v.total), 0);

  // Reiniciar a la página 1 cuando se busca
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchDate]);

  return (
    <> 
      <div className="d-flex align-items-center justify-content-between flex-wrap px-4 py-3 bg-white border-bottom shadow-sm">
        <h4 className="fw-bold mb-0 text-dark">
          <i className="bi bi-clock-history text-primary me-2"></i>
          Registro de Ventas
        </h4>
        
        <div className="d-flex align-items-center gap-2 flex-wrap mt-2 mt-md-0">
          {/* Filtro por Fecha */}
          <input 
            type="date" 
            className="form-control shadow-sm"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            style={{ maxWidth: "160px" }}
          />
          {/* Filtro por Texto */}
          <input 
            type="text" 
            className="form-control shadow-sm" 
            placeholder="Buscar producto..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
            style={{ maxWidth: "200px" }}
          />
          <button className="btn btn-outline-primary" onClick={fetchData} title="Refrescar datos">
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Resumen de Ingresos */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm bg-dark text-white p-3 rounded-4">
              <div className="small text-uppercase opacity-75 fw-bold text-truncate">Ganancias (USD)</div>
              <h2 className="fw-bold mb-0">${totalGeneralUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary">
                <tr>
                  <th className="ps-4">Fecha</th>
                  <th>Producto(s)</th>
                  <th>Cant.</th>
                  <th>Total ($)</th>
                  <th>Vendedor</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                      <span className="text-muted">Cargando historial...</span>
                    </td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((venta) => (
                    <tr key={venta.id}>
                      <td className="ps-4">
                        <div className="fw-bold small text-dark">{venta.created_at.split(' ')[0]}</div>
                        <div className="text-muted" style={{fontSize: '0.75rem'}}>{venta.created_at.split(' ')[1]}</div>
                      </td>
                      <td>
                        {venta.details.map((d, i) => (
                          <div key={i} className="fw-semibold text-primary small">
                            {d.name}
                          </div>
                        ))}
                      </td>
                      <td>
                        {venta.details.map((d, i) => (
                          <div key={i} className="badge bg-light text-dark border me-1">
                            {d.quantity}
                          </div>
                        ))}
                      </td>
                      <td>
                        <span className="fw-bold text-dark">${parseFloat(venta.total).toFixed(2)}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '24px', height: '24px', fontSize: '10px'}}>
                            {venta.seller?.name?.charAt(0)}
                          </div>
                          <span className="small text-truncate" style={{maxWidth: '100px'}}>{venta.seller?.name || 'Desconocido'}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      No se encontraron registros de ventas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Controles de Paginación */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-light border-top">
              <span className="small text-muted">
                Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredSales.length)} de {filteredSales.length}
              </span>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(prev => prev - 1)}>
                      Anterior
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(prev => prev + 1)}>
                      Siguiente
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SalesHistory;