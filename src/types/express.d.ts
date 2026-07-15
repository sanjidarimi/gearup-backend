import { UserRole, UserStatus } from "../../generated/prisma/enums";

export declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
        status?: UserStatus;
      };
    }
  }
}
