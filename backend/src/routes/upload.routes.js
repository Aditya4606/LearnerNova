import express from 'express';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    
    // Construct the public URL for the image
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
