// No library, just vanilla JS
// 3 views, login, register, and index for the todo
// Must store the authToken as a cookie 


// self note: Token is created/deleted upon login/logout. 
// Todo don't create/delete tokens, just use them to authenticate user, and send requests to the backend with the token in the header



const API_URL = 'http://localhost:3000';    // the API URL for the backend server


let token = document.cookie                 //  Retrieves token from cookies when the page loads
  .split('; ')
  .find(row => row.startsWith('token='))
  ?.split('=')[1];


// ========================================= Registration ========================================

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {                   // takes in event as 'e' for next step
    e.preventDefault();                                                   // prevents the default form submission behavior (refresh the page)
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch(`${API_URL}/register`, {                  // wait for fetch (function to make HTTP requests)
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),                       // converts the data to JSON string
    });

    const data = await response.json();                                   // parses the JSON response to js object
    if (response.ok) {                                                    // .ok is a method to check if the response status is in the range 200-299, exclusive built-in property of the Response object in the Fetch API.
      alert('Registration successful! Please log in.');                   // alert user that registration was successful
      window.location.href = '/login.html';                               // redirect to login page if registration successful
    } else {
      alert(data.error);                                                  // alert user of error
    }
  });
}


// ============================================ Login ===========================================

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {                   // takes in event as 'e' for next step
    e.preventDefault();                                                 // prevents the default form submission behavior (refresh the page)
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch(`${API_URL}/login`, {                  // wait for fetch (function to make HTTP requests)
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),                     // converts the data to JSON string
    });

    const data = await response.json();                                 // parses the JSON response to js object
    if (response.ok) {                                                  // .ok is a method to check if the response status is in the range 200-299, exclusive built-in property of the Response object in the Fetch API.
        // Store token as a cookie when successfully logged in
        document.cookie = `token=${data.token}; path=/; max-age=86400`; // Expires in 1 day (86400 seconds)
        window.location.href = '/index.html';                           // redirect to index.html if login successful
      } else {
        alert(data.error);
      }
   });
}


// ==================================================== Logout ===================================================

const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },                    // sending the already authenticated token to the backend to log out the user
    });

    if (response.ok) {
      // Successfully logged out, clear the token cookie
      document.cookie = "token=; path=/; max-age=0";                    // clear the token cookie
      window.location.href = '/login.html';                             // redirect to the login page
    } else {
      const data = await response.json();
      alert(data.error);
    }
  });
}



// =================================================== TODO stuff ===================================================


// Add Todo
const addTodoForm = document.getElementById('addTodoForm');
if (addTodoForm) {
  addTodoForm.addEventListener('submit', async (e) => {
    e.preventDefault();                                                 // prevents the default form submission behavior (refresh the page) 
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;

    const response = await fetch(`${API_URL}/todos`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description }),
    });

    if (response.ok) {
      loadTodos();
    }
  });
}

// Load Todos
const loadTodos = async () => {
  const response = await fetch(`${API_URL}/todos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const todos = await response.json();
  const todoList = document.getElementById('todoList');
  todoList.innerHTML = todos.map(todo => `
    <li>
      <span>${todo.title} --- ${todo.description}</span>
      <button onclick="deleteTodo('${todo.id}')">Delete</button>
      <button onclick="editTodos('${todo.id}')">Edit</button>
    </li>
  `).join('');
};
// Self note: loadTodos is an async function that fetches the list of todos from the backend
// by sending a GET request to the /todos endpoint with the Authorization header containing the token.
// after finish waiting for the response, it's then parsed as JSON and used to update the innerHTML of the todoList element


// Delete Todo
window.deleteTodo = async (id) => {             
  console.log('Deleting todo with ID:', id);    // for debugging
  await fetch(`${API_URL}/todos/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  loadTodos();
};


  
// Check if user is logged in, if not, kick them to login page
if (window.location.pathname === '/index.html' && !token) {
  window.location.href = '/login.html';
} else if (token) {
  loadTodos();
}



// =================================================== Edit todo ====================================================

window.editTodos = async (id) => {
  // Prompt the user for new title and description
  const newTitle = prompt('Enter the new task:');
  const newDescription = prompt('Enter the new description:');

  // Check if the user entered values (not canceled)
  if (newTitle !== null && newDescription !== null) {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT', // or 'PATCH' depending on backend
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      // Reload the todos after successful update
      loadTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  }
};


// self note:
// adding 'window.' before an object make it global to the window object 
// (doesn't make it global in the whole code)
// meaning: it can be accessed from anywhere in the code, including from the HTML file
// as long as we access it through the window object

// example:
// function abc() {
//     let localVar = 'I am local';  // local to abc function
    
//     window.globalVar = 'I am global';  // attaching to the global window object
//   }
  
//   abc();
  
//   console.log(window.globalVar);  // 'I am global' - works because we explicitly attached it to window
  
//   console.log(localVar);  // Error: localVar is not defined because it's local to abc