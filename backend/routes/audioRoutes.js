const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getAudioClips,
  getAudioClip,
  createAudioFromPost,
  createAudioFromThread,
  createAudioFromText,
  updateAudioClip,
  deleteAudioClip,
  incrementPlayCount,
  incrementDownloadCount,
} = require('../controllers/audioController');

const router = express.Router();

// Protect all routes
router.use(protect);

// Audio clip routes
router.route('/clips')
  .get(getAudioClips);

router.route('/clips/from-post')
  .post(createAudioFromPost);

router.route('/clips/from-thread')
  .post(createAudioFromThread);

router.route('/clips/from-text')
  .post(createAudioFromText);

router.route('/clips/:id')
  .get(getAudioClip)
  .put(updateAudioClip)
  .delete(deleteAudioClip);

router.route('/clips/:id/play')
  .put(incrementPlayCount);

router.route('/clips/:id/download')
  .put(incrementDownloadCount);

module.exports = router;
