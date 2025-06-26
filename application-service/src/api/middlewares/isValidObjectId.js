const mongoose = require('mongoose');
const AppError = require('../../utils/appError');

module.exports = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError('Invalid object id :(', 400));
  }
  next();
};
