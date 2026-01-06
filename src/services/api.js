// src/services/api.js

const API_URL = "https://u2.rsgve.com/api";

const getHeaders = (isMultipart = false) => {
  const headers = {
    "Accept": "application/json",
  };

  // IMPORTANTE: Si es subida de archivos (multipart), NO ponemos Content-Type.
  // El navegador lo pondrá automáticamente con el "boundary" correcto.
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  // Detectamos si el cuerpo es FormData (para subida de archivos)
  const isFormData = options.body instanceof FormData;

  const config = {
    ...options,
    headers: {
        ...getHeaders(isFormData),
        ...options.headers, 
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Lanzamos un error que contiene la respuesta del servidor para poder leerla en el catch
      const error = new Error(errorData.message || `Error ${response.status}`);
      error.data = errorData; 
      throw error;
    }

    // Si es 204 (No Content) retornamos null, si no, parseamos JSON
    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    console.error(`Error en petición a ${endpoint}:`, error);
    throw error;
  }
}

// --- Endpoints ---

export async function getProducts() {
  return request('/products');
}

export async function createProduct(data) {
  // Verificamos si data ya es FormData
  const isFormData = data instanceof FormData;

  return request('/products', {
    method: "POST",
    // Si es FormData se envía directo, si es objeto normal se hace JSON stringify
    body: isFormData ? data : JSON.stringify(data),
  });
}

// Actualizar producto
export async function updateProduct(id, data) {
  return request(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Eliminar producto
export async function deleteProduct(id) {
  return request(`/products/${id}`, {
    method: "DELETE",
  });
}

// ==========================================
// MÓDULO DE VENTAS
// ==========================================

// Registrar una venta (Actualizar stock/vender)
// Endpoint: PUT /sale (según tus indicaciones)
export async function registerSale(data) {
  return request('/sale', {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Obtener historial de ventas
export async function getSalesHistory() {
  return request('/sales-history');
}

// ==========================================
// MÓDULO DE USUARIOS / TRABAJADORES
// ==========================================

// Obtener lista de trabajadores
export async function getUsers() {
  return request('/users');
}

// Crear un nuevo trabajador
export async function createUser(data) {
  return request('/users', {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Eliminar un trabajador
export async function deleteUser(id) {
  return request(`/users/${id}`, {
    method: "DELETE",
  });
}

// ==========================================
// AUTENTICACIÓN (Opcional, si lo necesitas)
// ==========================================

export async function login(credentials) {
  // Asumiendo que usas la ruta estándar de Sanctum o una custom
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  
  if (!response.ok) throw new Error("Error de autenticación");
  return response.json();
}

export async function logout() {
    return request('/logout', { method: "POST" });
}