import { NextFunction, Request, RequestHandler, Response } from "express";

// Forward every error to the global error handler so the real status code
// (401, 403, 404, 409...) reaches the client instead of a blanket 500.
export const catchAsync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
