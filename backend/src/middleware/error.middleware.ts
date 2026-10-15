import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[Unhandled Server Error]:', err);

  // Handle Multer specific errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({
      success: false,
      message: 'Photo file size exceeds the 5 MB limit. Please upload a smaller image.'
    });
    return;
  }

  // Handle MongoDB Duplicate Key (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    if (field === 'email') {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
      return;
    }
    if (field === 'mobile') {
      res.status(409).json({
        success: false,
        message: 'An account with this mobile number already exists.'
      });
      return;
    }
    if (field === 'studentId') {
      res.status(409).json({
        success: false,
        message: 'A student with this ID already exists. Please try again.'
      });
      return;
    }
    res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`
    });
    return;
  }

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const userMessage = err.isOperational || statusCode < 500
    ? err.message
    : 'An unexpected internal error occurred. Please try again later.';

  res.status(statusCode).json({
    success: false,
    message: userMessage
  });
};
