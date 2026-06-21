const router = require('express').Router();
const asyncHandler = require('../middleware/asyncHandler');
const { getCompany } = require('../controllers/companyController');

router.get('/:id', asyncHandler(getCompany));

module.exports = router;
