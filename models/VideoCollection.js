const mongoose = require('mongoose');

// Schema للفيديو الواحد داخل المجموعة
const videoItemSchema = new mongoose.Schema({
  link: {
    type: String,
    required: true,
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
    required: true,
    trim: true,
    minlength: [3, 'اسم الفيديو يجب أن يكون 3 أحرف على الأقل']
  }
});

// Schema للمجموعة الكاملة
const videoCollectionSchema = new mongoose.Schema({
  videos: {
    type: [videoItemSchema], // مصفوفة من الفيديوهات
    required: true,
    validate: [
      {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: 'يجب إضافة فيديو واحد على الأقل'
      }
    ]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VideoCollection', videoCollectionSchema);