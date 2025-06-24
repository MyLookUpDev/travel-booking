// server/types/express/index.d.ts
import { JwtUserPayload } from '../../middleware/auth'; // Update path if needed
import "express";

// You can be more specific with the type here!
declare module "express-serve-static-core" {
  interface Request {
    user?: {
      userId: string;
      role: string;
      // Add more fields if needed
    };
  }
}
declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}
