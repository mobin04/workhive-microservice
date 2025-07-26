const { User } = require('../models/index');
const { AppError, catchAsync } = require('../../utils/index');

class AuthRepository {
  async FindByEmail({ email }) {
    try {
      const existingUser = await User.findOne({ email }).lean();
      return existingUser;
    } catch (err) {
      throw new AppError('Unable to find user!', 500);
    }
  }

  async FindByEmailAndGetPassword({ email }) {
    try {
      const user = await User.findOne({ email }).select('+password');
      return user;
    } catch (err) {
      throw new AppError('Unable to find user', 500);
    }
  }

  async FindById({ id }) {
    try {
      const existingUser = User.findById(id).lean();
      return existingUser;
    } catch (err) {
      throw new AppError('Unable to find user!', 500);
    }
  }

  async CreateUser({ name, email, password, role }) {
    try {
      const user = await User.create({ name, email, password, role });
      return user;
    } catch (err) {
      console.log(err);
      throw new AppError('Unable to create user!', 500);
    }
  }

  async updateUser({ userId, filteredProperty }) {
    try {
      const updateUser = await User.findByIdAndUpdate(
        userId,
        filteredProperty,
        {
          new: true,
          runValidators: true,
        }
      ).lean();
      return updateUser;
    } catch (err) {
      throw new AppError('Unable to update user!', 500);
    }
  }

  async deleteUser({ id }) {
    try {
      const user = await User.findOneAndDelete({ _id: id }).lean();
      return user;
    } catch (err) {
      throw new AppError('Unable to delete user!', 500);
    }
  }

  async SaveJob({ userId, jobId }) {
    try {
      const user = await User.findByIdAndUpdate(userId, {
        $addToSet: { savedJobs: jobId },
      });
      return user;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async PullSavedJob({ jobId, userId }) {
    try {
      const user = await User.findByIdAndUpdate(userId, {
        $pull: { savedJobs: jobId },
      });
      if (user) return true;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  } 

  async GetUserStatistics() {
    try {
      const userStatistics = await User.aggregate([
        { $group: { _id: '$role', totalUsers: { $sum: 1 } } },
        { $project: { _id: 0, role: '$_id', totalUsers: 1 } },
      ]);
      return userStatistics;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }
}

module.exports = AuthRepository;
