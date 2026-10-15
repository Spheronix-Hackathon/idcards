import { Request, Response, NextFunction } from 'express';

interface QueuedItem {
  resolve: () => void;
  reject: (err: Error) => void;
  timeoutId: NodeJS.Timeout;
  enqueuedAt: number;
}

export class ConcurrencyQueue {
  private activeCount: number = 0;
  private readonly maxConcurrent: number;
  private readonly queueTimeoutMs: number;
  private readonly queue: QueuedItem[] = [];

  constructor(maxConcurrent: number = 10, queueTimeoutMs: number = 120000) {
    this.maxConcurrent = maxConcurrent;
    this.queueTimeoutMs = queueTimeoutMs;
  }

  public acquire(): Promise<{ position: number; waitedMs: number }> {
    const enqueuedAt = Date.now();

    if (this.activeCount < this.maxConcurrent) {
      this.activeCount++;
      return Promise.resolve({ position: 0, waitedMs: 0 });
    }

    return new Promise((resolve, reject) => {
      const position = this.queue.length + 1;

      const timeoutId = setTimeout(() => {
        const index = this.queue.findIndex((item) => item.timeoutId === timeoutId);
        if (index !== -1) {
          this.queue.splice(index, 1);
          reject(
            new Error(
              'Server queue timeout: High registration traffic. Please try submitting again in a moment.'
            )
          );
        }
      }, this.queueTimeoutMs);

      this.queue.push({
        resolve: () => {
          clearTimeout(timeoutId);
          this.activeCount++;
          resolve({ position, waitedMs: Date.now() - enqueuedAt });
        },
        reject: (err: Error) => {
          clearTimeout(timeoutId);
          reject(err);
        },
        timeoutId,
        enqueuedAt
      });
    });
  }

  public release(): void {
    if (this.activeCount > 0) {
      this.activeCount--;
    }

    if (this.queue.length > 0 && this.activeCount < this.maxConcurrent) {
      const nextItem = this.queue.shift();
      if (nextItem) {
        nextItem.resolve();
      }
    }
  }

  public getStats() {
    return {
      active: this.activeCount,
      waiting: this.queue.length,
      maxConcurrent: this.maxConcurrent
    };
  }
}

// Configurable concurrency limit (Default: 10 parallel students)
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_STUDENTS || '10', 10);
export const studentProcessingQueue = new ConcurrencyQueue(MAX_CONCURRENT);

/**
 * Express middleware that limits concurrent student processing to avoid server crashes.
 * When > 10 requests hit at once, the remaining wait in a FIFO queue until a slot frees up.
 */
export const limitStudentConcurrency = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let released = false;

  const releaseSlot = () => {
    if (!released) {
      released = true;
      studentProcessingQueue.release();
    }
  };

  try {
    const statsBefore = studentProcessingQueue.getStats();
    const { position, waitedMs } = await studentProcessingQueue.acquire();

    // Attach queue metrics to response headers
    res.setHeader('X-Concurrency-Active', studentProcessingQueue.getStats().active.toString());
    res.setHeader('X-Concurrency-Waiting', studentProcessingQueue.getStats().waiting.toString());

    if (position > 0) {
      console.log(
        `[ConcurrencyQueue] Dispatched queued request after waiting ${waitedMs}ms (Queue remaining: ${studentProcessingQueue.getStats().waiting})`
      );
    }

    // Ensure slot is freed when request finishes or client disconnects
    res.on('finish', releaseSlot);
    res.on('close', releaseSlot);

    next();
  } catch (error: any) {
    releaseSlot();
    res.status(503).json({
      success: false,
      message: error.message || 'Server is under heavy load. Please try again in a few moments.'
    });
  }
};
