export function requireIdentity(req, res, next) {
  const username = req.signedCookies.username;
  console.log("MW called", username)

  if (!username) {
    return res.sendStatus(401);
  }

  req.username = username;
  next();
}
