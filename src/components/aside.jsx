import { NavLink } from "react-router-dom";
import styles from "../css/index.module.css";

function Aside({ open, onClose }) {
  return (
    <>
      {open && (
        <div className={`${styles.overlay} d-md-none`} onClick={onClose} 
        ></div>
      )}

      <aside className={` bg-dark text-white d-flex flex-column  ${styles.aside}  ${open ? styles.show : styles.hide}`} >
        <div className="p-4">
        <div>
          <h5 className="fw-bold">Tablero de Administración</h5>
          <hr />
        </div>
        <div>
          <h6 className="text-white text-uppercase small">Gestión de Productos</h6>
          <ul className="list-unstyled ms-2 mt-2">
            <li className={`mb-2 p-2 ${styles.create}`}>
              <NavLink
                to="/home/gestion-productos"
                className="d-flex align-items-center text-white text-decoration-none w-100" >
                  
                <i className="bi bi-plus-lg me-2"></i>
                Gestion de Productos
              </NavLink>
            </li>
            <li className={`mb-2 p-2 ${styles.update}`}>
              <NavLink
                to="/home/ventas"
                className="d-flex align-items-center text-white text-decoration-none w-100">

                <i class="bi bi-cart-plus me-2"></i>
                Generar Ventas
              </NavLink>
            </li>
            <li className={`mb-2 p-2 ${styles.delete}`}>
              <NavLink
                to="/home/historial-ventas"
                className="d-flex align-items-center text-white text-decoration-none w-100">

                <i class="bi bi-clock-history me-2"></i>
                Historial de Ventas
              </NavLink>
            </li>
            <li className={`mb-2 p-2 ${styles.delete}`}>
              <NavLink
                to="/home/trabajadores"
                className="d-flex align-items-center text-white text-decoration-none w-100">

                <i class="bi bi-person-circle me-2"></i>
                Trabajadores
              </NavLink>
            </li>
          </ul>
        </div>
        </div>
      </aside>
    </>
  );
}

export default Aside;


