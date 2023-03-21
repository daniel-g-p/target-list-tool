import jwt from "../utilities/jsonwebtoken.js";

const isLoggedIn = (req, res, next) => {
  const token = req.cookies.auth || "";
  const jwtData = jwt.verify(token);
  const isAuthenticated = jwtData && jwtData.exp * 1000 > Date.now();
  if (isAuthenticated) {
    next();
  } else {
    res.clearCookie("auth");
    const error = new Error(401);
    next(error);
  }
};

const isLoggedOut = (req, res, next) => {
  const isAuthenticated = req.cookies.auth ? true : false;
  if (isAuthenticated) {
    const error = new Error(403);
    next(error);
  } else {
    next();
  }
};

export default { isLoggedIn, isLoggedOut };
