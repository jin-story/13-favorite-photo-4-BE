import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_ACCESS_SECRET,
};

passport.use(
  new JwtStrategy(options, (payload, done) => {
    if (!payload?.userId) {
      return done(null, false);
    }
    return done(null, { userId: payload.userId });
  }),
);

export const protect = passport.authenticate("jwt", { session: false });

export default passport;
