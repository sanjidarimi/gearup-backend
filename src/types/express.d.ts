import { UserRole, UserStatus } from "../../generated/prisma/enums";

declare global {
  namespace Express {
    interface IRequest {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        status: UserStatus;
      };
    }
  }
}
