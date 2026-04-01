 const taskForm = document.getElementById('taskForm');
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const emptyStateMessage = document.getElementById('emptyStateMessage');
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const editModal = document.getElementById('editModal');
        const editForm = document.getElementById('editForm');
        const closeModal = document.getElementById('closeModal');
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        const authModal = document.getElementById('authModal');
        const authModalTitle = document.getElementById('authModalTitle');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const authButtons = document.getElementById('authButtons');
        const userProfile = document.getElementById('userProfile');
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userAvatar = document.getElementById('userAvatar');
        const welcomeMessage = document.getElementById('welcomeMessage');
        const welcomeUserName = document.getElementById('welcomeUserName');
        const taskInputSection = document.getElementById('taskInputSection');


        let tasks = JSON.parse(localStorage.getItem('studyPlannerTasks')) || [];
        let currentFilter = 'all';
        let editingTaskId = null;
        let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

        document.addEventListener('DOMContentLoaded', () => {
            checkAuthStatus();
            renderTasks();
            updateStats();
            setupEventListeners();
        });

   
        function checkAuthStatus() {
            if (currentUser) {
                showUserProfile();
                loadUserTasks();
            } else {
                showAuthButtons();
                disableTaskInput();
            }
        }

        function showUserProfile() {
            authButtons.style.display = 'none';
            userProfile.classList.add('active');
            userName.textContent = currentUser.name;
            userEmail.textContent = currentUser.email;
            userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
            welcomeMessage.style.display = 'block';
            welcomeUserName.textContent = currentUser.name.split(' ')[0];
            enableTaskInput();
        }

        function showAuthButtons() {
            authButtons.style.display = 'flex';
            userProfile.classList.remove('active');
            welcomeMessage.style.display = 'none';
            disableTaskInput();
        }

        function enableTaskInput() {
            taskInputSection.style.opacity = '1';
            taskInputSection.style.pointerEvents = 'auto';
        }

      
        function disableTaskInput() {
            taskInputSection.style.opacity = '0.5';
            taskInputSection.style.pointerEvents = 'none';
            emptyStateMessage.textContent = 'Please login to add and manage tasks';
        }

        function loadUserTasks() {
            const userTasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.email}`)) || [];
            tasks = userTasks;
            renderTasks();
            updateStats();
        }

 
        function setupEventListeners() {
           
            taskForm.addEventListener('submit', addTask);
            editForm.addEventListener('submit', saveEditedTask);

           
            loginForm.addEventListener('submit', handleLogin);
            registerForm.addEventListener('submit', handleRegister);

            
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentFilter = btn.dataset.filter;
                    renderTasks();
                });
            });

           
            searchInput.addEventListener('input', renderTasks);
            sortSelect.addEventListener('change', renderTasks);

         
            closeModal.addEventListener('click', () => {
                editModal.classList.remove('active');
            });

           
            editModal.addEventListener('click', (e) => {
                if (e.target === editModal) {
                    editModal.classList.remove('active');
                }
            });

            authModal.addEventListener('click', (e) => {
                if (e.target === authModal) {
                    closeAuthModal();
                }
            });
        }

        function openLoginModal() {
            authModalTitle.textContent = 'Login';
            switchAuthTab('login');
            authModal.classList.add('active');
        }

        function openRegisterModal() {
            authModalTitle.textContent = 'Register';
            switchAuthTab('register');
            authModal.classList.add('active');
        }

        function closeAuthModal() {
            authModal.classList.remove('active');
            loginForm.reset();
            registerForm.reset();
        }

        function switchAuthTab(tab) {
            const tabs = document.querySelectorAll('.auth-tab');
            const forms = document.querySelectorAll('.auth-form');
            
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            
            if (tab === 'login') {
                tabs[0].classList.add('active');
                loginForm.classList.add('active');
                authModalTitle.textContent = 'Login';
            } else {
                tabs[1].classList.add('active');
                registerForm.classList.add('active');
                authModalTitle.textContent = 'Register';
            }
        }

        function handleLogin(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
          
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                closeAuthModal();
                showUserProfile();
                loadUserTasks();
                showToast(`Welcome back, ${user.name}!`, 'success');
            } else {
                showToast('Invalid email or password', 'error');
            }
        }

        function handleRegister(e) {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
           
            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }
            
       
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            
            if (users.find(u => u.email === email)) {
                showToast('User with this email already exists', 'error');
                return;
            }
            
          
            const newUser = {
                id: Date.now(),
                name: name,
                email: email,
                password: password,
                createdAt: new Date().toISOString()
            };
            
         
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            
            currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
           
            localStorage.setItem(`tasks_${newUser.email}`, JSON.stringify([]));
            
            closeAuthModal();
            showUserProfile();
            loadUserTasks();
            showToast(`Welcome to Smart Study Planner, ${name}!`, 'success');
        }

        function logout() {
            if (confirm('Are you sure you want to logout?')) {
                currentUser = null;
                localStorage.removeItem('currentUser');
                showAuthButtons();
                tasks = [];
                renderTasks();
                updateStats();
                showToast('Logged out successfully', 'info');
            }
        }

        function togglePassword(inputId) {
            const input = document.getElementById(inputId);
            const icon = input.nextElementSibling.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }

      
        function addTask(e) {
            e.preventDefault();

            const taskName = document.getElementById('taskName').value;
            const taskDescription = document.getElementById('taskDescription').value;
            const taskSubject = document.getElementById('taskSubject').value;
            const taskDueDate = document.getElementById('taskDueDate').value;
            const priority = document.querySelector('input[name="priority"]:checked').value;

            const newTask = {
                id: Date.now(),
                name: taskName,
                description: taskDescription,
                subject: taskSubject,
                dueDate: taskDueDate,
                priority: priority,
                completed: false,
                createdAt: new Date().toISOString()
            };

            tasks.push(newTask);
            saveTasks();
            renderTasks();
            updateStats();
            taskForm.reset();
            showToast('Task added successfully!', 'success');
        }

       
        function renderTasks() {
        
            let filteredTasks = filterTasks(tasks, currentFilter);

            
            const searchTerm = searchInput.value.toLowerCase();
            if (searchTerm) {
                filteredTasks = filteredTasks.filter(task => 
                    task.name.toLowerCase().includes(searchTerm) ||
                    task.description.toLowerCase().includes(searchTerm) ||
                    task.subject.toLowerCase().includes(searchTerm)
                );
            }

            
            const sortBy = sortSelect.value;
            filteredTasks = sortTasks(filteredTasks, sortBy);

         
            taskList.innerHTML = '';

            if (filteredTasks.length === 0) {
                emptyState.style.display = 'block';
                return;
            } else {
                emptyState.style.display = 'none';
            }

        
            filteredTasks.forEach(task => {
                const taskItem = createTaskElement(task);
                taskList.appendChild(taskItem);
            });
        }

        function createTaskElement(task) {
            const li = document.createElement('li');
            li.className = `task-item priority-${task.priority.toLowerCase()}`;
            if (task.completed) li.classList.add('completed');

   
            let dueDateDisplay = '';
            if (task.dueDate) {
                const dueDate = new Date(task.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                if (dueDate.getTime() === today.getTime()) {
                    dueDateDisplay = 'Today';
                } else if (dueDate.getTime() === tomorrow.getTime()) {
                    dueDateDisplay = 'Tomorrow';
                } else {
                    dueDateDisplay = dueDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                    });
                }
            }

      
            let priorityIcon = '';
            if (task.priority === 'High') {
                priorityIcon = '<i class="fas fa-exclamation-circle" style="color: var(--danger-color);"></i>';
            } else if (task.priority === 'Medium') {
                priorityIcon = '<i class="fas fa-exclamation-triangle" style="color: var(--warning-color);"></i>';
            } else {
                priorityIcon = '<i class="fas fa-info-circle" style="color: var(--success-color);"></i>';
            }

            li.innerHTML = `
                <div class="task-header">
                    <div>
                        <div class="task-name">${task.name}</div>
                        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                    </div>
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                           onchange="toggleTask(${task.id})">
                </div>
                <div class="task-details">
                    <div class="task-detail">
                        <i class="fas fa-book"></i> ${task.subject}
                    </div>
                    ${dueDateDisplay ? `
                    <div class="task-detail">
                        <i class="fas fa-calendar"></i> ${dueDateDisplay}
                    </div>` : ''}
                    <div class="task-detail">
                        ${priorityIcon} ${task.priority} Priority
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-btn edit-btn" onclick="openEditModal(${task.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="task-btn delete-btn" onclick="deleteTask(${task.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;

            return li;
        }

        function toggleTask(id) {
            const taskIndex = tasks.findIndex(task => task.id === id);
            if (taskIndex !== -1) {
                tasks[taskIndex].completed = !tasks[taskIndex].completed;
                saveTasks();
                renderTasks();
                updateStats();
                
                if (tasks[taskIndex].completed) {
                    showToast('Task marked as completed!', 'success');
                } else {
                    showToast('Task marked as pending!', 'info');
                }
            }
        }

        function deleteTask(id) {
            if (confirm('Are you sure you want to delete this task?')) {
                tasks = tasks.filter(task => task.id !== id);
                saveTasks();
                renderTasks();
                updateStats();
                showToast('Task deleted successfully!', 'success');
            }
        }

        function openEditModal(id) {
            const task = tasks.find(task => task.id === id);
            if (!task) return;

            editingTaskId = id;
            
            document.getElementById('editTaskName').value = task.name;
            document.getElementById('editTaskDescription').value = task.description;
            document.getElementById('editTaskSubject').value = task.subject;
            document.getElementById('editTaskDueDate').value = task.dueDate;

            document.querySelector(`input[name="editPriority"][value="${task.priority}"]`).checked = true;
            
            editModal.classList.add('active');
        }

        function saveEditedTask(e) {
            e.preventDefault();
            
            const taskIndex = tasks.findIndex(task => task.id === editingTaskId);
            if (taskIndex === -1) return;
            
            tasks[taskIndex].name = document.getElementById('editTaskName').value;
            tasks[taskIndex].description = document.getElementById('editTaskDescription').value;
            tasks[taskIndex].subject = document.getElementById('editTaskSubject').value;
            tasks[taskIndex].dueDate = document.getElementById('editTaskDueDate').value;
            tasks[taskIndex].priority = document.querySelector('input[name="editPriority"]:checked').value;
            
            saveTasks();
            renderTasks();
            updateStats();
            editModal.classList.remove('active');
            showToast('Task updated successfully!', 'success');
        }

  
        function filterTasks(tasks, filter) {
            switch (filter) {
                case 'completed':
                    return tasks.filter(task => task.completed);
                case 'pending':
                    return tasks.filter(task => !task.completed);
                case 'high':
                    return tasks.filter(task => task.priority === 'High');
                case 'today':
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return tasks.filter(task => {
                        if (!task.dueDate) return false;
                        const dueDate = new Date(task.dueDate);
                        return dueDate.getTime() === today.getTime();
                    });
                default:
                    return tasks;
            }
        }

   
        function sortTasks(tasks, sortBy) {
            const sortedTasks = [...tasks];
            
            switch (sortBy) {
                case 'oldest':
                    return sortedTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                case 'priority':
                    const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
                    return sortedTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
                case 'dueDate':
                    return sortedTasks.sort((a, b) => {
                        if (!a.dueDate) return 1;
                        if (!b.dueDate) return -1;
                        return new Date(a.dueDate) - new Date(b.dueDate);
                    });
                case 'newest':
                default:
                    return sortedTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            }
        }

        function updateStats() {
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.completed).length;
            const pendingTasks = totalTasks - completedTasks;
            const highPriorityTasks = tasks.filter(task => task.priority === 'High' && !task.completed).length;
            
            document.getElementById('totalTasks').textContent = totalTasks;
            document.getElementById('completedTasks').textContent = completedTasks;
            document.getElementById('pendingTasks').textContent = pendingTasks;
            document.getElementById('highPriorityTasks').textContent = highPriorityTasks;
        }


        function saveTasks() {
            if (currentUser) {
                localStorage.setItem(`tasks_${currentUser.email}`, JSON.stringify(tasks));
            }
        }

        function showToast(message, type = 'success') {
            toastMessage.textContent = message;
    
            toast.classList.remove('success', 'error', 'info');
       
            toast.classList.add(type);
            
            const icon = toast.querySelector('i');
            icon.className = type === 'success' ? 'fas fa-check-circle' : 
                           type === 'error' ? 'fas fa-exclamation-circle' : 
                           'fas fa-info-circle';
            
           
            toast.classList.add('show');
            
       
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }