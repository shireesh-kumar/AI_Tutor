const express = require('express')
const app = express()
const config = require('./config/config.js');
const quizRouter = require('./routing/quizRoute.js');
const {validateLinkRouter} = require('./routing/validateLinkRoute.js');
const cors = require('cors');

app.use(cors());

app.use('/', quizRouter)
app.use('/validatelink', validateLinkRouter);

// console.log("CORS allowed for:", config.frontendUrl);


app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});
