const postModel = require("../models/post.models");
const jwt = require("jsonwebtoken");
const generateCaption = require("../services/ai.service");
const uploadFile = require("../services/storage.service");

async function postController(req, res) {
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      message: "No file is Selected !!!",
    });
  }

  console.log("req.body--", req.body);
  
  // Extract parameters from request body with default values
  const { 
    captionLength = 'medium', 
    mood = '', 
    extraInstructions = '', 
    includeHashtags = true 
  } = req.body;

  const base64ImageFile = file.buffer.toString("base64");

  console.log('caption.length-',captionLength, mood)

  try {
    const caption = await generateCaption(
      base64ImageFile, 
      captionLength, 
      mood, 
      extraInstructions, 
      includeHashtags
    );
    
    const result = await uploadFile(file.buffer);

    const post = await postModel.create({
      image: result.url,
      caption: caption,
    });

    res.status(201).json({
      message: "Post Created Successfully !!",
      post,
    });
  } catch (error) {
    console.error("Error in postController:", error);
    res.status(500).json({
      message: "Error generating caption",
      error: error.message
    });
  }
}

module.exports = { postController };