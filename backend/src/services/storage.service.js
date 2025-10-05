const ImageKit = require('imagekit');
const { v4: uuidv4 } = require('uuid');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_publicKey,
  privateKey: process.env.IMAGEKIT_privateKey,
  urlEndpoint: process.env.IMAGEKIT_urlEndpoint,
});

async function uploadFile(file) {
  try {
    const response = await imagekit.upload({
      file, // file buffer or base64 string
      fileName: uuidv4(), // ✅ correct key name
      folder: 'cohort-insta-lite',
    });

    return response;
  } catch (error) {
    console.error('❌ ImageKit upload error:', error.message);
    throw new Error('Image upload failed');
  }
}

module.exports = uploadFile;


// function uploadFile(file) {
//     return new Promise((resolve, reject) => {
//         imagekit.upload(
//             {
//                 file: file.buffer,
//                 fileName: Date.now() + "-" + file.originalname,
//                 folder : 'cohort-audio'
//             },
//             (error, result) => {
//                 if (error) {
//                     reject(error);
//                 } else {
//                     resolve(result);
//                 }
//             }
//         );
//     });
// }

// module.exports = uploadFile;