const bucket = require('../config/firebaseConfig');
const compressImage = require('../config/imageProcessor');

exports.uploadImage = async (file, type, userId) => {
  let coverImageUrl =
    'https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg';

  if (file) {
    const compressedImage = await compressImage(file.buffer, 'coverImage');
    const fileName = `${type}/${userId}.webp`;
    const fileUpload = bucket.file(fileName);

    await fileUpload.save(compressedImage, {
      metadata: { contentType: 'image/webp' },
    });

    await fileUpload.makePublic();

      // coverImageUrl = `https://storage.googleapis.com/${bucketName}/${fileName}?t=${Date.now()}`;
    coverImageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}?t=${Date.now()}`;
  }
  return coverImageUrl;
};

exports.deleteImage = async (type, userId) => {
  const filePath = `${type}/${userId}.webp`;
  const file = bucket.file(filePath);

  try {
    const [exists] = await file.exists();
    
    if (exists) {
      await file.delete();
    } 
    
  } catch (err) {
    console.error('Error deleting image:', err.message);
  }
};