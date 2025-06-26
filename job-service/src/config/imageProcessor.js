const sharp = require('sharp');

const compressImage = async (fileBuffer, type) => {
  return await sharp(fileBuffer)
    .resize(type === 'coverImage' ? 1200 : 800)
    .toFormat('webp')
    .webp({ quality: 90 })
    .toBuffer();
};

module.exports = compressImage;