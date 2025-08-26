const express = require("express");
const Router = express.Router();

const courseController = require('../controller/course_controller');
const jwt = require('../middleware/jwt');


// ====== Member gets their tasks across courses ======
Router.get("/my-tasks", jwt.verify, courseController.getMyCourseTasks);
// ====== Completed Course Tasks ======
Router.get("/tasks/completed", jwt.verify, courseController.getCompletedTasks);

// ====== Course CRUD Operations ======

// Create a new course
Router.post("/", courseController.createCourse);

// Get all courses
Router.get("/", courseController.getAllCourses);

// Get single course by ID, Update course by ID, Delete course by ID
Router.route("/:id")
    .get(courseController.getCourseById)
    .put(courseController.updateCourse)
    .delete(courseController.deleteCourse);

// ====== Course Track Management ======

// Add track to course
Router.post("/:courseId/tracks/:trackId", courseController.addTrackToCourse);

// Remove track from course
Router.delete("/:courseId/tracks/:trackId", courseController.removeTrackFromCourse);

// ====== Course Task Management ======

// Add task to course
Router.post("/:courseId/tasks", courseController.addTaskToCourse);

// Remove task from course
Router.delete("/:courseId/tasks/:taskId", courseController.removeTaskFromCourse);

// Get all tasks for a course
Router.get("/:courseId/tasks", courseController.getTasksForCourse);

// Update a task inside a course
Router.put("/:courseId/tasks/:taskId", courseController.updateTaskInCourse);





// Member submits a task
Router.post(
  "/:courseId/tasks/:taskId/submit",
  jwt.verify,
  courseController.submitCourseTask
);

// Head rates a submission
Router.put(
  "/:courseId/tasks/:taskId/rate",
  jwt.verify,
  courseController.rateCourseTask
);

// Head lists submissions for a task
Router.get(
  "/:courseId/tasks/:taskId/submissions",
  jwt.verify,
  courseController.getSubmissionsForTask
);

module.exports = Router;
