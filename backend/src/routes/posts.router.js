const express = require("express");
const { postController } = require("../controllers/post.controller");
const postModel = require('../models/post.models');
const multer = require('multer');


const router = express.Router();
const upload = multer({storage: multer.memoryStorage()})

router.post("/", upload.single('image'), postController);

module.exports = router;
