import url from "url";
import querystring from "querystring";
import passport from "passport";
import jwt from "jsonwebtoken";

const {Passport} = passport;

/**
 * Zingle authentication middleware factory.
 */
export class AuthZ {
  constructor({secret, passport=new Passport()}) {
    this.secret = secret;
    this.passport = passport;
  }

  /**
   * Create middleware to authenticate request.
   * @param {string} strategy         Passport.js strategy
   * @returns {function}
   */
  authenticate(strategy) {
    const {passport} = this;

    return function authenticate(req, res, next) {
      const auth = passport.authenticate(strategy, (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(403).send("Forbidden\n");

        req.logIn(user, err => {
          if (err) return next(err);
          return next();
        });
      });

      auth(req, res, next);
    }
  }

  /**
   * Create middleware to make an OAuth permission request.
   * @param {string} strategy         Passport.js strategy
   * @param {string[]} scope          OAuth scopes to request
   * @param {string|function} [data]  Extra data or function to get data
   * @returns {function}
   */
  oauth(strategy, scope, data=()=>{}) {
    const {passport} = this;

    return function oauth(req, res, next) {
      const state = typeof data === "function" ? data(req, res) : data;
      const authenticate = passport.authenticate(strategy, {scope, state});
      authenticate(req, res, next);
    }
  }

  /**
   * Create function to extract state from client request.
   * @returns {function}
   */
  requestState() {
    /**
     * @param {express.Request} req
     * @param {express.Response} res
     * @returns {string|undefined}
     */
    return function(req, res) {
      const {query} = url.parse(req.originalUrl);
      const {flow} = querystring.parse(query);
      return flow;
    }
  }

  /**
   * Create JWT signing middleware.
   * @param {string} iss    JWT issuer
   * @returns {function}
   */
  sign(iss) {
    const {secret} = this;

    return function sign(req, res) {
      const token = jwt.sign({...req.user, iss}, secret);

      res.format({
        html() { res.render("token", {jwt: token}); },
        text() { res.send(token); },
        json() { res.json({token}); },
        default() { res.send(token); }
      });
    };
  }

  /**
   * Create user info middleware.
   * @returns {function}
   */
  userInfo() {
    return function userInfo(req, res) {
      res.json(req.user);
    };
  }
}
