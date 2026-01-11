import mongoose from 'mongoose';

// Ensure Mongoose models are cleared between tests if needed
afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase();
  }
});
