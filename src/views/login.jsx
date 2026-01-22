import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
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
                        ? "linear-gradient(to right, #26c240ff)" 
                        : "linear-gradient(to right, #ff5f6d)" 
                }
            }).showToast();
        } else {
            console.log(`${type}: ${text}`);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("https://u2.rsgve.com/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                showToast("¡Bienvenido de nuevo!", "success");
                navigate("/home");
            } else {
                showToast(data.message || "Credenciales incorrectas");
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
                <div className="row justify-content-center align-items-center g-0 shadow-lg rounded-4 overflow-hidden bg-white mx-2" style={{ minHeight: "550px", margin: "auto" }}>
                    
                    {/* COLUMNA IZQUIERDA: IMAGEN/MENSAJE */}
                    <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center p-5 text-white h-100" 
                         style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a4ebd 100%)', minHeight: "550px" }}>
                        <div className="mb-4">
                            <i className="bi bi-shield-lock display-1"></i>
                        </div>
                        <h1 className="fw-bold mb-3">Acceso Seguro</h1>
                        <p className="lead opacity-75 mb-4">
                            Ingresa a tu panel administrativo para gestionar tu inventario, ventas y equipo en tiempo real.
                        </p>
                        <div className="mt-2 p-3 bg-white bg-opacity-10 rounded-3">
                            <small className="d-block mb-1 opacity-75 italic">"La mejor forma de predecir el futuro es crearlo gestionando bien tu presente."</small>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: FORMULARIO */}
                    <div className="col-lg-6 p-4 p-md-5 bg-white">
                        <div className="text-center mb-5">
                            <i className="bi bi-person-circle display-4 text-primary d-lg-none"></i>
                            <h2 className="fw-bold text-dark mt-3">Iniciar Sesión</h2>
                            <p className="text-muted">Ingresa tus credenciales para continuar</p>
                        </div>

                        <form onSubmit={handleSubmit} className="row g-4">
                            <div className="col-12">
                                <label className='form-label small fw-bold text-uppercase text-muted'>Correo electrónico</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-envelope text-muted"></i></span>
                                    <input 
                                        type="email" 
                                        className="form-control bg-light border-start-0" 
                                        name='email' 
                                        placeholder='email@ejemplo.com' 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className='col-12'>
                                <label className='form-label small fw-bold text-uppercase text-muted'>Contraseña</label>
                                <div className='input-group'>
                                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock text-muted"></i></span>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        className="form-control bg-light border-start-0 border-end-0" 
                                        name='password' 
                                        placeholder='*******' 
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

                            <div className="col-12 mt-4">
                                <button type='submit' className='btn btn-primary btn-lg w-100 fw-bold shadow-sm rounded-pill py-2' disabled={loading}>
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Validando...
                                        </>
                                    ) : "Entrar al Panel"}
                                </button>
                            </div>
                            
                            <div className="col-12 text-center">
                                <p className="text-muted small">
                                    <button type="button" className="btn btn-link fw-bold text-decoration-none p-0" onClick={() => navigate("/send-email")}>Recuperar Contraseña</button>
                                </p>
                            </div>
                            <div className="col-12 text-center mt-4">
                                <p className="text-muted small">
                                    ¿Aún no tienes una tienda?{""} <br />
                                    <button type="button" className="btn btn-link fw-bold text-decoration-none p-0" onClick={() => navigate("/register")}>Crea una cuenta gratis aquí</button>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;