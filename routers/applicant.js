const express = require('express');
const router = express.Router();
const jwt = require('../middleware/jwt');
const applicant_controller = require('../controller/applicant_controller');

router.use(jwt.verify);

// جلب كل المتقدمين للـ committee (للـ heads فقط)
router.get('/', applicant_controller.getApplicants);

// جلب متقدمين لتراك معين
router.get('/track/:trackId', applicant_controller.getTrackApplicants);

// جلب تقديماتي الشخصية
router.get('/my-applications', applicant_controller.getMyApplications);

// التقديم لتراك
router.post('/apply/:trackId', applicant_controller.createApplicant);

// قبول متقدم
router.put('/accept/:trackId/:memberId', applicant_controller.acceptApplicant);

// رفض متقدم
router.put('/reject/:trackId/:memberId', applicant_controller.rejectApplicant);


module.exports = router;
