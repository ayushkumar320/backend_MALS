import { Router } from 'express';
import { adminAuthentication } from '../middlewares/admin.authentication.js';
import {
  registerAdmin,
  loginAdmin,
  createCourse,
  updateAdminCapacity,
  getAdminProfile,
  getStudentFeedbacks,
} from '../controller/admin.controller.js';

const router = Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

router.post('/courses', adminAuthentication, createCourse);
router.patch('/:adminId/capacity', adminAuthentication, updateAdminCapacity);
router.get('/:adminId', adminAuthentication, getAdminProfile);
router.get('/feedbacks/list', adminAuthentication, getStudentFeedbacks);

export default router;
