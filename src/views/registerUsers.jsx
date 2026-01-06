import React, { useEffect, useState } from "react";

// --- CONFIGURACIÓN DE API ---
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

function UserManager() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Estado para el nuevo trabajador (Solo los campos requeridos por la API)
  const [newUser, setNewUser] = useState({ 
    name: "", 
    email: "", 
    password: ""
  });

  useEffect(() => {
    fetchUsers();
    // Cargar SweetAlert2 si no está disponible
    if (!window.Swal) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiRequest('/users');
      setUsuarios(data.data || data);
    } catch (error) {
      console.error("❌ Error al obtener usuarios:", error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Enviamos solo name, email y password según lo solicitado
      await apiRequest('/users', {
        method: "POST",
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password
        }),
      });

      if (window.Swal) {
        window.Swal.fire({
          title: "¡Creado!",
          text: "El trabajador ha sido registrado correctamente (Rol: Empleado).",
          icon: "success",
          confirmButtonColor: "#0d6efd"
        });
      }

      setNewUser({ name: "", email: "", password: "" });
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      if (window.Swal) {
        window.Swal.fire("Error", error.data?.message || "No se pudo crear el usuario", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.Swal) return;

    const result = await window.Swal.fire({
      title: "¿Eliminar trabajador?",
      text: "Esta acción no se puede deshacer y el usuario perderá el acceso.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        await apiRequest(`/users/${id}`, { method: "DELETE" });
        window.Swal.fire("Eliminado", "El trabajador ha sido borrado del sistema.", "success");
        fetchUsers();
      } catch (error) {
        window.Swal.fire("Error", "Ocurrió un error al intentar eliminar.", "error" + error);
      }
    }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* HEADER DE SECCIÓN */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Gestión de Personal</h3>
          <p className="text-muted mb-0">Administra los accesos de tus trabajadores. Nuevos registros se crean como empleados por defecto.</p>
        </div>
        <button 
          className="btn btn-primary btn-lg shadow-sm px-4 fw-bold rounded-pill"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-person-plus-fill me-2"></i>
          Nuevo Trabajador
        </button>
      </div>

      {/* LISTADO DE USUARIOS */}
      <div className="row g-4">
        {usuarios.length > 0 ? (
          usuarios.map((user) => (
            <div key={user.id} className="col-md-6 col-lg-4 col-xl-3">
              <div className="card border-0 shadow-sm rounded-4 h-100 transition-hover">
                <div className="card-body p-4 text-center">
                  <div 
                    className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary"
                    style={{ width: "70px", height: "70px" }}
                  >
                    <i className="bi bi-person-vcard fs-2"></i>
                  </div>
                  
                  <h5 className="fw-bold text-dark mb-1 text-truncate">{user.name}</h5>
                  <p className="text-muted small mb-3 text-truncate">{user.email}</p>
                  
                  <div className="d-flex justify-content-center gap-2 mb-3">
                    <span className="badge rounded-pill px-3 py-2 bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
                      Empleado
                    </span>
                  </div>

                  <hr className="my-3 opacity-50" />

                  <button 
                    className="btn btn-outline-danger border-0 btn-sm fw-bold w-100 rounded-pill"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <i className="bi bi-trash3 me-2"></i>Eliminar Acceso
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-dashed">
              <i className="bi bi-people display-1 text-muted opacity-25"></i>
              <h5 className="text-muted mt-3">No hay trabajadores registrados aún</h5>
              <button className="btn btn-link text-primary text-decoration-none" onClick={() => setShowModal(true)}>
                Registra el primero aquí
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL PARA AGREGAR TRABAJADOR */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <form onSubmit={handleCreateUser}>
                <div className="modal-header bg-primary text-white border-0 py-3 rounded-top-4">
                  <h5 className="modal-title fw-bold">
                    <i className="bi bi-person-plus me-2"></i>Registrar Trabajador
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary text-uppercase">Nombre Completo</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><i className="bi bi-person text-muted"></i></span>
                      <input 
                        type="text" 
                        className="form-control bg-light border-start-0" 
                        required 
                        placeholder="Ej: Juan Pérez"
                        value={newUser.name} 
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary text-uppercase">Correo Electrónico</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><i className="bi bi-envelope text-muted"></i></span>
                      <input 
                        type="email" 
                        className="form-control bg-light border-start-0" 
                        required 
                        placeholder="email@empresa.com"
                        value={newUser.email} 
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="mb-0">
                    <label className="form-label small fw-bold text-secondary text-uppercase">Contraseña</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock text-muted"></i></span>
                      <input 
                        type="password" 
                        className="form-control bg-light border-start-0" 
                        required 
                        placeholder="Mínimo 6 caracteres"
                        value={newUser.password} 
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                      />
                    </div>
                    <small className="text-muted mt-2 d-block">Nota: El usuario se creará con el rol de <strong>empleado</strong> automáticamente.</small>
                  </div>
                </div>

                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="button" className="btn btn-light px-4 fw-bold rounded-pill" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary px-5 fw-bold rounded-pill shadow-sm" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Guardando...
                      </>
                    ) : "Crear Usuario"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ESTILOS EXTRA */}
      <style>{`
        .transition-hover {
          transition: transform 0.2s ease, shadow 0.2s ease;
        }
        .transition-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 1rem 3rem rgba(0,0,0,.1) !important;
        }
        .border-dashed {
          border: 2px dashed #dee2e6 !important;
        }
      `}</style>
    </div>
  );
}

export default UserManager;