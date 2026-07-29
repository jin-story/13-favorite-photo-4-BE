import GoogleStrategy from "passport-google-oauth20";
import userService from "../../modules/user/user.service.js";

const googleStrategyOptions = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
};

async function verify(accessToken, refreshToken, profile, done) {
  try {
    const user = await userService.oauthCreateOrUpdate(
      profile.provider.toUpperCase(),
      profile.id,
      profile.emails[0].value,
      profile.displayName,
    );

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}

const googleStrategy = new GoogleStrategy(googleStrategyOptions, verify);

export default googleStrategy;
