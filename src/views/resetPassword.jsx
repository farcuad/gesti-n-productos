import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        token: "",
        email: "",
        password: "",
        password_confirmation: ""
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Efecto para cargar Toastify y capturar datos de la URL
    useEffect(() => {
        // Cargar Toastify
        if (!window.Toastify) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css";
            document.head.appendChild(link);

            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/toastify-js";
            script.async = true;
            document.body.appendChild(script);
        }

        // CAPTURAR TOKEN Y EMAIL DE LA URL
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get("token");
        const email = queryParams.get("email");

        if (token && email) {
            setFormData(prev => ({ ...prev, token, email }));
        } else {
            // Si no hay parámetros, el acceso es inválido
            showToast("Enlace de recuperación inválido o expirado");
            setTimeout(() => navigate("/"), 3000);
        }
    }, [location, navigate]);

    const showToast = (text, type = "error") => {
        if (window.Toastify) {
            window.Toastify({
                text: text,
                duration: 4000,
                gravity: "bottom",
                position: "right",
                style: { 
                    background: type === "success" 
                        ? "linear-gradient(to right, #26c240ff)" 
                        : "linear-gradient(to right, #ff5f6d)" 
                }
            }).showToast();
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.password_confirmation) {
            showToast("Las contraseñas no coinciden");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("https://u2.rsgve.com/api/password/reset", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                showToast("¡Contraseña actualizada! Ya puedes iniciar sesión", "success");
                setTimeout(() => navigate("/"), 3000);
            } else {
                showToast(data.message || "Error al actualizar la contraseña");
            }
        } catch (error) {
            showToast("Error de conexión con el servidor" + error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-vh-100 d-flex align-items-center justify-content-center py-5' style={{ background: 'white' }}>
            <div className="container">
                <div className="row justify-content-center align-items-center g-0 shadow-lg rounded-4 overflow-hidden bg-white mx-auto" style={{ maxWidth: "500px", margin: "auto" }}>

                    <div className="col-12 p-4 p-md-5 bg-white">
                        <div className="text-center mb-5">
                            <i className="bi bi-key-fill display-4 text-primary"></i>
                            <h2 className="fw-bold text-dark mt-3">Nueva Contraseña</h2>
                            <p className="text-muted">Establece tu nueva clave de acceso para <b>{formData.email}</b></p>
                        </div>

                        <form onSubmit={handleSubmit} className="row g-4">
                            
                            {/* Campo Nueva Contraseña */}
                            <div className='col-12'>
                                <label className='form-label small fw-bold text-uppercase text-muted'>Nueva Contraseña</label>
                                <div className='input-group'>
                                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock-fill text-muted"></i></span>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        className="form-control bg-light border-start-0 border-end-0" 
                                        name='password' 
                                        placeholder='Mínimo 8 caracteres' 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                    <button 
                                        type='button' 
                                        className="input-group-text bg-light border-start-0"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} ></i>
                                    </button>
                                </div>
                            </div>

                            {/* Campo Confirmar Contraseña */}
                            <div className='col-12'>
                                <label className='form-label small fw-bold text-uppercase text-muted'>Confirmar Contraseña</label>
                                <div className='input-group'>
                                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-check-circle-fill text-muted"></i></span>
                                    <input 
                                        type="password" 
                                        className="form-control bg-light border-start-0" 
                                        name='password_confirmation' 
                                        placeholder='Repite tu contraseña' 
                                        value={formData.password_confirmation} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="col-12 mt-4">
                                <button type='submit' className='btn btn-primary btn-lg w-100 fw-bold shadow-sm rounded-pill py-2' disabled={loading}>
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Procesando...
                                        </>
                                    ) : "Cambiar Contraseña"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;