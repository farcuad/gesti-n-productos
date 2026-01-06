import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [formdata, setFormData] = useState({
        name: '',
        store_name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // Cargar Toastify desde CDN para evitar errores de resolución de módulos
    useEffect(() => {
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
    }, []);

    const showToast = (text, type = "error") => {
        if (window.Toastify) {
            window.Toastify({
                text: text,
                duration: 3000,
                gravity: "bottom",
                position: "right",
                style: { 
                    background: type === "success" 
                        ? "linear-gradient(to right, #00b01dff)" 
                        : "linear-gradient(to right, #ff5f6d)" 
                }
            }).showToast();
        } else {
            // Fallback si la librería aún no carga
            console.log(`${type}: ${text}`);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formdata,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formdata.password !== formdata.password_confirmation) {
            showToast("Las contraseñas no coinciden");
            return;
        }

        if (formdata.password.length < 6) {
            showToast("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('https://u2.rsgve.com/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Accept": "application/json"
                },
                body: JSON.stringify(formdata)
            });

            const data = await response.json();
            
            if (response.ok) {
                showToast("¡Bienvenido! Registro exitoso", "success");
                navigate('/');
            } else {
                let errorMessage = data.errors ? Object.values(data.errors).flat()[0] : (data.message || "Verifica los datos");
                showToast(errorMessage);
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
                <div className="row justify-content-center align-items-center g-0 shadow-lg rounded-4 overflow-hidden bg-white mx-2" style={{ minHeight: "650px" }}>
                    
                    {/* COLUMNA IZQUIERDA: MENSAJE (Oculto en móvil) */}
                    <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center p-5 text-white h-100" 
                         style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a4ebd 100%)', minHeight: "650px" }}>
                        <div className="mb-4">
                            <i className="bi bi-shop display-1"></i>
                        </div>
                        <h1 className="fw-bold mb-3">Impulsa tu Negocio al Siguiente Nivel</h1>
                        <p className="lead opacity-75 mb-4">
                            Únete a cientos de emprendedores que ya gestionan su inventario, ventas y personal de manera profesional con nuestra plataforma.
                        </p>
                        <div className="d-flex flex-column gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <i className="bi bi-check-circle-fill fs-4 text-info"></i>
                                <span>Control de inventario en tiempo real</span>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <i className="bi bi-check-circle-fill fs-4 text-info"></i>
                                <span>Gestión de personal y roles</span>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <i className="bi bi-check-circle-fill fs-4 text-info"></i>
                                <span>Reportes detallados de ventas</span>
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: FORMULARIO */}
                    <div className="col-lg-6 col-md-10 p-4 p-md-5 bg-white">
                        <div className="text-center mb-4 d-lg-none">
                            <i className="bi bi-shop fs-1 text-primary"></i>
                            <h2 className="fw-bold mt-2 text-dark">Crea tu Tienda</h2>
                        </div>
                        
                        <div className="mb-4 d-none d-lg-block text-center text-lg-start">
                            <h2 className="fw-bold text-dark">Comienza Gratis</h2>
                            <p className="text-muted">Completa el formulario para registrar tu negocio.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="row g-3">
                            <div className="col-12">
                                <label className='form-label small fw-bold text-uppercase text-muted'>Nombre del Dueño</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-person text-muted"></i></span>
                                    <input 
                                        type="text" 
                                        className='form-control bg-light border-start-0' 
                                        placeholder='Tu nombre completo' 
                                        name='name' 
                                        value={formdata.name} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="col-12">
                                <label className='form-label small fw-bold text-uppercase text-muted'>Nombre de la Tienda</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-building text-muted"></i></span>
                                    <input 
                                        type="text" 
                                        className='form-control bg-light border-start-0' 
                                        placeholder='Ej: Bodega Central' 
                                        name='store_name' 
                                        value={formdata.store_name} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className='col-12'>
                                <label className='form-label small fw-bold text-uppercase text-muted'>Correo electrónico</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-envelope text-muted"></i></span>
                                    <input 
                                        type="email" 
                                        className="form-control bg-light border-start-0" 
                                        name='email' 
                                        placeholder='email@ejemplo.com' 
                                        value={formdata.email} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className='col-md-6'>
                                <label className='form-label small fw-bold text-uppercase text-muted'>Contraseña</label>
                                <div className='input-group'>
                                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock text-muted"></i></span>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        className="form-control bg-light border-start-0 border-end-0" 
                                        name='password' 
                                        placeholder='*******' 
                                        value={formdata.password} 
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
                            
                            <div className='col-md-6'>
                                <label className='form-label small fw-bold text-uppercase text-muted'>Confirmar</label>
                                <div className='input-group'>
                                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-shield-check text-muted"></i></span>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        className="form-control bg-light border-start-0 border-end-0" 
                                        name='password_confirmation' 
                                        placeholder='*******' 
                                        value={formdata.password_confirmation} 
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

                            <div className="col-12 mt-4">
                                <button type='submit' className='btn btn-primary btn-lg w-100 fw-bold shadow-sm rounded-pill py-2' disabled={loading}>
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                    ) : null}
                                    {loading ? "Creando Tienda..." : "Registrar mi Negocio"}
                                </button>
                            </div>
                            
                            <div className="col-12 text-center mt-3">
                                <p className="text-muted small">
                                    ¿Ya gestionas tu tienda con nosotros?{""} <br />
                                    <button type="button" className="btn btn-link fw-bold text-decoration-none p-0" onClick={() => navigate("/")}>Inicia Sesión Aquí</button>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;