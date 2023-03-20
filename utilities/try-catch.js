export const tryCatch = (asyncControllerFunction) => {
  return (req, res, next) => {
    return asyncControllerFunction(req, res, next).catch(next);
  };
};
