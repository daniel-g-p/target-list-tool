export const tryCatch = (asyncControllerFunction) => {
  return (req, res, next) => {
    asyncControllerFunction(req, res, next).catch(next);
  };
};
