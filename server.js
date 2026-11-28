const express = require('express');
const { db, Project, Task } = require('./database/setup');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Test database connection
async function testConnection() {
    try {
        await db.authenticate();
        console.log('Connection to database established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnection();

// PROJECT ROUTES

// GET /api/projects - Get all projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.findAll();
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// GET /api/projects/:id - Get project by ID
app.get('/api/projects/:id', async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});


// POST /api/projects - Create new project
app.post('/api/projects', async (req, res) => {
    try {
        const { name, description, status, dueDate } = req.body;
        
        const newProject = await Project.create({
            name,
            description,
            status,
            dueDate
        });
        
        res.status(201).json(newProject);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// PUT /api/projects/:id - Update existing project
app.put('/api/projects/:id', async (req, res) => {
    try {
        const { name, description, status, dueDate } = req.body;
        
        const [updatedRowsCount] = await Project.update(
            { name, description, status, dueDate },
            { where: { id: req.params.id } }
        );
        
        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        const updatedProject = await Project.findByPk(req.params.id);
        res.json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// DELETE /api/projects/:id - Delete project
app.delete('/api/projects/:id', async (req, res) => {
    try {
        const deletedRowsCount = await Project.destroy({
            where: { id: req.params.id }
        });
        
        if (deletedRowsCount === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// TASK ROUTES

// GET /api/tasks - Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.findAll();
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// GET /api/tasks/:id - Get task by ID
app.get('/api/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ error: 'Failed to fetch task' });
    }
});

// POST /api/tasks - Create new task
app.post('/api/tasks', async (req, res) => {
    try {
        const { title, description, completed, priority, dueDate, projectId } = req.body;
        
        const newTask = await Task.create({
            title,
            description,
            completed,
            priority,
            dueDate,
            projectId
        });
        
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});



// POST /api/register - Register new library patron
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
    
        // Check if user with this email already 
    exists
        const existingUser = await User.findOne({ 
    where: { email } });
        if (existingUser) {
            return res.status(400).json({ error:
        'User with this email already exists' });
        }
    
        // Hash the password before storing it
        const saltRounds = 10;
        const hashedPassword = await
    bcrypt.hash(password, saltRounds);
    
        // Create new user with hashed password
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword  
        });
    
        
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });
    
    } catch (error) {
        console.error('Error registering user:', 
    error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});




// POST /api/login - User Login

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        
        req.session.userId = user.id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;
        
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});




// POST /api/logout
app.post('/api/logout', (req, res) => { 
    req.session.destroy((err) => { 
        if(err) { 
            console.error('Error destroying the session', err); 
            return res.status(500).json({ error: 
        'Failed to logout' }) 
        } 
        res.json({ message: "Logout successful" }) 
    }) 
})

// PUT /api/tasks/:id - Update existing task
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const { title, description, completed, priority, dueDate, projectId } = req.body;
        
        const [updatedRowsCount] = await Task.update(
            { title, description, completed, priority, dueDate, projectId },
            { where: { id: req.params.id } }
        );
        
        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        const updatedTask = await Task.findByPk(req.params.id);
        res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// DELETE /api/tasks/:id - Delete task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const deletedRowsCount = await Task.destroy({
        where: { id: req.params.id }
        });
        
        if (deletedRowsCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Authentication Middleware 

function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        req.user = {
            id: req.session.userId,
            name: req.session.userName,
            email: req.session.userEmail
        };
        next();
    } else {
        res.status(401).json({ 
            error: 'Authentication required. Please log in.' 
        });
    }
}


// Start server
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});