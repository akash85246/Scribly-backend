import jwt from "jsonwebtoken";

const verifyUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  console.log("token",token);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token expired, please login again" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default verifyUser;