import expect from "expect.js";
import sinon from "sinon";
import passport from "passport";
import {AuthZ} from "../authz.mjs";

const {Passport} = passport;

describe("AuthZ", () => {
  const secret = "sekret";
  const passport = {};
  let authz;

  beforeEach(() => {
    authz = new AuthZ({secret, passport});
  });

  describe("new AuthZ({secret, [passport]})", () => {
    it("should initialize properties", () => {
      expect(authz.secret).to.be(secret);
      expect(authz.passport).to.be(passport);
    });

    it("should intialize new Passport.js instance if not provided", () => {
      authz = new AuthZ({secret});
      expect(authz.passport).to.be.a(Passport);
      expect(authz.passport).to.not.be(passport);
    });
  });

  describe(".authenticate(string)", () => {
    let req, res;
    let authenticate;
    let passport;

    beforeEach(() => {
      passport = {authenticate: sinon.spy(() => sinon.spy((a,b,next) => next()))};
      authz = new AuthZ({secret, passport});
      authenticate = authz.authenticate("foo");
    });

    it("should return middleware", () => {
      expect(authenticate).to.be.a("function");
      expect(authenticate.length).to.be(3);
    });

    it("should call passport.authenticate to authenticate requests", done => {
      const req = {};
      const res = {};

      authenticate(req, res, () => {
        expect(passport.authenticate.calledOnce).to.be(true);
        done();
      });
    });
  });

  describe(".oauth(string, string[])", () => {
    let oauth;
    let passport;

    beforeEach(() => {
      passport = {authenticate: sinon.spy(() => sinon.spy((a,b,next) => next()))};
      authz = new AuthZ({secret, passport});
      oauth = authz.oauth("foo", ["scope"]);
    });

    it("should call passport.authenticate to request permission", done => {
      const req = {};
      const res = {};

      oauth(req, res, () => {
        expect(passport.authenticate.calledOnce).to.be(true);
        done();
      });
    });
  });

  describe(".oauth(string, string[], string)", () => {
    let oauth;
    let passport;

    beforeEach(() => {
      passport = {authenticate: sinon.spy(() => sinon.spy((a,b,next) => next()))};
      authz = new AuthZ({secret, passport});
      oauth = authz.oauth("foo", ["scope"], "data");
    });

    it("should call passport.authenticate to request permission", done => {
      const req = {};
      const res = {};

      oauth(req, res, () => {
        expect(passport.authenticate.calledOnce).to.be(true);
        done();
      });
    });
  });

  describe(".oauth(string, string[], function)", () => {
    let oauth;
    let passport;

    beforeEach(() => {
      passport = {authenticate: sinon.spy(() => sinon.spy((a,b,next) => next()))};
      authz = new AuthZ({secret, passport});
      oauth = authz.oauth("foo", ["scope"], () => "data");
    });

    it("should call passport.authenticate to request permission", done => {
      const req = {};
      const res = {};

      oauth(req, res, () => {
        expect(passport.authenticate.calledOnce).to.be(true);
        done();
      });
    });
  });

  describe(".requestState()", () => {
    it("should make function to extract state from the request URL", () => {
      const req = {originalUrl: "/foo?bar=baz&flow=foo&bizz=bang"};
      const res = {};
      const state = authz.requestState();
      const flow = state(req, {});
      expect(flow).to.be("foo");
    });
  });

  describe(".sign(string)", () => {
    it("should send JWT for authenticated user signed by issuer", () => {
      const iss = "acme";
      const req = {user: {foo: "bar"}};
      const res = {send: sinon.spy(), format(types) {types.text()} };
      const middleware = authz.sign(iss);

      middleware(req, res);

      expect(res.send.calledOnce).to.be(true);
      expect(res.send.args[0][0]).to.be.a("string");
    });
  });

  describe(".userInfo()", () => {
    it("should send user as JSON", () => {
      const req = {user: {name: "foo"}};
      const res = {json: sinon.spy()};
      const middleware = authz.userInfo();

      middleware(req, res);

      expect(res.json.calledOnce).to.be(true);
      expect(JSON.stringify(res.json.args[0][0])).to.be(JSON.stringify(req.user));
    });
  });
});
