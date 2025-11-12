const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../db');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google profile:', profile.id, profile.emails[0].value);

      // Check if user exists
      const [users] = await db.query(
        'SELECT * FROM users WHERE google_id = ?',
        [profile.id]
      );

      if (users.length > 0) {
        // User exists
        console.log('Existing Google user found');
        return done(null, users[0]);
      }

      // Check if email already exists (user registered normally)
      const email = profile.emails[0].value;
      const [existingEmail] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (existingEmail.length > 0) {
        // Link Google account to existing user
        await db.query(
          'UPDATE users SET google_id = ? WHERE id = ?',
          [profile.id, existingEmail[0].id]
        );
        console.log('Linked Google to existing user');
        return done(null, existingEmail[0]);
      }

      // Create new user
      const username = profile.emails[0].value.split('@')[0] + '_' + Math.floor(Math.random() * 1000);
      const [result] = await db.query(
        'INSERT INTO users (username, email, google_id, password) VALUES (?, ?, ?, ?)',
        [username, email, profile.id, 'GOOGLE_AUTH']
      );

      const newUser = {
        id: result.insertId,
        username: username,
        email: email,
        google_id: profile.id,
        xp: 0
      };

      console.log('New Google user created');
      return done(null, newUser);
    } catch (error) {
      console.error('Google auth error:', error);
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, users[0]);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;