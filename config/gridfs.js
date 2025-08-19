import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

let gridFSBucket;

export const initGridFS = () => {
  const conn = mongoose.connection;
  gridFSBucket = new GridFSBucket(conn.db, {
    bucketName: 'media'
  });
};

export const getGridFS = () => {
  if (!gridFSBucket) {
    throw new Error('GridFS not initialized');
  }
  return gridFSBucket;
};

export const streamMedia = (req, res, fileId) => {
  const bucket = getGridFS();
  
  // Handle range requests for video streaming
  const range = req.headers.range;
  
  bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray((err, files) => {
    if (err || !files || files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = files[0];
    const fileSize = file.length;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': file.contentType
      });

      const downloadStream = bucket.openDownloadStream(file._id, { start, end });
      downloadStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': file.contentType
      });

      const downloadStream = bucket.openDownloadStream(file._id);
      downloadStream.pipe(res);
    }
  });
};
