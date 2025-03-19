const express = require('express');
require('dotenv').config();
const authMiddleware = require('./middleware/authMiddleware');

const authRoutes = require('./routes/auth.routes');
const employeeRoutes = require('./routes/employee.routes');
const teamRoutes = require('./routes/team.routes');
const projectRoutes = require('./routes/project.routes');
const backlogRoutes = require('./routes/backlog.routes');
const sprintRoutes = require('./routes/sprint.routes');
const taskRoutes = require('./routes/task.routes');
const meetingRoutes = require('./routes/meeting.routes');
const timeoffRoutes = require('./routes/timeoff.routes');
const salaryRoutes = require('./routes/salary.routes');

const app = express();

app.use(express.json());

app.use('/auth', authRoutes);

app.use('/employees', authMiddleware, employeeRoutes);
app.use('/teams', authMiddleware, teamRoutes);
app.use('/projects', authMiddleware, projectRoutes);
app.use('/backlogs', authMiddleware, backlogRoutes);
app.use('/sprints', authMiddleware, sprintRoutes);
app.use('/tasks', authMiddleware, taskRoutes);
app.use('/meetings', authMiddleware, meetingRoutes);
app.use('/timeoffs', authMiddleware, timeoffRoutes);
app.use('/salaries', authMiddleware, salaryRoutes);

const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log(`API Gateway is running on port ${port}`);
});
