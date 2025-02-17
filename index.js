import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import settingRoutes from "./routes/setting.routes.js";
import noteRoutes from "./routes/note.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import passport from "passport";
import session from "express-session";
import "./cron/notificationCron.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: `${import.meta.env.FRONTEND_URL}`,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true,
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  })
);

// Handle Preflight Requests
app.options("*", (req, res) => {
  const allowedOrigins = [`${import.meta.env.FRONTEND_URL}`];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(204);
});

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
app.use(express.json());

app.use((req, res, next) => {
  console.log("Incoming Request:", req.method, req.url);
  console.log("Origin:", req.headers.origin);
  console.log("Cookies:", req.cookies);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/setting", settingRoutes);
app.use("/api/note", noteRoutes);
app.use("/api/subscription", subscriptionRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
