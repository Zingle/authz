Zingle **authz** authentication library.  This core library provides Express.js
middleware and helpers for building an authentication server relying on standard
Zingle protocols.

authz Library API
=================

class AuthZ
-----------
The **AuthZ** class maintains the application-level settings for authentication,
and can be used to generate middleware primitives that can be used to build an
authentication service.

```js
import {AuthZ} from "@zingle/authz";
```

### new AuthZ({secret, passport=new Passport()})
Create an **AuthZ** instance with required application secret and an optional
Passport.js instance.  This instance can be used to generate middleware used to
build an authentication service.

### AuthZ#authenticate(strategy)
Create request authentication middleware using the Passport.js strategy which
was registered with the provided strategy name.

The middleware will generate a 403 Forbidden response if the strategy does not
result in a logged in user.  Otherwise, it will continue to the next middleware.

### AuthZ#oauth(strategy, scope, data=()=>{})
Create OAuth permission request middleware using the Passport.js strategy which
was registered with the provided strategy name.  Scopes must be an array of
requested scopes.  Additional data can be passed through the OAuth provider to
be returned by the OAuth provider after successful authentication.  This data
can be static string data or a function which generates the data from the
Express.js Request object.

The middleware will send the client to the OAuth provider's site to complete
the authentication process.  The OAuth provider and the strategy determine where
the client is redirected upon success.

### AuthZ#requestState()
Create function to extract the AuthZ state from a client request.  This function
can be passed as the third argument to **AuthZ#oauth()** to pass along the
AuthZ state with the OAuth permission request.

### AuthZ#sign(iss)
Create JWT signing middleware for the provided issuer.  The middleware expects
some other middleware earlier in the chain to have logged in the user.

The middleware supports HTML, plain text, and JSON responses, selected by the
Accept header.  For HTML responses, the "token" template will be rendered with
the JWT passed in the "jwt" variable.  The application must provide this
template.

### AuthZ#userInfo()
Create user info middleware to send logged in user's info to the client.  The
middleware expects some other middleware earlier in the chain to have logged in
the user.

The middleware sends the user info to the client as JSON.
