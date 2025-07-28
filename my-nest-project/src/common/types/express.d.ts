// types/express.d.ts (создай файл, если его нет)
import { User } from '../users/schemas/user.schema'; // путь к User-схеме

declare module 'express' {
  interface Request {
    user?: User & { _id: string };
  }
}
