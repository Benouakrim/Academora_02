import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import cloudinary from '../lib/cloudinary';
import { AppError } from '../utils/AppError';
import { Readable } from 'stream';

const storage = multer.memoryStorage();
export const uploadMiddleware = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('image');

export const uploadImage = async (
  req: Request & { file?: Express.Multer.File },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) throw new AppError(400, 'No image file provided');
    const streamUpload = (buffer: Buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'academora_mvp' },
          (error: Error | undefined, result: any) => (result ? resolve(result) : reject(error))
        );
        const readable = new Readable();
        readable._read = () => {};
        readable.push(buffer);
        readable.push(null);
        readable.pipe(stream);
      });
    };
    const result: any = await streamUpload(req.file.buffer);
    res.status(200).json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    next(err);
  }
};
