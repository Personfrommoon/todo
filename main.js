document.addEventListener('DOMContentLoaded', () => {
    const loginUsername = document.getElementById('login-username');
    const loginPassword = document.getElementById('login-password');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const taskManager = document.getElementById('task-manager');
    const addTaskBtn = document.getElementById('add-task');
    const taskList = document.getElementById('task-list');

    if (!loginUsername || !loginPassword || !loginBtn || !registerBtn || !taskManager || !addTaskBtn || !taskList) {
        console.error('Required elements are missing in the DOM.');
        return;
    }

    loginBtn.addEventListener('click', async () => {
        const username = loginUsername.value;
        const password = loginPassword.value;

        if (!username || !password) {
            alert('Please enter both username and password.');
            return;
        }

        try {
            await loginUser(username, password);
            taskManager.style.display = 'block';
            document.getElementById('auth-form').style.display = 'none';
            fetchTasks(); // Load tasks after login
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed.');
        }
    });

    registerBtn.addEventListener('click', async () => {
        const username = loginUsername.value;
        const password = loginPassword.value;

        if (!username || !password) {
            alert('Please enter both username and password.');
            return;
        }

        try {
            await registerUser(username, password);
            alert('Registration successful. You can now log in.');
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed.');
        }
    });

    addTaskBtn.addEventListener('click', async () => {
        const taskName = prompt('Enter task name:');
        if (!taskName) {
            alert('Task name cannot be empty.');
            return;
        }

        try {
            await addTask(taskName);
            fetchTasks(); // Refresh task list after adding a new task
        } catch (error) {
            console.error('Add task error:', error);
            alert('Failed to add task.');
        }
    });

    async function fetchJson(url, options) {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
    }

    async function registerUser(username, password) {
        const url = 'http://demo2.z-bit.ee/users';
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        };
        await fetchJson(url, options);
    }

    async function loginUser(username, password) {
        const url = 'http://demo2.z-bit.ee/users/get-token';
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        };
        const response = await fetchJson(url, options);
        localStorage.setItem('token', response.token); // Store token for authentication
    }

    async function fetchTasks() {
        const token = localStorage.getItem('token');
        const url = 'http://demo2.z-bit.ee/tasks';
        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        const tasks = await fetchJson(url, options);
        renderTasks(tasks);
    }

    async function addTask(name) {
        const token = localStorage.getItem('token');
        const url = 'http://demo2.z-bit.ee/tasks';
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        };
        await fetchJson(url, options);
    }

    function renderTasks(tasks) {
        taskList.innerHTML = ''; // Clear existing tasks
        tasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = 'ant-list-item';
            taskItem.innerHTML = `
                <div class="ant-row ant-row-space-between ant-row-middle" style="width: 100%;">
                    <div class="ant-space ant-space-horizontal ant-space-align-center" style="gap: 8px;">
                        <div class="ant-space-item">
                            <label class="ant-checkbox-wrapper">
                                <span class="ant-checkbox">
                                    <input name="completed" type="checkbox" class="ant-checkbox-input" ${task.completed ? 'checked' : ''}>
                                    <span class="ant-checkbox-inner"></span>
                                </span>
                            </label>
                        </div>
                        <div class="ant-space-item">
                            <input name="name" class="ant-input" type="text" value="${task.name}">
                        </div>
                    </div>
                    <button class="delete-task" type="button" class="ant-btn ant-btn-text">
                        <span role="img" aria-label="delete" class="anticon anticon-delete">
                            <svg viewBox="64 64 896 896" focusable="false" data-icon="delete" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                                <path d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"></path>
                            </svg>
                        </span>
                    </button>
                </div>
            `;
            taskList.appendChild(taskItem);
        });
    }
});
