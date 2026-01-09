import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET_KEY || "r89JihsTalkMWfv9gSZ5nGqmHEs3NEVOLYBQ5BLwT8v",
        })
    }

    async validate(payload: any) {
        return { userId: payload.sub, email: payload.email, role: payload.role};
    }
}