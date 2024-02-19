const jwt = require("jsonwebtoken");
const User = require("../Modal/userModal");

const protect = async (req, res, next) => {
  // console.log(req)
  let token;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      
      //decodes token id
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log(req.user)
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token"); 
  }
};

module.exports = { protect };