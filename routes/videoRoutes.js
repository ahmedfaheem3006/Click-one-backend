const express = require('express');
const router = express.Router();
const {
  getAllVideoCollections,
  getLastVideoCollection,
  getLastVideo,
  createVideoCollection,
  updateVideoCollection,
  deleteVideoCollection,
  getAllVideosFlattened,
  getAllVideos,
  createVideos,
  deleteAllVideos
} = require('../controllers/videoController');

// Video Collections Routes (النموذج الجديد)
router.route('/collections')
  .get(getAllVideoCollections)
  .post(createVideoCollection);  // هذا ما سيستخدم عند الضغط على submit

router.route('/collections/:id')
  .put(updateVideoCollection)
  .delete(deleteVideoCollection);

// Special Routes
router.get('/last-collection', getLastVideoCollection);
router.get('/last-video', getLastVideo);
router.get('/all-videos', getAllVideosFlattened);

// Old Video Routes (النموذج القديم - إذا احتجته)
router.route('/')
  .get(getAllVideos)
  .post(createVideos)
  .delete(deleteAllVideos);

module.exports = router;