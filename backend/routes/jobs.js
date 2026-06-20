const router = require('express').Router();
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const asyncHandler = require('../middleware/asyncHandler');
const upload = require('../middleware/upload');
const {
  createJob,
  getJobs,
  getMyJobs,
  getJob,
  updateJob,
  deleteJob,
  getApplicants,
} = require('../controllers/jobController');
const { applyToJob } = require('../controllers/applicationController');

router.get('/',                                                            asyncHandler(getJobs));
router.get('/mine',   verifyToken, requireRole('employer'),                asyncHandler(getMyJobs));
router.get('/:id',                                                         asyncHandler(getJob));
router.post('/',      verifyToken, requireRole('employer'),                asyncHandler(createJob));
router.put('/:id',    verifyToken, requireRole('employer'),                asyncHandler(updateJob));
router.delete('/:id', verifyToken, requireRole('employer'),                asyncHandler(deleteJob));
router.get('/:id/applicants', verifyToken, requireRole('employer'),        asyncHandler(getApplicants));
router.post('/:id/apply', verifyToken, requireRole('candidate'), upload.single('resume'), asyncHandler(applyToJob));

module.exports = router;
