import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js"
import settingRoutes from "./routes/setting.routes.js"
import passport from "passport";
import session from "express-session";


dotenv.config();
const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);


app.use(passport.initialize());
app.use(passport.session());


app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/setting",settingRoutes);

const PORT = 5001;


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});