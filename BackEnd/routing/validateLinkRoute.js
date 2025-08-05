const express = require('express');
const validateLinkRouter = express.Router();
const {validateLinkController} = require('../controllers/validateLinkController.js');
validateLinkRouter.get('/', validateLinkController);

module.exports = {validateLinkRouter};