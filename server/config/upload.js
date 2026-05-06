// const multer = require('multer');
// const path   = require('path');
// const fs     = require('fs');

// const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
// if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, UPLOAD_DIR),
//   destination: (req, file, cb) => {
//     const sub = file.mimetype.startsWith('image/') ? 'images' : 'files';
//     const dir  = path.join(UPLOAD_DIR, sub);
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => {
//     const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
//     cb(null, `${unique}${path.extname(file.originalname)}`);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowed = [
//     'image/jpeg', 'image/png', 'image/gif', 'image/webp',
//     'application/pdf',
//     'application/msword',
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//     'application/vnd.ms-powerpoint',
//     'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//     'text/plain',
//   ];
//   if (allowed.includes(file.mimetype)) cb(null, true);
//   else cb(new Error('File type not allowed'), false);
// };

// // For post images (students): 5 MB, images only
// const postImageUpload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) cb(null, true);
//     else cb(new Error('Only images allowed for posts'), false);
//   },
//   limits: { fileSize: 5 * 1024 * 1024 },
// });

// // For teacher file share: 20 MB, any allowed type
// const teacherFileUpload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 20 * 1024 * 1024 },
// });

// const getFileType = (mimetype) => {
//   if (mimetype.startsWith('image/')) return 'image';
//   if (mimetype === 'application/pdf')  return 'pdf';
//   if (mimetype.includes('word'))       return 'doc';
//   if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return 'ppt';
//   return 'other';
// };

// module.exports = { postImageUpload, teacherFileUpload, getFileType };

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// ── Configure Cloudinary ──────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Allowed MIME types for teacher file shares ────────────────────────────
const ALLOWED_TEACHER_FORMATS = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
];

// ── Cloudinary storage for post images (students) ─────────────────────────
// Stored at: voxcampus/posts/<public_id>
const postImageStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder:         'voxcampus/posts',
    resource_type:  'image',
    allowed_formats:['jpg','jpeg','png','gif','webp'],
    transformation: [{ width:1200, crop:'limit', quality:'auto', fetch_format:'auto' }],
    public_id:      `post_${Date.now()}_${Math.round(Math.random()*1e6)}`,
  }),
});

// ── Cloudinary storage for teacher files ──────────────────────────────────
// Images → voxcampus/files/images, everything else → voxcampus/files/docs
const teacherFileStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isImage = file.mimetype.startsWith('image/');
    return {
      folder:        isImage ? 'voxcampus/files/images' : 'voxcampus/files/docs',
      resource_type: isImage ? 'image' : 'raw',
      public_id:     `file_${Date.now()}_${Math.round(Math.random()*1e6)}`,
      // For images apply auto-optimisation; for raw files keep as-is
      ...(isImage ? { transformation:[{ quality:'auto', fetch_format:'auto' }] } : {}),
    };
  },
});

// ── Multer instances ──────────────────────────────────────────────────────
const postImageUpload = multer({
  storage: postImageStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed for posts'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const teacherFileUpload = multer({
  storage: teacherFileStorage,
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TEACHER_FORMATS.includes(file.mimetype)) cb(null, true);
    else cb(new Error('File type not allowed'), false);
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// ── Helper: classify file type for frontend rendering ─────────────────────
const getFileType = (mimetype) => {
  if (mimetype.startsWith('image/'))  return 'image';
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.includes('word'))      return 'doc';
  if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return 'ppt';
  return 'other';
};

module.exports = { cloudinary, postImageUpload, teacherFileUpload, getFileType };
