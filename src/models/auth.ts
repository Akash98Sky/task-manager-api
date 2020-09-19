import { Request } from "express";
import { UserSchema } from "./user";

export default interface AuthRequest extends Request {
	user?: UserSchema;
	token?: string;
}