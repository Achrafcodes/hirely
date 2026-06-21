const router = require('express').Router();
const asyncHandler = require('../middleware/asyncHandler');
const { getCompanies, getCompany } = require('../controllers/companyController');

router.get('/', asyncHandler(getCompanies));
router.get('/:id', asyncHandler(getCompany));

module.exports = router;
