const Video = require('../models/Video');
const VideoCollection = require('../models/VideoCollection');

// ================================================
// VideoCollection Functions (النموذج الجديد)
// ================================================

// Get all video collections
exports.getAllVideoCollections = async (req, res) => {
  try {
    const collections = await VideoCollection.find().sort('-createdAt');
    res.status(200).json({
      success: true,
      count: collections.length,
      data: collections
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get last video collection
exports.getLastVideoCollection = async (req, res) => {
  try {
    const lastCollection = await VideoCollection.findOne().sort('-createdAt').limit(1);
    
    if (!lastCollection) {
      return res.status(404).json({
        success: false,
        error: 'لا توجد فيديوهات محفوظة'
      });
    }
    
    res.status(200).json({
      success: true,
      data: lastCollection
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get last video from all collections
exports.getLastVideo = async (req, res) => {
  try {
    const lastCollection = await VideoCollection.findOne().sort('-createdAt').limit(1);
    
    if (!lastCollection || !lastCollection.videos || lastCollection.videos.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'لا توجد فيديوهات محفوظة'
      });
    }
    
    // الحصول على آخر فيديو من آخر collection
    const lastVideo = lastCollection.videos[lastCollection.videos.length - 1];
    
    res.status(200).json({
      success: true,
      data: {
        video: lastVideo,
        collectionId: lastCollection._id,
        createdAt: lastCollection.createdAt
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Create video collection (bulk videos in one document)
exports.createVideoCollection = async (req, res) => {
  try {
    const { videos } = req.body;
    
    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'الرجاء إرسال مصفوفة من الفيديوهات'
      });
    }
    
    // التحقق من صحة البيانات
    const validVideos = videos.filter(video => 
      video.link && video.link.trim() !== '' && 
      video.name && video.name.trim() !== ''
    );
    
    if (validVideos.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'لا توجد فيديوهات صالحة للحفظ'
      });
    }
    
    // حفظ كل الفيديوهات في document واحد
    const videoCollection = await VideoCollection.create({
      videos: validVideos
    });
    
    res.status(201).json({
      success: true,
      data: videoCollection
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get single video collection by ID
exports.getVideoCollection = async (req, res) => {
  try {
    const collection = await VideoCollection.findById(req.params.id);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'المجموعة غير موجودة'
      });
    }
    
    res.status(200).json({
      success: true,
      data: collection
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update video collection
exports.updateVideoCollection = async (req, res) => {
  try {
    const collection = await VideoCollection.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'المجموعة غير موجودة'
      });
    }
    
    res.status(200).json({
      success: true,
      data: collection
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete video collection
exports.deleteVideoCollection = async (req, res) => {
  try {
    const collection = await VideoCollection.findByIdAndDelete(req.params.id);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'المجموعة غير موجودة'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all videos from all collections (flattened)
exports.getAllVideosFlattened = async (req, res) => {
  try {
    const collections = await VideoCollection.find().sort('-createdAt');
    
    // استخراج كل الفيديوهات من كل المجموعات
    const allVideos = collections.reduce((acc, collection) => {
      return acc.concat(collection.videos.map(video => ({
        ...video.toObject(),
        collectionId: collection._id,
        collectionCreatedAt: collection.createdAt
      })));
    }, []);
    
    res.status(200).json({
      success: true,
      count: allVideos.length,
      data: allVideos
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete all video collections
exports.deleteAllVideoCollections = async (req, res) => {
  try {
    await VideoCollection.deleteMany({});
    
    res.status(200).json({
      success: true,
      message: 'تم حذف جميع مجموعات الفيديوهات'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Add single video to existing collection
exports.addVideoToCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { link, name } = req.body;
    
    if (!link || !name) {
      return res.status(400).json({
        success: false,
        error: 'الرجاء إدخال رابط واسم الفيديو'
      });
    }
    
    const collection = await VideoCollection.findById(id);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'المجموعة غير موجودة'
      });
    }
    
    collection.videos.push({ link, name });
    await collection.save();
    
    res.status(200).json({
      success: true,
      data: collection
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Remove video from collection
exports.removeVideoFromCollection = async (req, res) => {
  try {
    const { id, videoId } = req.params;
    
    const collection = await VideoCollection.findById(id);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'المجموعة غير موجودة'
      });
    }
    
    collection.videos = collection.videos.filter(
      video => video._id.toString() !== videoId
    );
    
    await collection.save();
    
    res.status(200).json({
      success: true,
      data: collection
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// ================================================
// Video Functions (النموذج القديم - إذا كنت تحتاجه)
// ================================================

// Get all videos
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort('-createdAt');
    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get single video
exports.getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'الفيديو غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      data: video
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Create videos (bulk - individual documents)
exports.createVideos = async (req, res) => {
  try {
    const videos = req.body.videos;
    
    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'الرجاء إرسال مصفوفة من الفيديوهات'
      });
    }
    
    // التحقق من صحة البيانات
    const validVideos = videos.filter(video => 
      video.link && video.link.trim() !== '' && 
      video.name && video.name.trim() !== ''
    );
    
    if (validVideos.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'لا توجد فيديوهات صالحة للحفظ'
      });
    }
    
    const createdVideos = await Video.insertMany(validVideos);
    
    res.status(201).json({
      success: true,
      count: createdVideos.length,
      data: createdVideos
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update video
exports.updateVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'الفيديو غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      data: video
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete video
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'الفيديو غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete all videos
exports.deleteAllVideos = async (req, res) => {
  try {
    await Video.deleteMany({});
    
    res.status(200).json({
      success: true,
      message: 'تم حذف جميع الفيديوهات'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// ================================================
// Utility Functions
// ================================================

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const videoCount = await Video.countDocuments();
    const collectionCount = await VideoCollection.countDocuments();
    
    const collections = await VideoCollection.find();
    const totalVideosInCollections = collections.reduce((acc, collection) => {
      return acc + collection.videos.length;
    }, 0);
    
    res.status(200).json({
      success: true,
      data: {
        individualVideos: videoCount,
        collections: collectionCount,
        videosInCollections: totalVideosInCollections,
        totalVideos: videoCount + totalVideosInCollections
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Search videos across both models
exports.searchVideos = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'الرجاء إدخال كلمة البحث'
      });
    }
    
    // البحث في النموذج القديم
    const individualVideos = await Video.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { link: { $regex: query, $options: 'i' } }
      ]
    });
    
    // البحث في النموذج الجديد
    const collections = await VideoCollection.find({
      'videos': {
        $elemMatch: {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { link: { $regex: query, $options: 'i' } }
          ]
        }
      }
    });
    
    // استخراج الفيديوهات المطابقة من المجموعات
    const collectionVideos = [];
    collections.forEach(collection => {
      collection.videos.forEach(video => {
        if (
          video.name.toLowerCase().includes(query.toLowerCase()) ||
          video.link.toLowerCase().includes(query.toLowerCase())
        ) {
          collectionVideos.push({
            ...video.toObject(),
            collectionId: collection._id
          });
        }
      });
    });
    
    res.status(200).json({
      success: true,
      data: {
        individualVideos,
        collectionVideos,
        totalResults: individualVideos.length + collectionVideos.length
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};