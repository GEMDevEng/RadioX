const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
  getPodcasts,
  getPodcast,
  createPodcast,
  updatePodcast,
  deletePodcast,
  addEpisode,
  removeEpisode,
  reorderEpisodes,
  getRssFeed,
} = require('../controllers/podcastController');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Public routes
router.get('/:id/rss', getRssFeed);

// Protected routes
router.use(protect);

// Podcast routes
router.route('/')
  .get(getPodcasts)
  .post(upload.single('image'), createPodcast);

router.route('/:id')
  .get(getPodcast)
  .put(upload.single('image'), updatePodcast)
  .delete(deletePodcast);

// Episode routes
router.route('/:id/episodes')
  .post(addEpisode);

router.route('/:id/episodes/:episodeId')
  .delete(removeEpisode);

router.route('/:id/episodes/reorder')
  .put(reorderEpisodes);

module.exports = router;
