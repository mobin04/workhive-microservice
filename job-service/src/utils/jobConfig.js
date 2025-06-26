const handleFileUploads = require('./fileUploads');

class JobConfig {
  async uploadCompanyLogo(file, jobId) {
    try {
      const companyLogoUrl = await handleFileUploads.uploadImage(
        file,
        'companyLogo',
        jobId
      );
      return companyLogoUrl;
    } catch (err) {
      throw new AppError(
        `${
          err.message ||
          'Something went wrong while uploading company logo, Please try again!'
        }`,
        500
      );
    }
  }

  handleCoordinateFormat(coordinates) {
    try {
      if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        throw new AppError(
          'geoLocation coordinates must be an array with [longitude, latitude]',
          400
        );
      }

      const [longitude, latitude] = coordinates.map((coord) =>
        parseFloat(coord)
      );

      if (isNaN(longitude) || isNaN(latitude)) {
        throw new AppError('Invalid geoLocation coordinates format', 400);
      }

      // Ensure latitude is (-90 to 90) and longitude (-180 to 180)
      if (
        longitude < -180 ||
        longitude > 180 ||
        latitude < -90 ||
        latitude > 90
      ) {
        throw new AppError('Invalid geoLocation coordinates provided', 400);
      }

      return [longitude, latitude];
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }
}

module.exports = JobConfig;
