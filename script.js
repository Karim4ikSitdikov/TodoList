const quotes = [
    {
        text: "Не откладывай на завтра то, что можно сделать сегодня.",
        author: "Народная мудрость"
    },
    {
        text: "Путь в тысячу миль начинается с первого шага.",
        author: "Лао-Цзы"
    },
    {
        text: "Успех — это сумма небольших усилий, повторяемых изо дня в день.",
        author: "Роберт Колльер"
    },
    {
        text: "Единственный способ сделать что-то очень хорошо — любить то, что ты делаешь.",
        author: "Стив Джобс"
    },
    {
        text: "Сначала делай то, что необходимо, затем — что возможно, и вскоре ты обнаружишь, что делаешь невозможное.",
        author: "Франциск Ассизский"
    },
    {
        text: "Мотивация — это то, с чего ты начинаешь. Привычка — это то, что заставляет тебя продолжать.",
        author: "Джим Рон"
    },
    {
        text: "Лучший способ предсказать будущее — создать его.",
        author: "Авраам Линкольн"
    }
];

const dailyQuote = document.getElementById('dailyQuote');
const quoteAuthor = document.getElementById('quoteAuthor');
const refreshQuoteBtn = document.getElementById('refreshQuote');

function getDailyQuote() {
    const today = new Date().toDateString();
    const savedQuote = localStorage.getItem('dailyQuote');
    const savedDate = localStorage.getItem('quoteDate');
    
    if (savedQuote && savedDate === today) {
        return JSON.parse(savedQuote);
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const selectedQuote = quotes[randomIndex];
    
    localStorage.setItem('dailyQuote', JSON.stringify(selectedQuote));
    localStorage.setItem('quoteDate', today);
    
    return selectedQuote;
}

function displayQuote() {
    const quote = getDailyQuote();
    dailyQuote.textContent = `"${quote.text}"`;
    quoteAuthor.textContent = `— ${quote.author}`;
}

refreshQuoteBtn.addEventListener('click', function() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const selectedQuote = quotes[randomIndex];
    
    dailyQuote.textContent = `"${selectedQuote.text}"`;
    quoteAuthor.textContent = `— ${selectedQuote.author}`;
});

displayQuote();

document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filters = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const tasksLeftSpan = document.getElementById('tasksLeft');
    const dateElement = document.getElementById('date');
    updateDate();
    
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    renderTasks();

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    filters.forEach(btn => {
        btn.addEventListener('click', function() {
            filters.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderTasks();
        });
    });
    
    clearCompletedBtn.addEventListener('click', clearCompleted);
    
    function updateDate() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date();
        dateElement.textContent = today.toLocaleDateString('ru-RU', options);
    }
    
    function addTask() {
        const text = taskInput.value.trim();
        if (text) {
            const newTask = {
                id: Date.now(),
                text,
                completed: false,
                createdAt: new Date().toISOString(),
                completedAt: null
            };
            tasks.push(newTask);
            saveTasks();
            renderTasks();
            taskInput.value = '';
        }
    }
    
    function renderTasks() {
        const filter = document.querySelector('.filter-btn.active').dataset.filter;
        
        let filteredTasks = tasks;
        if (filter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (filter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        taskList.innerHTML = '';
        const completedList = document.getElementById('completedList');
        completedList.innerHTML = '';
        
        const sortedTasks = [...tasks].sort((a, b) => {
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        sortedTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.dataset.id = task.id;
            
            const taskDate = new Date(task.createdAt);
            const timeString = taskDate.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            });
            const dateString = taskDate.toLocaleDateString('ru-RU');
            
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                <span class="task-time">
                    ${dateString} ${timeString}
                    ${task.completed ? `<br><span class="completed-time">Завершено: ${new Date(task.completedAt).toLocaleDateString('ru-RU')} ${new Date(task.completedAt).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}</span>` : ''}
                </span>
                <div class="task-actions">
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            if (task.completed) {
                completedList.appendChild(taskItem);
            } else {
                taskList.appendChild(taskItem);
            }
            
            const checkbox = taskItem.querySelector('.task-checkbox');
            const editBtn = taskItem.querySelector('.edit-btn');
            const deleteBtn = taskItem.querySelector('.delete-btn');
            const taskText = taskItem.querySelector('.task-text');
            
            checkbox.addEventListener('change', function() {
                task.completed = this.checked;
                task.completedAt = this.checked ? new Date().toISOString() : null; // Записываем время завершения
                saveTasks();
                renderTasks();
            });
            
            deleteBtn.addEventListener('click', function() {
                tasks = tasks.filter(t => t.id !== task.id);
                saveTasks();
                renderTasks();
            });
            
            editBtn.addEventListener('click', function() {
                const newText = prompt('Редактировать задачу:', task.text);
                if (newText !== null && newText.trim() !== '') {
                    task.text = newText.trim();
                    saveTasks();
                    renderTasks();
                }
            });
        });
        
        document.querySelector('.completed-section').style.display = 
            tasks.some(task => task.completed) ? 'block' : 'none';
        
        updateStats();
    }
    
    function clearCompleted() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    }
    
    function updateStats() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        tasksLeftSpan.textContent = `${activeTasks} ${pluralize(activeTasks, ['задача', 'задачи', 'задач'])} осталось`;
    }
    
    function pluralize(number, words) {
        const cases = [2, 0, 1, 1, 1, 2];
        return words[
            number % 100 > 4 && number % 100 < 20 
                ? 2 
                : cases[Math.min(number % 10, 5)]
        ];
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});