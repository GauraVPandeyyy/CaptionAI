const postModel = require("../models/post.models");
const jwt = require("jsonwebtoken");
const generateCaption = require("../services/ai.service");
const uploadFile = require("../services/storage.service");

async function postController(req, res) {
  const file = req.file;

  if(!file){
    return res.status(400).json({
        message : "No file is Selected !!!"
    })
  }


  const base64ImageFile = file.buffer.toString("base64");

  const caption = await generateCaption(base64ImageFile);
  const result = await uploadFile(file.buffer);

//   console.log('caption', caption);
  console.log('result', result);
    
  const post = await postModel.create({
    image : result.url,
    caption :caption,
  })


  res.status(201).json({
    message : "Post Created Successfully !!",
    post
  });
}

module.exports = { postController };
