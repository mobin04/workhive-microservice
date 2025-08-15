const UAParser = require('ua-parser-js'); // Get Device Info.
const speakeasy = require('speakeasy'); // For OTP verficaion.
const jwt = require('jsonwebtoken');

class AuthConfig {
  // Get location based on IP
  async getGeoLocation(ip) {
    const response = await fetch(
      `https://ipinfo.io/${ip}/json?token=${process.env.IPINFO_API_KEY}`
    );
    const data = await response.json();
    return data.city
      ? `${data.city}, ${data.region}, ${data.country}`
      : 'Unknown';
  }

  // Get IP Address
  async getPublicIP() {
    const response = await fetch('https://api64.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  }

  // Generate OTP and Secret Key
  generateOTP() {
    const otpSecret = speakeasy.generateSecret({ length: 20 }).base32;
    const otpToken = speakeasy.totp({
      secret: otpSecret,
      encoding: 'base32',
      step: 60,
    });

    return { otpSecret, otpToken };
  }

  // OTP Verification.
  otpVerification(otp, otpSecret) {
    const verify = speakeasy.totp.verify({
      secret: otpSecret,
      encoding: 'base32',
      token: otp,
      step: 60,
      window: 2,
    });

    return verify;
  }

  // Get Logged In User Info
  async getLoggedInUserInfo(req) {
    try {
      const parser = new UAParser();

      const ip = await this.getPublicIP();
      const location = await this.getGeoLocation(ip);

      const deviceInfo = parser
        .setUA(req.headers['user-agent'] || '')
        .getResult();

      return {
        location: location || 'Unknown',
        device: {
          browser: deviceInfo.browser?.name || 'Unknown',
          type: deviceInfo?.device?.type || 'Desktop',
        },
      };
    } catch (error) {
      console.error('Error getting logged-in user info:', error.message);

      return {
        location: 'Unknown',
        device: {
          browser: 'Unknown',
          type: 'Desktop',
        },
      };
    }
  }
}

module.exports = AuthConfig;
