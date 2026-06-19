const router = require('express').Router();
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
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

router.get('/', getJobs);
router.get('/mine', verifyToken, requireRole('employer'), getMyJobs);
router.get('/:id', getJob);
router.post('/', verifyToken, requireRole('employer'), createJob);
router.put('/:id', verifyToken, requireRole('employer'), updateJob);
router.delete('/:id', verifyToken, requireRole('employer'), deleteJob);
router.get('/:id/applicants', verifyToken, requireRole('employer'), getApplicants);
router.post('/:id/apply', verifyToken, requireRole('candidate'), upload.single('resume'), applyToJob);

module.exports = router;
