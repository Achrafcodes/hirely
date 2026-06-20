const router = require('express').Router();
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const asyncHandler = require('../middleware/asyncHandler');
const {
  getMyApplications,
  updateStatus,
  withdrawApplication,
} = require('../controllers/applicationController');

router.get('/me',      verifyToken, requireRole('candidate'), asyncHandler(getMyApplications));
router.patch('/:id/status', verifyToken, requireRole('employer'), asyncHandler(updateStatus));
router.delete('/:id',  verifyToken, requireRole('candidate'), asyncHandler(withdrawApplication));

module.exports = router;
