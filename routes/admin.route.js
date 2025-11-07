import {Router} from 'express';
import {adminAuthentication} from '../middlewares/admin.authentication.js';
import {
  registerAdmin,
  loginAdmin,
  createCourse,
  getAdminProfile,
  getStudentFeedbacks,
  registerCollege,
} from '../controller/admin.controller.js';

const router = Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

router.post('/courses', adminAuthentication, createCourse);
router.post('/:adminId/college', adminAuthentication, registerCollege);
router.get('/:adminId', adminAuthentication, getAdminProfile);
router.get('/feedbacks/list', adminAuthentication, getStudentFeedbacks);

export default router;
