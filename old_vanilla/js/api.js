const API_URL = "https://api.mybookhoard.com/api";

/**
 * Get authorization headers with JWT token
 */
function getAuthHeaders() {
  const token = localStorage.getItem("jwt");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

/**
 * Display API response in a debug box
 */
function showApiResponse(response, label = "API Response") {
  let box = document.getElementById("api-response");
  if (!box) {
    box = document.createElement("pre");
    box.id = "api-response";
    document.body.appendChild(box);
  }
  const timestamp = new Date().toLocaleTimeString();
  box.textContent = `[${timestamp}] ${label}:\n${JSON.stringify(response, null, 2)}`;
  box.scrollTop = box.scrollHeight; // Auto-scroll to bottom
}

/**
 * Login user with identifier (username or email) and password
 * @param {string} identifier - Username or email
 * @param {string} password - User password
 * @returns {Promise<Object>} Login response
 */
async function login(identifier, password) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password })
    });

    const json = await res.json();
    showApiResponse({
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      response: json
    }, "POST /auth/login");

    if (json.success && json.data && json.data.token) {
      localStorage.setItem("jwt", json.data.token);
    }

    return json;
  } catch (error) {
    showApiResponse({
      error: error.message,
      stack: error.stack
    }, "POST /auth/login ERROR");
    throw error;
  }
}

/**
 * Logout current user
 */
async function logout() {
  try {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { ...getAuthHeaders() }
    });
    
    const json = await res.json();
    localStorage.removeItem("jwt");
    showApiResponse({
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      response: json
    }, "POST /auth/logout");
    
    return json;
  } catch (error) {
    localStorage.removeItem("jwt");
    showApiResponse({
      error: error.message,
      stack: error.stack
    }, "POST /auth/logout ERROR");
    throw error;
  }
}

/**
 * Get all books for authenticated user
 * @returns {Promise<Array>} Array of books
 */
async function getBooks() {
  try {
    const res = await fetch(`${API_URL}/books`, {
      headers: { ...getAuthHeaders() }
    });
    
    const json = await res.json();
    showApiResponse({
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      response: json
    }, "GET /books");
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${json.error || json.message || res.statusText}`);
    }
    
    return json.success && json.data ? json.data.books : [];
  } catch (error) {
    showApiResponse({
      error: error.message,
      stack: error.stack
    }, "GET /books ERROR");
    throw error;
  }
}

/**
 * Delete a book by ID
 * @param {number} id - Book ID to delete
 * @returns {Promise<boolean>} True if successful
 */
async function deleteBook(id) {
  try {
    const res = await fetch(`${API_URL}/books/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() }
    });
    
    const json = await res.json().catch(() => ({ success: res.ok }));
    showApiResponse({
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      response: json
    }, `DELETE /books/${id}`);
    
    return json.success || res.ok;
  } catch (error) {
    showApiResponse({
      error: error.message,
      stack: error.stack
    }, `DELETE /books/${id} ERROR`);
    throw error;
  }
}

/**
 * Update a book by ID
 * @param {number} id - Book ID to update
 * @param {Object} data - Book data to update
 * @returns {Promise<Object>} Update response
 */
async function updateBook(id, data) {
  const res = await fetch(`${API_URL}/books/${id}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      ...getAuthHeaders() 
    },
    body: JSON.stringify(data)
  });
  
  const json = await res.json();
  showApiResponse(json);
  
  return json;
}