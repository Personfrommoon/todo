const API_BASE_URL = 'https://demo2.z-bit.ee';
let tasks = [];
let user = null;

const taskList = document.querySelector('#task-list');
const addTaskButton = document.querySelector('#add-task');
const newTaskInput = document.querySelector('#new-task-input');
const loginForm = document.querySelector('#login-form');
const registerForm = document.querySelector('#register-form');
const logoutButton = document.querySelector('#logout-button');
const taskSection = document.querySelector('#task-section');
const authSection = document.querySelector('#auth-section');

function showAuthSection() {
    authSection.style.display = 'block';
    taskSection.style.display = 'none';
}

function showTaskSection() {
    authSection.style.display = 'none';
    taskSection.style.display = 'block';
}

async function fetchTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch tasks');
        tasks = await response.json();
        renderTasks();
    } catch (error) {
        console.error('Error fetching tasks:', error);
        alert('Error fetching tasks. Please try logging in again.');
    }
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(renderTask);
}

function renderTask(task) {
    const taskRow = createTaskRow(task);
    taskList.appendChild(taskRow);
}

function createTaskRow(task) {
    let taskRow = document.querySelector('[data-template="task-row"]').cloneNode(true);
    taskRow.removeAttribute('data-template');

    const name = taskRow.querySelector("[name='name']");
    name.value = task.title;
    name.addEventListener('keyup', throttle(updateTask.bind(null,task.id, { title: name.value }), 1000));

    const checkbox = taskRow.querySelector("[name='completed']");
    checkbox.checked = task.marked_as_done;
    checkbox.addEventListener('change', () => updateTask(task.id, { marked_as_done: checkbox.checked }));

    const deleteButton = taskRow.querySelector('.delete-task');
    deleteButton.addEventListener('click', () => deleteTask(task.id));

    hydrateAntCheckboxes(taskRow);

    return taskRow;
}

async function addTask() {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ title: newTaskInput.value })
        });
        if (!response.ok) throw new Error('Failed to add task');
        const newTask = await response.json();
        tasks.push(newTask);
        renderTask(newTask);
        newTaskInput.value = '';
    } catch (error) {
        console.error('Error adding task:', error);
        alert('Error adding task. Please try again.');
    }
}

async function updateTask(id, updates) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error('Failed to update task');
        const updatedTask = await response.json();
        tasks = tasks.map(task => task.id === id ? updatedTask : task);
        //renderTasks();P
    } catch (error) {
        console.error('Error updating task:', error);
        alert('Error updating task. Please try again.');
    }
}

function throttle(func, interval) {
    // A flag variable to track whether the function is running or not
    let isRunning = false;
    // Return a function that takes arguments
    return function(...args) {
        // If the function is not running
        if (!isRunning) {
            // Set the flag to true
            isRunning = true;
            // Apply the function with arguments
            func.apply(this, args);
            // Set a timer that will reset the flag after the interval
            setTimeout(() => {
                // Set the flag to false
                isRunning = false;
            }, interval);
        }
    };
}

async function deleteTask(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to delete task');
        tasks = tasks.filter(task => task.id !== id);
        renderTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task. Please try again.');
    }
}

async function login(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/get-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) throw new Error('Invalid credentials');
        user = await response.json();
        localStorage.setItem('token', user.access_token);
        showTaskSection();
        fetchTasks();
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please check your credentials and try again.');
    }
}

async function register(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, newPassword: password })
        });
        if (!response.ok) throw new Error('Registration failed');
        user = await response.json();
        localStorage.setItem('token', user.access_token);
        showTaskSection();
        fetchTasks();
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. The username might already be taken.');
    }
}

function logout() {
    localStorage.removeItem('token');
    user = null;
    tasks = [];
    showAuthSection();
}

addTaskButton.addEventListener('click', addTask);

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.querySelector('#login-username').value;
    const password = document.querySelector('#login-password').value;
    login(username, password);
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.querySelector('#register-username').value;
    const password = document.querySelector('#register-password').value;
    register(username, password);
});

logoutButton.addEventListener('click', logout);

if (localStorage.getItem('token')) {
    showTaskSection();
    fetchTasks();
} else {
    showAuthSection();
}

function hydrateAntCheckboxes(element) {
    const elements = element.querySelectorAll('.ant-checkbox-wrapper');
    for (let i = 0; i < elements.length; i++) {
        let wrapper = elements[i];
        if (wrapper.__hydrated)
            continue;
        wrapper.__hydrated = true;

        const checkbox = wrapper.querySelector('.ant-checkbox');
        const input = wrapper.querySelector('.ant-checkbox-input');
        if (input.checked) {
            checkbox.classList.add('ant-checkbox-checked');
        }

        input.addEventListener('change', () => {
            checkbox.classList.toggle('ant-checkbox-checked');
        });
    }
}