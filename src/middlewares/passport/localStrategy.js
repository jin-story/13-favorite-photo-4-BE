import { Strategy as LocalStrategy } from "passport-local";
import userService from "../../modules/user/user.service.js";

const localStrategyOptions = {
  usernameField: "email",
  passwordField: "encryptedPassword",
};

async function verify(email, encryptedPassword, done) {
  try {
    const user = await userService.getUser(email, encryptedPassword);
    done(null, user);
  } catch (error) {
    done(null, false, { message: error.message });
  }
}

const localStrategy = new LocalStrategy(localStrategyOptions, verify);

export default localStrategy;
