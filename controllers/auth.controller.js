import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import jwt from "jsonwebtoken";
import { addUser, updateLogin, getUser, deleteUser } from "../db/queries.js";

async function signIn(req, res, next) {
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
}

async function userInfo(req, res) {
  try {
    const user = req.user;
    res.json({ user });
  } catch (error) {
    console.error("Error updating login activity:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function signOut(req, res) {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Signout failed" });
    res.status(200).json({ message: "Signout successful" });
  });
}

// Google OAuth Callback → Sends JWT to frontend
async function googleCallback(req, res, next) {
  passport.authenticate("google", async (err, user) => {
    if (err || !user) {
      return res.send(
        `<script>
          window.opener.postMessage({ success: false, message: "Authentication failed" }, "${process.env.FRONTEND_URL}");
          window.close();
        </script>`
      );
    }

    try {
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          username: user.username,
          profile_picture: user.profile_picture,
          sid:user.sid,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      // Send the token securely to frontend
      res.send(
        `<script>
          console.log("Sending JWT to frontend");
          window.opener.postMessage({ success: true, token: "${token}" }, "${process.env.FRONTEND_URL}");
          window.close();
        </script>`
      );
    } catch (error) {
      console.error("JWT Sign Error:", error);
      res.send(`
        <script>
          window.opener.postMessage(
            { success: false, message: "Internal server error" },
            "${process.env.FRONTEND_URL}"
          );
          window.close();
        </script>
      `);
    }
  })(req, res, next);
}

async function loginUpdate(req, res) {
  try {
    const { id } = req.user;
    const login = await updateLogin(id);

    if (login.length > 0) {
      return res.status(200).json({ message: "Login activity saved" });
    } else {
      console.warn(`No update for user ID: ${id}`);
      return res
        .status(200)
        .json({ message: "No changes made to login activity" });
    }
  } catch (error) {
    console.error("Error updating login activity:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function userDelete(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    await deleteUser(email);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const email = profile.emails[0].value;
        const username = profile.displayName;
        const profile_picture = profile.photos[0]?.value;
       
        // Check if user exists
        const result = await getUser(email);
        if (result.length === 0) {
          const newUser = await addUser(
            username,
            profile_picture,
            email,
            "Google"
          );
          return cb(null, newUser[0]);
        } else {
          return cb(null, result[0]);
        }
      } catch (err) {
        console.error("OAuth Error:", err);
        return cb(err);
      }
    }
  )
);

// Serialize & Deserialize User
passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

export { signIn, signOut, googleCallback, userDelete, loginUpdate, userInfo };
