const express = require('express');
const postsRouters = require('./routes/posts.router');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

app.use(cors())
app.use(express.json());

app.use(cookieParser());

app.use('/api/post', postsRouters);

module.exports = app;