const router = require('express').Router();
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  getMyApplications,
  updateStatus,
  withdrawApplication,
} = require('../controllers/applicationController');

router.get('/me', verifyToken, requireRole('candidate'), getMyApplications);
router.patch('/:id/status', verifyToken, requireRole('employer'), updateStatus);
router.delete('/:id', verifyToken, requireRole('candidate'), withdrawApplication);

module.exports = router;
