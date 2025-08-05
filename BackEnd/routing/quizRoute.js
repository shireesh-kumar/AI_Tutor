const express = require('express');
const quizRouter = express.Router();
const {getQuizController} = require('../controllers/quizController.js');

quizRouter.get('/quiz', getQuizController)

module.exports = quizRouter;