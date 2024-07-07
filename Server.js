const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');

const app = new Koa();
const PORT = 7070;

let tasks = [];
let currentId = 1;

app.use(cors());
app.use(bodyParser());

app.use((ctx, next) => {
    ctx.response.set('Access-Control-Allow-Origin', '*');
    ctx.response.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    ctx.response.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    return next();
});

// Создание новой задачи
app.use((ctx, next) => {
    if (ctx.method === 'POST' && ctx.url === '/tasks') {
        const { name, description } = ctx.request.body;
        const newTask = {
            id: currentId++,
            name,
            description,
            status: false,
            created: Date.now()
        };
        tasks.push(newTask);
        ctx.response.status = 201;
        ctx.body = newTask;
        console.log('Новая зада ча:', newTask);
    } else {
        return next();
    }
});

// Список задач
app.use((ctx, next) => {
    if (ctx.method === 'GET' && ctx.url === '/tasks') {
        ctx.response.status = 200;
        ctx.body = tasks;
    } else {
        return next();
    }
});

// Получение задачи по id
app.use((ctx, next) => {
    const match = ctx.url.match(/^\/tasks\/(\d+)$/);
    if (ctx.method === 'GET' && match) {
        const id = Number(match[1]);
        const task = tasks.find(task => task.id === id);
        if (task) {
            ctx.response.status = 200;
            ctx.body = task;
        } else {
            ctx.response.status = 404;
            ctx.body = { error: 'Task not found' };
        }
    } else {
        return next();
    }
});

// Обновление задачи
app.use((ctx, next) => {
    const match = ctx.url.match(/^\/tasks\/(\d+)$/);
    if (ctx.method === 'PUT' && match) {
        const id = Number(match[1]);
        const { name, description, status } = ctx.request.body;
        const task = tasks.find(task => task.id === id);
        if (task) {
            task.name = name || task.name;
            task.description = description || task.description;
            task.status = typeof status === 'boolean' ? status : task.status;
            ctx.response.status = 200;
            ctx.body = task;
        } else {
            ctx.response.status = 404;
            ctx.body = { error: 'Task not found' };
        }
    } else {
        return next();
    }
});

// Удаление задачи
app.use((ctx, next) => {
    const match = ctx.url.match(/^\/tasks\/(\d+)$/);
    if (ctx.method === 'DELETE' && match) {
        const id = Number(match[1]);
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            tasks.splice(taskIndex, 1);
            ctx.response.status = 204;
        } else {
            ctx.response.status = 404;
            ctx.body = { error: 'Task not found' };
        }
    } else {
        return next();
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
