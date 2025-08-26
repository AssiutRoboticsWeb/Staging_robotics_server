const Course = require('../mongoose.models/course');
const Track = require('../mongoose.models/track');
const asyncWrapper = require('../middleware/asyncWrapper');
const Member = require('../mongoose.models/member');
const jwt = require('../middleware/jwt');

// ================== COURSE CRUD ==================

// Create a new course
const createCourse = asyncWrapper(async (req, res) => {
    const { name, description, tracks } = req.body;

    const course = new Course({ name, description, tracks });
    await course.save();

    res.status(201).json({ success: true, data: course });
});

// Get all courses
const getAllCourses = asyncWrapper(async (req, res) => {
    const courses = await Course.find().populate('tracks').populate('tasks.assignees');
    res.status(200).json({ success: true, data: courses });
});

// Get a course by ID
const getCourseById = asyncWrapper(async (req, res) => {
    const course = await Course.findById(req.params.id).populate('tracks').populate('tasks.assignees');
    if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, data: course });
});

// Update a course
const updateCourse = asyncWrapper(async (req, res) => {
    const { name, description, tracks } = req.body;
    const course = await Course.findByIdAndUpdate(
        req.params.id,
        { name, description, tracks },
        { new: true }
    );
    if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, data: course });
});

// Delete a course
const deleteCourse = asyncWrapper(async (req, res) => {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, message: 'Course deleted successfully' });
});

// ================== TRACKS ==================

// Add track to course
const addTrackToCourse = asyncWrapper(async (req, res) => {
    const { trackId } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (!course.tracks.includes(trackId)) {
        course.tracks.push(trackId);
        await course.save();
    }
    res.status(200).json({ success: true, data: course });
});

// Remove track from course
const removeTrackFromCourse = asyncWrapper(async (req, res) => {
    const { trackId } = req.body;
    const course = await Course.findByIdAndUpdate(
        req.params.id,
        { $pull: { tracks: trackId } },
        { new: true }
    );
    if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, data: course });
});

// ================== TASKS ==================

// Add a task to a course
const addTaskToCourse = asyncWrapper(async (req, res) => {
    const { title, description, deadline, file } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
    }
    course.tasks.push({ title, description, deadline, file });
    await course.save();
    res.status(201).json({ success: true, data: course });
});

// Remove a task from a course
const removeTaskFromCourse = asyncWrapper(async (req, res) => {
    const { taskId } = req.body;
    const course = await Course.findByIdAndUpdate(
        req.params.id,
        { $pull: { tasks: { _id: taskId } } },
        { new: true }
    );
    if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, data: course });
});

// Get tasks for a course
const getTasksForCourse = asyncWrapper(async (req, res) => {
    const course = await Course.findById(req.params.id).populate('tasks.assignees');
    if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, data: course.tasks });
});

// Update task in a course
const updateTaskInCourse = asyncWrapper(async (req, res) => {
    const { taskId } = req.params;
    const { title, description, deadline, file } = req.body;

    const course = await Course.findOneAndUpdate(
        { 'tasks._id': taskId },
        {
            $set: {
                'tasks.$.title': title,
                'tasks.$.description': description,
                'tasks.$.deadline': deadline,
                'tasks.$.file': file,
            },
        },
        { new: true }
    );

    if (!course) {
        return res.status(404).json({ success: false, message: 'Task not found in course' });
    }

    res.status(200).json({ success: true, data: course });
});

// Delete a task completely
const deleteTaskInCourse = asyncWrapper(async (req, res) => {
    const { courseId, taskId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
    }
    const task = course.tasks.id(taskId);
    if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
    }
    task.remove();
    await course.save();
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
});

// ================== SUBMISSIONS & RATING ==================

// Submit a task
const submitCourseTask = asyncWrapper(async (req, res) => {
    const { taskId } = req.params;
    const { file } = req.body;
    const { email } = req.decoded;

    const member = await Member.findOne({ email });
    if (!member) {
        return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const course = await Course.findOne({ 'tasks._id': taskId });
    if (!course) {
        return res.status(404).json({ success: false, message: 'Course or Task not found' });
    }

    const task = course.tasks.id(taskId);
    task.submissions.push({ member: member._id, file });
    await course.save();

    res.status(201).json({ success: true, message: 'Task submitted successfully' });
});

// Rate a task submission
const rateCourseTask = asyncWrapper(async (req, res) => {
    const { taskId, submissionId } = req.params;
    const { rating } = req.body;

    const course = await Course.findOne({ 'tasks._id': taskId });
    if (!course) {
        return res.status(404).json({ success: false, message: 'Course or Task not found' });
    }

    const task = course.tasks.id(taskId);
    const submission = task.submissions.id(submissionId);
    if (!submission) {
        return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    submission.rating = rating;
    await course.save();

    res.status(200).json({ success: true, message: 'Submission rated successfully' });
});

// Get all submissions for a task
const getSubmissionsForTask = asyncWrapper(async (req, res) => {
    const { taskId } = req.params;
    const course = await Course.findOne({ 'tasks._id': taskId }).populate('tasks.submissions.member');
    if (!course) {
        return res.status(404).json({ success: false, message: 'Course or Task not found' });
    }

    const task = course.tasks.id(taskId);
    res.status(200).json({ success: true, data: task.submissions });
});

// Get all completed task submissions across courses (rated submissions)
const getCompletedTasks = asyncWrapper(async (req, res) => {
    // Optional filters
    const { courseId, memberId } = req.query || {};

    // Fetch courses with member population for submissions
    const query = courseId ? { _id: courseId } : {};
    const courses = await Course.find(query).populate('tasks.submissions.member', 'name email committee');

    const completed = [];
    for (const course of courses) {
        for (const task of course.tasks || []) {
            for (const sub of task.submissions || []) {
                const isCompleted = typeof sub.rating !== 'undefined' && sub.rating !== null;
                if (!isCompleted) continue;
                if (memberId && String(sub.member?._id || sub.member) !== String(memberId)) continue;

                completed.push({
                    courseId: course._id,
                    courseName: course.name,
                    taskId: task._id,
                    title: task.title,
                    member: sub.member, // populated doc (if available)
                    rating: sub.rating,
                    submittedAt: sub.submissionDate,
                });
            }
        }
    }

    return res.status(200).json({ success: true, count: completed.length, data: completed });
});

// Get my tasks with status
const getMyCourseTasks = asyncWrapper(async (req, res) => {
    const { email } = req.decoded;

    const member = await Member.findOne({ email });
    if (!member) {
        return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const courses = await Course.find({ 'tasks.assignees': member._id });

    const tasks = [];
    courses.forEach((course) => {
        course.tasks.forEach((task) => {
            const submission = task.submissions.find(
                (sub) => sub.member.toString() === member._id.toString()
            );
            tasks.push({
                courseId: course._id,
                courseName: course.name,
                taskId: task._id,
                title: task.title,
                deadline: task.deadline,
                status: submission ? (submission.rating ? 'completed' : 'submitted') : 'pending',
                submission,
            });
        });
    });

    res.status(200).json({ success: true, data: tasks });
});

// ================== EXPORTS ==================

module.exports = {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    addTrackToCourse,
    removeTrackFromCourse,
    addTaskToCourse,
    removeTaskFromCourse,
    getTasksForCourse,
    updateTaskInCourse,
    deleteTaskInCourse,
    submitCourseTask,
    rateCourseTask,
    getSubmissionsForTask,
    getMyCourseTasks,
    getCompletedTasks
};
