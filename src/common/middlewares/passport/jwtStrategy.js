import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

if (!process.env.JWT_ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET 환경변수가 설정되지 않았습니다.");
}
if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET 환경변수가 설정되지 않았습니다.");
}

function verify(payload, done) {
  if (!payload?.userId) {
    return done(null, false);
  }
  return done(null, { userId: payload.userId });
}

const accessTokenStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_ACCESS_SECRET,
  },
  verify,
);

const refreshTokenStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromExtractors([
      (req) => req.cookies?.refreshToken,
    ]),
    secretOrKey: process.env.JWT_REFRESH_SECRET,
  },
  verify,
);

export default { accessTokenStrategy, refreshTokenStrategy };
