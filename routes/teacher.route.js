import {Router} from 'express';
import {teacherAuthentication} from '../middlewares/teacher.authentication.js';
import {
  registerTeacher,
  loginTeacher,
  getTeacherProfile,
  updateTeacherProfile,
  getTeacherCourses,
} from '../controller/teacher.controller.js';

const router = Router();

router.post('/register', registerTeacher);
router.post('/login', loginTeacher);

router.get('/:teacherId', teacherAuthentication, getTeacherProfile);
router.patch('/:teacherId', teacherAuthentication, updateTeacherProfile);
router.get('/:teacherId/courses', teacherAuthentication, getTeacherCourses);

export default router;
