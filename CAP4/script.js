document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const tasksList = document.getElementById('tasks-list');
    const toggleThemeBtn = document.getElementById('toggle-theme-btn');
    const filters = document.querySelectorAll('[id^="filter-"]');
    const priorityInput = document.getElementById('priority-input'); // Obtener el elemento de entrada de prioridad

    loadTasks();

    document.getElementById('add-task-btn').addEventListener('click', () => handleTaskAddition());
    taskInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleTaskAddition());

    filters.forEach(filter => filter.addEventListener('click', () => filterTasks(filter.id.replace('filter-', ''))));
    toggleThemeBtn.addEventListener('click', toggleTheme);

    function handleTaskAddition() {
        const taskText = taskInput.value.trim();
        const dueDate = document.getElementById('due-date-input').value;
        const priority = priorityInput.value; // Obtener la prioridad seleccionada
        if (!taskText) return;
        addTask(taskText, dueDate, priority); // Incluir prioridad al añadir tarea
        taskInput.value = '';
        document.getElementById('due-date-input').value = '';
        priorityInput.value = '1'; // Restablecer la prioridad a su valor predeterminado
    }

    function addTask(taskText, dueDate, priority) {
        const taskElement = createTaskElement(taskText, false, dueDate, priority);
        tasksList.appendChild(taskElement);
        saveTask(taskText, false, dueDate, priority);
    }

    function createTaskElement(taskText, completed = false, dueDate = '', priority = '1') {
        const taskElement = document.createElement('li');
        taskElement.className = `task ${completed ? 'task-completed' : ''}`;
        taskElement.innerHTML = `
            <span>${taskText}</span>
            <div>Priority: ${priority}</div>
            <input type="date" class="due-date" value="${dueDate}">
            <button class="edit-btn">Editar</button>
            <button class="complete-btn">Completar</button>
            <button class="delete-btn">Eliminar</button>
        `;
        attachTaskEventListeners(taskElement);
        return taskElement;
    }

    function attachTaskEventListeners(taskElement) {
        taskElement.querySelector('.edit-btn').addEventListener('click', () => editTask(taskElement));
        taskElement.querySelector('.complete-btn').addEventListener('click', () => toggleTaskCompletion(taskElement));
        taskElement.querySelector('.delete-btn').addEventListener('click', () => deleteTask(taskElement));
        taskElement.querySelector('.due-date').addEventListener('change', () => updateTask(taskElement));
    }

    function editTask(taskElement) {
        const span = taskElement.querySelector('span');
        const isEditable = span.contentEditable === "true";
        span.contentEditable = !isEditable;
        taskElement.querySelector('.edit-btn').textContent = isEditable ? "Editar" : "Guardar";
        if (isEditable) updateTasks();
        else span.focus();
    }

    function toggleTaskCompletion(taskElement) {
        taskElement.classList.toggle('task-completed');
        updateTask(taskElement);
    }

    function deleteTask(taskElement) {
        tasksList.removeChild(taskElement);
        updateTasks();
    }

    function saveTask(taskText, completed, dueDate, priority) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push({ text: taskText, completed, dueDate, priority });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function updateTask(taskElement) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const taskText = taskElement.querySelector('span').textContent;
        const taskIndex = tasks.findIndex(task => task.text === taskText);
        if (taskIndex > -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                completed: taskElement.classList.contains('task-completed'),
                dueDate: taskElement.querySelector('.due-date').value,
                // Asumiendo que la prioridad puede cambiar, aquí deberías actualizarla también si es necesario
            };
        }
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function updateTasks() {
        const tasks = Array.from(tasksList.querySelectorAll('.task')).map(taskElement => ({
            text: taskElement.querySelector('span').textContent,
            completed: taskElement.classList.contains('task-completed'),
            dueDate: taskElement.querySelector('.due-date').value,
            // Aquí también deberías capturar y actualizar la prioridad si es necesario
        }));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => tasksList.appendChild(createTaskElement(task.text, task.completed, task.dueDate, task.priority)));
    }

    function filterTasks(filter) {
        Array.from(tasksList.children).forEach(task => {
            const isCompleted = task.classList.contains('task-completed');
            task.style.display = filter === 'all' || (filter === 'completed' && isCompleted) || (filter === 'pending' && !isCompleted) ? '' : 'none';
        });
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? '' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        toggleThemeBtn.textContent = newTheme === 'dark' ? 'Modo Claro' : 'Modo Oscuro';
    }
});