import {Router} from 'express';
import {studentAuthentication} from '../middlewares/student.authentication.js';
import {
  registerStudent,
  loginStudent,
  getStudentProfile,
  updateStudentProfile,
  submitStudentFeedback,
  selectStudentCourses,
  getStudentSelectedCourses,
} from '../controller/student.controller.js';

const router = Router();

router.post('/register', registerStudent);
router.post('/login', loginStudent);

router.get('/:studentId', studentAuthentication, getStudentProfile);
router.patch('/:studentId', studentAuthentication, updateStudentProfile);
router.post(
  '/:studentId/feedback',
  studentAuthentication,
  submitStudentFeedback
);
router.post('/:studentId/courses', studentAuthentication, selectStudentCourses);
router.get(
  '/:studentId/courses',
  studentAuthentication,
  getStudentSelectedCourses
);

export default router;
