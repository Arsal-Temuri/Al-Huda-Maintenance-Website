const multer = require('multer');

// Change from diskStorage to memoryStorage for SERVERLESS compatibility
// Vercel does not allow writing files to the disk persistently.
// For production, you will need to upload this buffer to AWS S3 or Cloudinary.
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

module.exports = upload;