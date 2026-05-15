// const express = require('express');
// const router  = express.Router();
// const path    = require('path');
// const { postImageUpload, teacherFileUpload, getFileType } = require('../config/upload');
// const { auth } = require('../middleware/auth');

// // POST /api/upload/post-image — student attaches image to post
// router.post('/post-image', auth, (req, res) => {
//   postImageUpload.single('image')(req, res, (err) => {
//     if (err) return res.status(400).json({ error: err.message });
//     if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
//     const url = `/uploads/images/${req.file.filename}`;
//     res.json({ url, filename: req.file.originalname });
//   });
// });

// // POST /api/upload/teacher-file — teacher shares file in subject channel
// router.post('/teacher-file', auth, (req, res) => {
//   if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
//     return res.status(403).json({ error: 'Teachers only' });
//   }
//   teacherFileUpload.single('file')(req, res, (err) => {
//     if (err) return res.status(400).json({ error: err.message });
//     if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
//     const isImage = req.file.mimetype.startsWith('image/');
//     const subfolder = isImage ? 'images' : 'files';
//     const url      = `/uploads/${subfolder}/${req.file.filename}`;
//     const fileType = getFileType(req.file.mimetype);
//     res.json({ url, filename: req.file.originalname, fileType });
//   });
// });

// module.exports = router;

const express  = require('express');
const router   = express.Router();
const { postImageUpload, teacherFileUpload, getFileType } = require('../config/upload');
const { auth } = require('../middleware/auth');

// POST /api/upload/post-image
// Students attach one image to a General/Feedback/Complaints post.
// Returns the Cloudinary secure_url as `url`.
router.post('/post-image', auth, (req, res) => {
  postImageUpload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    res.json({
      url:      req.file.path,           // Cloudinary secure HTTPS URL
      filename: req.file.originalname,
      fileType: 'image',
    });
  });
});

// POST /api/upload/teacher-file
// Teachers share files (PDF, Word, PPT, images) in subject channels.
// Returns the Cloudinary secure_url as `url`.
router.post('/teacher-file', auth, (req, res) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Teachers only' });
  }

  teacherFileUpload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileType = getFileType(req.file.mimetype);
    // const uploadedFiles = req.file.map((file) => ({
    //     url: file.path,
    //     filename: file.originalname,
    //     // fileType: getFileType(file.mimetype),
    //   fileType,
    //     // public_id: file.filename,
    // }));
    // res.json(uploadedFiles);
    
    res.json({
      url:      req.file.path,           // Cloudinary secure HTTPS URL
      filename: req.file.originalname,
      fileType,
    });
  });
});

module.exports = router;
