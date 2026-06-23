const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Customer = require('../models/Customer');

function setupPassport() {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientID || !clientSecret || clientID.includes('CHANGE_ME')) {
    console.warn('[passport] Google OAuth desactivado — GOOGLE_CLIENT_ID/SECRET em falta no .env');
    return;
  }
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/account/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const firstName = profile.name?.givenName || '';
          const lastName = profile.name?.familyName || '';
          const avatarUrl = profile.photos?.[0]?.value || null;

          const customer = await Customer.findOrCreateByGoogle({
            googleId: profile.id,
            email,
            firstName,
            lastName,
            avatarUrl,
          });

          return done(null, customer);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Minimal serialize/deserialize — we use express-session directly
  passport.serializeUser((customer, done) => done(null, customer.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const customer = await Customer.findById(id);
      done(null, customer || false);
    } catch (err) {
      done(err);
    }
  });
}

module.exports = { passport, setupPassport };
