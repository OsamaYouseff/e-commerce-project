const jwt = require("jsonwebtoken");

const parseToken = (req) => {
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0].toLowerCase() === "bearer" && parts[1]) {
      return { ok: true, token: parts[1] };
    }
    return { ok: false };
  }

  const legacyHeader = req.headers.token;
  if (legacyHeader) {
    const parts = legacyHeader.split(" ");
    if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
      return { ok: true, token: parts[1] };
    }
    return { ok: true, token: legacyHeader };
  }

  return { ok: false, missing: true };
};

const verifyToken = (req, res, next) => {
  const parsed = parseToken(req);
  if (!parsed.ok) {
    return res.status(401).json({ message: "You are not authenticated!" });
  }

  jwt.verify(parsed.token, process.env.JWT_SEC, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token is not valid!" });
    }
    req.user = { id: user.id, isAdmin: user.isAdmin === true };
    next();
  });
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "You are not allowed to do that!" });
    }
  });
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "You are not allowed to do that!" });
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
};