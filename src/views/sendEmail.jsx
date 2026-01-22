import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Reutilizamos tu lógica de Toastify por CDN
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
                duration: 5000, // Un poco más de tiempo para que lean bien
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // APUNTA A TU NUEVO ENDPOINT
            const response = await fetch("https://u2.rsgve.com/api/password/email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({ email: email }),
            });

            const data = await response.json();

            if (response.ok) {
                showToast("¡Enlace enviado! Revisa tu correo electrónico", "success");
                // Opcional: Redirigir al login después de unos segundos
                setTimeout(() => navigate("/"), 3000);
            } else {
                showToast(data.message || "No pudimos procesar la solicitud");
            }
        } catch (error) {
            showToast("Error de conexión con el servidor" + error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-vh-100 d-flex align-items-center justify-content-center py-5' style={{ background: '#f8f9fa' }}>
    <div className="container">
        {/* Agregamos mx-auto y eliminamos g-0 si no hay columnas laterales para que el padding respire */}
        <div className="row justify-content-center shadow-lg rounded-4 overflow-hidden bg-white mx-auto" 
             style={{ maxWidth: "450px" }}> 

            <div className="col-12 p-4 p-md-5">
                <div className="text-center mb-5">
                    <i className="bi bi-shield-lock display-4 text-primary"></i>
                    <h2 className="fw-bold text-dark mt-3">¿Olvidaste tu clave?</h2>
                    <p className="text-muted small">Ingresa tu correo y te enviaremos un enlace para recuperarla</p>
                </div>

                <form onSubmit={handleSubmit} className="row g-4">
                    <div className="col-12">
                        <label className='form-label small fw-bold text-uppercase text-muted'>Correo electrónico</label>
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0"><i className="bi bi-envelope text-muted"></i></span>
                            <input 
                                type="email" 
                                className="form-control bg-light border-start-0" 
                                placeholder='email@ejemplo.com' 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="col-12 mt-4">
                        <button type='submit' className='btn btn-primary btn-lg w-100 fw-bold shadow-sm rounded-pill py-2' disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Enviando...
                                </>
                            ) : "Enviar enlace"}
                        </button>
                    </div>
                    
                    <div className="col-12 text-center mt-2">
                        <button type="button" className="btn btn-link small fw-bold text-decoration-none p-0" onClick={() => navigate("/login")}>
                            Volver al Inicio de Sesión
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
    );
};

export default ForgotPassword;