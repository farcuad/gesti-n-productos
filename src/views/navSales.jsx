import React, { useEffect, useState } from "react";

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
    const error = new Error(errorData.message || "Error en la operación");
    error.data = errorData;
    throw error;
  }
  return response.status === 204 ? null : await response.json();
}

function SalesManager() {
  const [productos, setProductos] = useState([]);
  const [cart, setCart] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [tasa, setTasa] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- ESTADOS DE PAGINACIÓN ---
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

    if (!window.Swal) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const fetchData = async () => {
    try {
      const data = await apiRequest('/products');
      setProductos(data.data || data);
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        if (window.Swal) window.Swal.fire("Límite alcanzado", "No hay más stock disponible", "warning");
        return;
      }
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (id, newQty) => {
    const product = productos.find(p => p.id === id);
    if (newQty > product.stock) return;
    if (newQty < 1) {
      setCart(cart.filter(item => item.id !== id));
      return;
    }
    setCart(cart.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleSaleSubmit = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const salePayload = {
        products: cart.map(item => ({
          id: item.id,
          quantity: item.quantity
        }))
      };

      await apiRequest('/sales', {
        method: "POST",
        body: JSON.stringify(salePayload),
      });

      if (window.Swal) {
        window.Swal.fire({
          title: "¡Venta Exitosa!",
          text: "Los productos han sido procesados correctamente",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
      }

      setCart([]);
      fetchData();
    } catch (error) {
      console.error("❌ Error al vender:", error);
      if (window.Swal) window.Swal.fire("Error", error.data?.message || "No se pudo procesar la venta", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE FILTRADO Y PAGINACIÓN ---
  const filteredProducts = productos.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  // Reiniciar a la página 1 si se busca algo nuevo
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalUSD = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="bg-light">
      <div className="d-flex align-items-center justify-content-between flex-wrap px-4 py-3 bg-white border-bottom shadow-sm">
        <h4 className="fw-bold mb-0 text-dark">
          <i className="bi bi-cart-check text-success me-2"></i>
          Punto de Venta
        </h4>

        <div className="d-flex align-items-center gap-3">
          {tasa && (
            <span className="badge bg-light text-dark border p-2">
              Tasa: <span className="text-primary">{tasa.toFixed(2)} Bs</span>
            </span>
          )}
          <input 
            type="text" 
            className="form-control shadow-sm" 
            placeholder="Buscar producto..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
            style={{ maxWidth: "250px" }}
          />
        </div>
      </div>

      <div className="container-fluid p-4">
        <div className="row g-4">
          {/* LISTA DE PRODUCTOS */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold text-uppercase text-muted">Catálogo de Productos</h6>
                <small className="text-muted">Mostrando {currentItems.length} de {filteredProducts.length}</small>
              </div>
              <div className="table-responsive" style={{ minHeight: '450px' }}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Producto</th>
                      <th>Precio ($)</th>
                      <th>Stock</th>
                      <th className="text-end pe-4">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((p) => (
                      <tr key={p.id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <img 
                              src={`https://u2.rsgve.com${p.image_url}`} 
                              alt="" 
                              className="rounded me-3 border" 
                              style={{width: '45px', height: '45px', objectFit: 'cover'}}
                              onError={(e) => e.target.src = '/no-image.png'}
                            />
                            <div>
                              <div className="fw-bold">{p.name}</div>
                              {tasa && <small className="text-success fw-bold">Bs {(p.price * tasa).toFixed(2)}</small>}
                            </div>
                          </div>
                        </td>
                        <td className="fw-bold text-dark">${parseFloat(p.price).toFixed(2)}</td>
                        <td>
                          <span className={`badge ${p.stock <= (p.min_stock || 5) ? 'bg-danger' : 'bg-info text-dark'}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <button 
                            className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold"
                            onClick={() => addToCart(p)}
                            disabled={p.stock <= 0}
                          >
                            <i className="bi bi-plus-lg me-1"></i> Añadir
                          </button>
                        </td>
                      </tr>
                    ))}
                    {currentItems.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-5 text-muted">No se encontraron productos.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* --- PAGINACIÓN FRONTEND --- */}
              {totalPages > 1 && (
                <div className="card-footer bg-white border-0 py-3">
                  <nav>
                    <ul className="pagination pagination-sm justify-content-center mb-0">
                      {[...Array(totalPages)].map((_, i) => (
                        <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                          <button className="page-link shadow-none" onClick={() => setCurrentPage(i + 1)}>
                            {i + 1}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>

          {/* CARRITO DE COMPRAS */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-lg rounded-4 sticky-top" style={{ top: "90px" }}>
              <div className="card-header bg-dark text-white py-3 rounded-top-4 border-0 d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold"><i className="bi bi-bag-fill me-2"></i>Carrito</h6>
                <span className="badge bg-primary">{cart.length} items</span>
              </div>
              <div className="card-body p-0" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {cart.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-cart3 fs-1 text-muted opacity-25"></i>
                    <p className="text-muted mt-2">El carrito está vacío</p>
                  </div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {cart.map((item) => (
                      <li key={item.id} className="list-group-item p-3 border-bottom-0">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className="fw-bold small">{item.name}</span>
                          <button className="btn btn-link btn-sm text-danger p-0" onClick={() => removeFromCart(item.id)}>
                            <i className="bi bi-x-circle-fill"></i>
                          </button>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center border rounded-pill bg-light p-1">
                            <button className="btn btn-sm btn-light rounded-circle py-0" onClick={() => updateCartQuantity(item.id, item.quantity - 1)}>-</button>
                            <span className="px-3 fw-bold small">{item.quantity}</span>
                            <button className="btn btn-sm btn-light rounded-circle py-0" onClick={() => updateCartQuantity(item.id, item.quantity + 1)}>+</button>
                          </div>
                          <span className="fw-bold text-dark">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="card-footer bg-white p-4 border-top">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted fw-bold">Subtotal:</span>
                  <span className="fw-bold">${totalUSD.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-4">
                  <span className="text-muted fw-bold">Total Bs:</span>
                  <h4 className="fw-bold text-success mb-0">
                    {tasa ? `Bs ${(totalUSD * tasa).toLocaleString('es-VE', { minimumFractionDigits: 2 })}` : "---"}
                  </h4>
                </div>
                <button 
                  className="btn btn-success w-100 py-3 rounded-3 fw-bold shadow-sm"
                  disabled={loading || cart.length === 0}
                  onClick={handleSaleSubmit}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <i className="bi bi-cash-stack me-2"></i>
                  )}
                  PROCESAR VENTA
                </button>
                {cart.length > 0 && (
                  <button className="btn btn-link btn-sm w-100 mt-2 text-muted text-decoration-none" onClick={() => setCart([])}>
                    Vaciar carrito
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesManager;