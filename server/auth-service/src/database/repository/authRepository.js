const { User } = require('../models/index');
const { AppError } = require('../../utils/index');
const UserAPIFeatures = require('../../utils/apiFeatures');

class AuthRepository {
  async FindByEmail({ email }) {
    try {
      const existingUser = await User.findOne({ email }).lean();
      return existingUser;
    } catch (err) {
      throw new AppError('Unable to find user!', 500);
    }
  }

  async GetAllUsers({ query }) {
    try {
      const features = new UserAPIFeatures(User, query)
        .filter()
        .search()
        .sort()
        .paginate();

      const users = await features.fetchUsers();
      const totalUsers = await User.countDocuments(features.filters);
      const totalPages = Math.ceil(totalUsers / features.pagination.limit);

      return { users, totalPages, totalUsers };
    } catch (err) {
      throw new AppError('Unable to find users!', 500);
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
      // console.log(err);
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
      const user = await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: { savedJobs: jobId },
        },
        { new: true }
      );
      return user;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async suspendUser({ userId, days, reason }) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          isSuspended: true,
          suspendedUntil: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
          suspendReason: reason || 'No reason provided',
        },
        { new: true, runValidators: true }
      );

      if (!user) return false;

      return user;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async UnsuspendUser({ userId }) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          isSuspended: false,
          suspendedUntil: null,
          suspendReason: null,
        },
        { new: true, runValidators: true }
      );
      if (!user) return false;
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

  async FindUserByEmail({ email }) {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async FindUserByResetToken({ hashedToken }) {
    try {
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });
      return user;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async SaveResetPassword({ user, password }) {
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    user.password = undefined;

    return user;
  }

  async GenerateResetToken({ user }) {
    try {
      if (!user) return false;
      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });
      return resetToken;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }
}

module.exports = AuthRepository;
