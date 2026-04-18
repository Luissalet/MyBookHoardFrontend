document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const loginContainer = document.getElementById("login-container");
  const appContainer = document.getElementById("app");
  const logoutBtn = document.getElementById("logout-btn");

  // Check if user is already logged in
  if (localStorage.getItem("jwt")) {
    showApp();
    loadBooks();
  }

  // Login form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const identifier = document.getElementById("identifier").value.trim();
    const password = document.getElementById("password").value;

    if (!identifier || !password) {
      loginError.textContent = "Please enter both username/email and password";
      return;
    }

    try {
      const result = await login(identifier, password);

      if (result.success && result.data && result.data.token) {
        loginError.textContent = "";
        showApp();
        loadBooks();
      } else {
        const errorMsg = result.error || result.message || "Invalid credentials";
        loginError.textContent = errorMsg;
        console.error("Login failed:", result);
      }
    } catch (err) {
      console.error("Login error:", err);
      loginError.textContent = `Connection error: ${err.message}`;
    }
  });

  // Logout button
  logoutBtn.addEventListener("click", async () => {
    try {
      await logout();
      hideApp();
    } catch (err) {
      console.error("Logout error:", err);
      // Still logout locally even if server call fails
      hideApp();
    }
  });

  function showApp() {
    loginContainer.style.display = "none";
    appContainer.style.display = "block";
  }

  function hideApp() {
    loginContainer.style.display = "block";
    appContainer.style.display = "none";
    document.getElementById("identifier").value = "";
    document.getElementById("password").value = "";
  }
});

/**
 * Load and display all books
 */
async function loadBooks() {
  const container = document.getElementById("book-list");
  container.innerHTML = '<div class="loading">Loading books...</div>';

  try {
    const books = await getBooks();

    if (!books || books.length === 0) {
      container.innerHTML = '<div class="empty-message">No books found in the database.</div>';
      return;
    }

    container.innerHTML = "";
    
    books.forEach(book => {
      const bookItem = createBookItem(book);
      container.appendChild(bookItem);
    });

  } catch (err) {
    console.error("Error loading books:", err);
    
    // Show detailed error in UI
    container.innerHTML = `
      <div class="empty-message" style="color: #e74c3c;">
        <strong>❌ Error loading books</strong><br><br>
        ${err.message}<br><br>
        <small>Check the API Debug Console below for more details</small>
      </div>
    `;
  }
}

/**
 * Create a book item element
 */
function createBookItem(book) {
  const bookItem = document.createElement("div");
  bookItem.className = "book-item";

  // Book info
  const bookInfo = document.createElement("div");
  bookInfo.className = "book-info";
  bookInfo.onclick = () => {
    // Future: Show book details
    console.log("Book clicked:", book);
  };

  const title = document.createElement("div");
  title.className = "book-title";
  title.textContent = book.title || `Book #${book.id}`;

  const details = document.createElement("div");
  details.className = "book-details";
  const detailsParts = [];
  
  if (book.author) detailsParts.push(`Author: ${book.author}`);
  if (book.publication_year) detailsParts.push(`Year: ${book.publication_year}`);
  if (book.language) detailsParts.push(`Language: ${book.language.toUpperCase()}`);
  
  details.textContent = detailsParts.join(" • ") || "No additional details";

  bookInfo.appendChild(title);
  bookInfo.appendChild(details);

  // Actions
  const actions = document.createElement("div");
  actions.className = "book-actions";

  const editBtn = createButton("Edit", "edit-btn", () => editBook(book));
  const deleteBtn = createButton("Delete", "delete-btn", async () => {
    if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
      const success = await deleteBook(book.id);
      if (success) {
        bookItem.remove();
        // Check if list is empty
        const container = document.getElementById("book-list");
        if (container.children.length === 0) {
          container.innerHTML = '<div class="empty-message">No books found in the database.</div>';
        }
      } else {
        alert("Failed to delete book");
      }
    }
  });

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  bookItem.appendChild(bookInfo);
  bookItem.appendChild(actions);

  return bookItem;
}

/**
 * Edit book (placeholder for future implementation)
 */
function editBook(book) {
  // TODO: Implement edit modal or redirect to edit page
  console.log("Edit book:", book);
  alert(`Edit functionality coming soon!\n\nBook: ${book.title}\nID: ${book.id}`);
  
  // Future implementation could include:
  // - Show modal with form
  // - Update book via API
  // - Refresh list
}