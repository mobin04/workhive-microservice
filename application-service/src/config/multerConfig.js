const multer = require('multer');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new AppError('Invalid file type :('), false);
  }
})

module.exports = upload;