const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  destination: (req, file, cb) => {
    const sub = file.mimetype.startsWith('image/') ? 'images' : 'files';
    const dir  = path.join(UPLOAD_DIR, sub);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('File type not allowed'), false);
};

// For post images (students): 5 MB, images only
const postImageUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed for posts'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// For teacher file share: 20 MB, any allowed type
const teacherFileUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

const getFileType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype === 'application/pdf')  return 'pdf';
  if (mimetype.includes('word'))       return 'doc';
  if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return 'ppt';
  return 'other';
};

module.exports = { postImageUpload, teacherFileUpload, getFileType };