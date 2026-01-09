import React, { useState, useEffect } from "react";

const API_URL = "https://u2.rsgve.com/api";

const getHeaders = (isMultipart = false) => {
  const headers = { Accept: "application/json" };
  if (!isMultipart) headers["Content-Type"] = "application/json";
  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

async function apiRequest(endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;
  const config = {
    ...options,
    headers: { ...getHeaders(isFormData), ...options.headers },
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

function Nav() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // --- ESTADOS DE DATOS ---
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tasa, setStasa] = useState(null);

  // --- ESTADOS DE PAGINACIÓN FRONTEND (9 PRODUCTOS) ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // <--- Cambiado a 9

  const initialFormState = {
    name: "",
    description: "",
    stock: "",
    price: "",
    cost: "",
    image: null,
    min_stock: "",
    category: "",
  };

  const [formdata, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (!window.Swal) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Carga inicial: Trae el listado completo (ahora que quitaste paginate(15) en el backend)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/products`);
      // Manejamos tanto si viene el array directo como si viene envuelto en 'data'
      const listado = Array.isArray(data) ? data : data.data || [];
      setProductos(listado);
    } catch (err) {
      console.error("Error cargando productos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const fetchTasa = async () => {
      try {
        const res = await fetch(
          "https://v6.exchangerate-api.com/v6/4c57d800c11ecff8f364f3e1/latest/USD"
        );
        const data = await res.json();
        setStasa(data?.conversion_rates?.VES);
      } catch (err) {
        console.error("Error al cargar la tasa:", err);
      }
    };
    fetchTasa();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formdata,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleEdit = (producto) => {
    setEditMode(true);
    setCurrentId(producto.id);
    setFormData({
      name: producto.name || "",
      description: producto.description || "",
      stock: producto.stock || "",
      price: producto.price || "",
      cost: producto.cost || "",
      image: null,
      min_stock: producto.min_stock || "",
      category: producto.category_id || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.Swal) return;
    const result = await window.Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await apiRequest(`/products/${id}`, { method: "DELETE" });
        window.Swal.fire(
          "¡Eliminado!",
          "El producto ha sido borrado.",
          "success"
        );
        fetchProducts();
      } catch (error) {
        window.Swal.fire(
          "Error",
          "No se pudo eliminar el producto.",
          "error" + error.message
        );
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const dataToSend = new FormData();

    dataToSend.append("name", formdata.name);
    dataToSend.append("description", formdata.description || "");
    dataToSend.append("stock", formdata.stock);
    dataToSend.append("price", formdata.price);
    dataToSend.append("cost", formdata.cost);
    dataToSend.append("min_stock", formdata.min_stock);
    dataToSend.append("category_id", formdata.category);

    if (formdata.image instanceof File) {
      dataToSend.append("image", formdata.image);
    }
    if (editMode) {
      dataToSend.append("_method", "PUT");
    }

    try {
      const endpoint = editMode ? `/products/${currentId}` : "/products";
      await apiRequest(endpoint, { method: "POST", body: dataToSend });

      if (window.Swal) {
        window.Swal.fire({
          icon: "success",
          title: editMode ? "Actualizado" : "Creado",
          text: `Producto ${editMode ? "actualizado" : "registrado"} con éxito`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
      closeModal();
      fetchProducts();
    } catch (error) {
      if (window.Swal)
        window.Swal.fire(
          "Error",
          error.data?.message || "Ocurrió un error",
          "error"
        );
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentId(null);
    setFormData(initialFormState);
  };

  // --- LÓGICA DE FILTRADO Y PAGINACIÓN ---
  const filteredProducts = productos.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Reiniciar a página 1 cuando se busca
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <>
      <nav className="d-flex justify-content-between align-items-center bg-white px-4 py-3 border-bottom shadow-sm">
        <h4 className="fw-bold mb-0">Gestión de Inventario</h4>
        <button
          className="btn btn-success d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <span className="fs-4">+</span> Nuevo Producto
        </button>
      </nav>

      <div className="p-2">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3">
                <h5 className="mb-0 fw-bold text-dark">
                  Productos Registrados
                </h5>
                <span className="badge bg-light text-dark border">
                  Tasa: {tasa ? `${tasa.toFixed(2)} VES` : "..."}
                </span>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar en todo el inventario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ maxWidth: "300px" }}
              />
            </div>

            <div className="table-responsive ">
              <table className="table table-hover align-middle">
                <thead className="table-light text-secondary">
                  <tr>
                    <th>Imagen</th>
                    <th>Producto</th>
                    <th>Precio ($)</th>
                    <th>Precio (Bs)</th>
                    <th>Stock</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        ></div>
                      </td>
                    </tr>
                  ) : currentItems.length > 0 ? (
                    currentItems.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <img
                            src={`https://u2.rsgve.com${p.image_url}`}
                            alt={p.name}
                            className="rounded border"
                            style={{
                              width: 45,
                              height: 45,
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/no-image.png";
                            }}
                          />
                        </td>
                        <td>
                          <div className="fw-bold">{p.name}</div>
                          <small
                            className="text-muted text-truncate d-block"
                            style={{ maxWidth: "200px" }}
                          >
                            {p.description}
                          </small>
                        </td>
                        <td className="fw-semibold">${p.price}</td>
                        <td className="text-success fw-bold">
                          {tasa ? (p.price * tasa).toFixed(2) : "---"}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              p.stock <= p.min_stock
                                ? "bg-danger"
                                : "bg-success"
                            }`}
                          >
                            {p.stock} unid.
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(p)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(p.id)}
                          >
                            Borrar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No se encontraron productos coincidentes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* --- PAGINACIÓN NUMÉRICA (9 POR PÁGINA) --- */}
            {totalPages > 1 && (
              <nav className="mt-4">
                <ul className="pagination justify-content-center">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <li
                        key={pageNum}
                        className={`page-item ${
                          currentPage === pageNum ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL ORIGINAL --- */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div
                className={`modal-header ${
                  editMode ? "bg-primary" : "bg-success"
                } text-white`}
              >
                <h5 className="modal-title fw-bold">
                  {editMode ? "Editar Producto" : "Nuevo Producto"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-uppercase">
                      Nombre del Producto
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="form-control shadow-sm"
                      value={formdata.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold small text-uppercase">
                        Precio de Venta ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        className="form-control shadow-sm"
                        value={formdata.price}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold small text-uppercase">
                        Costo Unitario ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="cost"
                        className="form-control shadow-sm"
                        value={formdata.cost}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold small text-uppercase">
                        Cantidad Stock
                      </label>
                      <input
                        type="number"
                        name="stock"
                        className="form-control shadow-sm"
                        value={formdata.stock}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold small text-uppercase">
                        Stock Bajo
                      </label>
                      <input
                        type="number"
                        name="min_stock"
                        className="form-control shadow-sm"
                        value={formdata.min_stock}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold small text-uppercase">
                        Categoría
                      </label>
                      <select
                        name="category"
                        className="form-select shadow-sm"
                        value={formdata.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccionar...</option>
                        <option value="1">General</option>
                        <option value="2">Papelería</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small text-uppercase">
                      Descripción
                    </label>
                    <textarea
                      name="description"
                      className="form-control shadow-sm"
                      rows="2"
                      value={formdata.description}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small text-uppercase">
                      Imagen del Producto
                    </label>
                    <input
                      type="file"
                      name="image"
                      className="form-control shadow-sm"
                      onChange={handleChange}
                      accept="image/*"
                      required={!editMode}
                    />
                    {editMode && (
                      <small className="text-muted d-block mt-1 italic">
                        Deja vacío para mantener la imagen actual.
                      </small>
                    )}
                  </div>
                </div>

                <div className="modal-footer bg-light p-3 border-0">
                  <button
                    type="button"
                    className="btn btn-secondary fw-bold"
                    onClick={closeModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`btn ${
                      editMode ? "btn-primary" : "btn-success"
                    } px-4 fw-bold`}
                    disabled={loading}
                  >
                    {loading
                      ? "Procesando..."
                      : editMode
                      ? "Actualizar"
                      : "Registrar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Nav;
