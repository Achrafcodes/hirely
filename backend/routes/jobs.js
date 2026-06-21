const router = require('express').Router();
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const asyncHandler = require('../middleware/asyncHandler');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const {
  createJob,
  getJobs,
  getMyJobs,
  getJob,
  updateJob,
  deleteJob,
  getApplicants,
  getStats,
} = require('../controllers/jobController');
const { applyToJob } = require('../controllers/applicationController');

const jobLimits = validate({
  title:       { max: 200,   label: 'Title' },
  description: { max: 10000, label: 'Description' },
  location:    { max: 200,   label: 'Location' },
});

router.get('/stats',                                                                  asyncHandler(getStats));
router.get('/',                                                                       asyncHandler(getJobs));
router.get('/mine',   verifyToken, requireRole('employer'),                           asyncHandler(getMyJobs));
router.get('/:id',                                                                    asyncHandler(getJob));
router.post('/',      verifyToken, requireRole('employer'), jobLimits,               asyncHandler(createJob));
router.put('/:id',    verifyToken, requireRole('employer'), jobLimits,               asyncHandler(updateJob));
router.delete('/:id', verifyToken, requireRole('employer'),                asyncHandler(deleteJob));
router.get('/:id/applicants', verifyToken, requireRole('employer'),        asyncHandler(getApplicants));
router.post('/:id/apply', verifyToken, requireRole('candidate'), upload.single('resume'), asyncHandler(applyToJob));

module.exports = router;
