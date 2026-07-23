import passport from "../config/passport.js";

export const protect = passport.authenticate("access-token", {
  session: false,
});

export default passport;
