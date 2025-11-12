# CodeQuest - Gamified Coding Practice Platform

A complete web application for practicing coding through various mini-games with XP system, leaderboards, and user profiles.

## Tech Stack

- **Backend**: Node.js + Express.js (REST API)
- **Database**: MySQL
- **Frontend**: Plain HTML, CSS, Vanilla JavaScript
- **Authentication**: bcrypt + sessions

## Project Structure

```
codequest/
├── server.js                 # Main server file
├── db.js                     # Database connection
├── package.json              # Dependencies
├── routes/
│   ├── auth.js              # Authentication API routes
│   ├── challenges.js        # Challenge API routes
│   ├── leaderboard.js       # Leaderboard API routes
│   └── profile.js           # Profile API routes
├── public/
│   ├── index.html           # Homepage
│   ├── login.html           # Login page
│   ├── register.html        # Registration page
│   ├── challenges.html      # Challenges list
│   ├── challenge.html       # Individual challenge
│   ├── leaderboard.html     # Leaderboard
│   ├── profile.html         # User profile
│   ├── app.js               # Main app JavaScript
│   ├── auth.js              # Authentication JavaScript
│   ├── challenges.js        # Challenges list JavaScript
│   ├── challenge.js         # Challenge view JavaScript
│   ├── leaderboard.js       # Leaderboard JavaScript
│   ├── profile.js           # Profile JavaScript
│   └── styles.css           # Stylesheet
└── sql/
    └── schema.sql           # Database schema + sample data
```

## Installation & Setup

### Prerequisites

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **MySQL** (v7 or higher) - [Download here](https://dev.mysql.com/downloads/mysql/)

### Step 1: Create Project Directory

mkdir codequest
cd codequest
```

### Step 2: Create Folder Structure


mkdir routes public sql
```

### Step 3: Install Dependencies

Save the `package.json` file in your project root, then run:

npm install


### Step 4: Setup MySQL Database

1. Start MySQL server
2. Open MySQL command line or MySQL Workbench
3. Run the `schema.sql` file to create database, tables, and sample data:

mysql -u root -p < sql/schema.sql


Or manually copy and execute the SQL commands from schema.sql

### Step 5: Configure Database Connection

Edit `db.js` and update MySQL credentials:

password: 'your_mysql_password', // Change this!


### Step 6: Create All Files

Copy all the provided code into their respective files according to the project structure above.

### Step 7: Run the Application

npm start


Or for development with auto-restart:
npm run dev


### Step 8: Access the Application

Open your browser and go to:
```
http://localhost:3000
```

## Features

###  User Authentication
- Registration with username, email, and password
- Secure login with bcrypt password hashing
- Google OAuth 2.0 authentication
- Session-based authentication

###  Mini Games
Four interactive browser-based games:

** Code Sprint** (60s)
- 10 MCQ coding questions
- 10 points per correct answer
- Tests JavaScript syntax and output prediction

** Debug Dash** (90s) - **Interactive Code Editor!**
- 5 debugging challenges with CodeMirror editor
- Write and run real JavaScript code
- VM2 sandbox for secure execution
- 15-20 points per successful fix
- Auto-progresses to next challenge

** Logic Grid** (120s)
- 6 algorithm and logic puzzles
- Difficulty multipliers (Easy 1x, Medium 1.5x, Hard 2x)
- Base 20 points × multiplier

**Logic Circuit** (120s)
- 7 logic gate puzzles with drag-and-drop
- Build circuits using AND, OR, NOT, XOR gates
- Match target truth tables
- 20-30 points per puzzle

### Global Leaderboard
- Rankings based purely on game scores
- Shows total points earned across all games
- Top 50 players displayed
- Real-time updates

### User Profile
- Personal game statistics
- Total score and level progression
- Games played count
- Recent activity log
- Progress tracking

### Modern UI/UX
- Beautiful gradient designs
- Smooth animations and transitions
- Countdown timers for games
- Confetti celebrations
- Win screens
- Responsive design for all devices

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/check` - Check authentication status

### Challenges
- `GET /api/challenges` - List all challenges (requires auth)
- `GET /api/challenges/:id` - View specific challenge (requires auth)
- `POST /api/challenges/:id/submit` - Submit answer (requires auth)
- `POST /api/challenges/admin/add` - Add new challenge (admin)

### Leaderboard
- `GET /api/leaderboard` - View leaderboard data

### Profile
- `GET /api/profile` - View user profile (requires auth)

### Pages
- `GET /` - Homepage
- `GET /login` - Login page
- `GET /register` - Registration page
- `GET /challenges` - Challenges page
- `GET /challenge?id=:id` - Individual challenge page
- `GET /leaderboard` - Leaderboard page
- `GET /profile` - Profile page

## Usage

### As a User

1. **Register**: Create a new account
2. **Login**: Sign in with credentials
3. **Browse Challenges**: View all available coding challenges
4. **Attempt Challenge**: Select an answer and submit
5. **Earn XP**: Get rewarded for correct answers
6. **Level Up**: Progress through levels
7. **Check Leaderboard**: See your rank
8. **View Profile**: Track your progress


## Troubleshooting

### MySQL Connection Error
- Check if MySQL server is running
- Verify credentials in `db.js`
- Ensure database exists: `SHOW DATABASES;`

### Port Already in Use
Change port in `server.js`:
```javascript
const PORT = 3001; // Change from 3000
```

### Session Not Persisting
- Clear browser cookies
- Check session secret in `server.js`

## Future Enhancements

- Add categories/tags to challenges
- Implement timed challenges
- Add achievements/badges system
- Email verification
- Password reset functionality
- Dark mode theme
- Export progress reports
- Social features (follow users, comments)

## Project Statistics

- **Total Lines**: ~1,425
- **Backend**: ~450 lines (JavaScript)
- **Frontend**: ~550 lines (HTML)
- **CSS**: ~225 lines
- **SQL**: ~200 lines

## License

This is a final year project. Free to use and modify.

## Support

For issues or questions, refer to the documentation or check:
- Express.js docs: https://expressjs.com/
- MySQL docs: https://dev.mysql.com/doc/

---

**Happy Coding! **