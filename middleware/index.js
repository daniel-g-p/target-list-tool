const isLoggedIn = (req, res, next) => {
  const isAuthenticated = req.signedCookies.auth ? true : false;
  if (isAuthenticated) {
    next();
  } else {
    res.clearCookie("auth");
    const error = new Error(401);
    next(error);
  }
};

const isLoggedOut = (req, res, next) => {
  const isAuthenticated = req.signedCookies.auth ? true : false;
  if (isAuthenticated) {
    const error = new Error(403);
    next(error);
  } else {
    next();
  }
};

export default { isLoggedIn, isLoggedOut };
