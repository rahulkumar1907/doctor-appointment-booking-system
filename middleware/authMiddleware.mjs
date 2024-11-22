import jwt from "jsonwebtoken";

const authentication = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "access token is required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // check if token expire
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ status: false, message: "token has expired" });
      }
      return res.status(403).json({ status: false, message: "invalid token" });
    }

    // token is valid, proceed further
    req.body.userId = decoded.userId;
    next();
  });
};

export default { authentication };
