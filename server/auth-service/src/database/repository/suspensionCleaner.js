const cron = require('node-cron');
const User = require('../models/userModel');
const { Email } = require('../../utils');

cron.schedule(
  '0 * * * *',
  async () => {
    try {
      const now = new Date();

      const expire = await User.find({
        isSuspended: true,
        suspendedUntil: { $ne: null, $lte: now },
      });

      if (expire.length > 0) {
        for (const user of expire) {
          user.isSuspended = false;
          user.suspendedUntil = null;
          user.suspendReason = null;

          await new Email(user, '', {}).sendUnsuspendEmail();

          await user.save();
          console.log(`Unsuspended this user : ${user.email}`);
        }
      }
    } catch (err) {
      console.log(err);
    }
  },
  {
    timezone: 'Asia/Kolkata',
  }
);
