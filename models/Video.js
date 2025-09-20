const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  link: {
    type: String,
    required: [true, 'رابط الفيديو مطلوب'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'الرجاء إدخال رابط صحيح يبدأ بـ http:// أو https://'
    }
  },
  name: {
    type: String,
    required: [true, 'اسم الفيديو مطلوب'],
    trim: true,
    minlength: [3, 'اسم الفيديو يجب أن يكون 3 أحرف على الأقل']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Video', videoSchema);