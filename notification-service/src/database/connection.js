const mongoose = require("mongoose");
const dotEnv = require("dotenv");

dotEnv.config();

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI_NOTIFICATION);
    console.log(`✅ MONGODB CONNECTED => ${connect.connection.host}`);
    
  } catch(error) {
    console.log(`MONGODB CONNECTION FAILED :( => ${error} `);
    
  }
};

module.exports = connectDB;