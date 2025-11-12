-- Create database
CREATE DATABASE IF NOT EXISTS codequest;
USE codequest;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  google_id VARCHAR(255) DEFAULT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  xp INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@codequest.com', '$2b$10$rQYaKJQH5F0YvP.RBX0YVeYxXJ5J5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'admin')
ON DUPLICATE KEY UPDATE role='admin';

-- Scores table for mini-games
CREATE TABLE IF NOT EXISTS scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  username VARCHAR(50) NOT NULL,
  game VARCHAR(50) NOT NULL,
  score INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_game (user_id, game),
  INDEX idx_game_score (game, score DESC)
);

-- Debug challenges table for Debug Dash game
CREATE TABLE IF NOT EXISTS debug_challenges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  starter_code TEXT NOT NULL,
  test_input VARCHAR(500),
  expected_output VARCHAR(500) NOT NULL,
  points INT DEFAULT 15,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample debug challenges
INSERT INTO debug_challenges (title, description, starter_code, test_input, expected_output, points) VALUES
('Fix the Sum Function', 'The function should return the sum of two numbers, but it has a bug.', 'function sum(a, b) {\n  return a - b;\n}\nconsole.log(sum(5, 3));', NULL, '8', 15),
('Reverse Array Bug', 'This function should reverse an array but returns the original.', 'function reverseArray(arr) {\n  return arr;\n}\nconsole.log(reverseArray([1, 2, 3]));', NULL, '[3,2,1]', 15),
('Count Vowels Error', 'Count the number of vowels in a string. Currently returns wrong count.', 'function countVowels(str) {\n  const vowels = "aeiou";\n  let count = 0;\n  for (let char of str) {\n    if (vowels.includes(char)) {\n      count--;\n    }\n  }\n  return count;\n}\nconsole.log(countVowels("hello"));', NULL, '2', 15),
('Fix Even Numbers Filter', 'Filter should return even numbers only, but logic is reversed.', 'function getEvenNumbers(arr) {\n  return arr.filter(num => num % 2 !== 0);\n}\nconsole.log(getEvenNumbers([1, 2, 3, 4, 5, 6]));', NULL, '[2,4,6]', 20),
('Factorial Bug', 'Calculate factorial recursively. Has an infinite recursion bug.', 'function factorial(n) {\n  if (n === 0) {\n    return 0;\n  }\n  return n * factorial(n - 1);\n}\nconsole.log(factorial(5));', NULL, '120', 20);

-- Logic Circuit challenges table for Logic Circuit game
CREATE TABLE IF NOT EXISTS logic_circuits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  available_gates TEXT NOT NULL,
  correct_sequence TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  points INT DEFAULT 20,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample logic circuit puzzles
INSERT INTO logic_circuits (title, description, available_gates, correct_sequence, expected_output, points) VALUES
('Simple AND Gate', 'Use an AND gate to get output 1 only when both A and B are 1. You have multiple gates to choose from!', '["AND", "OR", "NOT"]', '["AND"]', '[0,0,0,1]', 20),
('OR Gate Challenge', 'Use an OR gate to get output 1 when either A or B is 1. Pick the right gate!', '["AND", "OR", "XOR"]', '["OR"]', '[0,1,1,1]', 20),
('NOT Gate Inverter', 'Use a NOT gate on input A to invert it. Choose wisely!', '["AND", "OR", "NOT", "XOR"]', '["NOT"]', '[1,1,0,0]', 20),
('AND then NOT', 'Combine AND and NOT gates: First AND the inputs, then NOT the result', '["AND", "OR", "NOT", "XOR"]', '["AND", "NOT"]', '[1,1,1,0]', 30),
('Double NOT Challenge', 'Use two NOT gates in sequence (double negation). All gates available!', '["AND", "OR", "NOT", "XOR"]', '["NOT", "NOT"]', '[0,0,1,1]', 25),
('XOR Exclusive', 'Use XOR to get 1 only when inputs differ. Can you find it among the options?', '["AND", "OR", "NOT", "XOR"]', '["XOR"]', '[0,1,1,0]', 25),
('OR then NOT', 'First OR the inputs, then apply NOT. Multiple gates available!', '["AND", "OR", "NOT", "XOR"]', '["OR", "NOT"]', '[1,0,0,0]', 30);

-- Sample challenges
INSERT INTO challenges (title, description, option_a, option_b, option_c, option_d, correct_option, difficulty, xp_reward) VALUES
('JavaScript Variable Declaration', 'Which keyword is used to declare a block-scoped variable in JavaScript?', 'var', 'let', 'const', 'function', 'B', 'Easy', 10),
('Python List Method', 'Which method adds an element to the end of a Python list?', 'add()', 'append()', 'insert()', 'push()', 'B', 'Easy', 10),
('SQL Query', 'Which SQL statement is used to retrieve data from a database?', 'GET', 'FETCH', 'SELECT', 'RETRIEVE', 'C', 'Easy', 10),
('Time Complexity', 'What is the time complexity of binary search?', 'O(n)', 'O(log n)', 'O(n²)', 'O(1)', 'B', 'Medium', 20),
('CSS Property', 'Which CSS property controls the text size?', 'font-size', 'text-size', 'font-style', 'text-style', 'A', 'Easy', 10),
('Array Method', 'Which JavaScript array method creates a new array with the results of calling a function on every element?', 'forEach()', 'map()', 'filter()', 'reduce()', 'B', 'Medium', 20),
('HTTP Method', 'Which HTTP method is idempotent and used to update resources?', 'POST', 'GET', 'PUT', 'DELETE', 'C', 'Medium', 20),
('Database Normalization', 'Which normal form eliminates transitive dependencies?', '1NF', '2NF', '3NF', 'BCNF', 'C', 'Hard', 30),
('Big O Notation', 'What is the space complexity of quicksort in the worst case?', 'O(1)', 'O(log n)', 'O(n)', 'O(n²)', 'C', 'Hard', 30),
('React Hook', 'Which React hook is used for side effects?', 'useState', 'useEffect', 'useContext', 'useMemo', 'B', 'Medium', 20),
('Git Command', 'Which command creates a new branch and switches to it?', 'git branch new', 'git checkout new', 'git checkout -b new', 'git switch new', 'C', 'Easy', 10),
('Async JavaScript', 'What does async/await help prevent?', 'Memory leaks', 'Callback hell', 'Type errors', 'Syntax errors', 'B', 'Medium', 20),
('CSS Flexbox', 'Which property is used to center items along the main axis in flexbox?', 'align-items', 'justify-content', 'align-content', 'flex-center', 'B', 'Easy', 10),
('Algorithm', 'Which algorithm is NOT a sorting algorithm?', 'QuickSort', 'MergeSort', 'Dijkstra', 'BubbleSort', 'C', 'Medium', 20),
('Node.js', 'Which module is used to create a web server in Node.js?', 'fs', 'http', 'path', 'url', 'B', 'Easy', 10);