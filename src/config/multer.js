// // server/config/multer.js
// import multer from "multer";

// const storage = multer.memoryStorage(); // IMPORTANT

// const upload = multer({ storage });

// export default upload;

import multer from "multer";
import path from "path";
import fs from "fs";

// Use diskStorage so we have a tempFilePath string
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/temp";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + Date.now() + ext;
    cb(null, name);
  }
});

const upload = multer({ storage });
export default upload;