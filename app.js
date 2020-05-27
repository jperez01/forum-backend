const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const Pool = require('pg').Pool;
const commentRoutes = require('./comments');

app.use(cors());
app.use(express.json());
app.use('/comments', commentRoutes);

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false
	}
});

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.post("/users/create", async (req, res) => {
	try {
		const newUser = await pool.query("INSERT INTO users (username, email, password) VALUES($1, $2, $3) RETURNING *",
			[
				req.body.username,
				req.body.email,
				req.body.password
			]);
		res.json(newUser);
	} catch (err) {
		console.log(err);
	}
});

app.get("/users", async (req, res) => {
	try {
		const allUsers = await pool.query("SELECT * FROM users");
		res.json(allUsers.rows);
	} catch (err) {
		console.error(err.message);
	}
});

app.get("/users/:username/:password", async (req, res) => {
	try {
		const user = await pool.query("SELECT * FROM users WHERE username = $1 AND password = $2",
			[
				req.params.username,
				req.params.password
			]);
		res.json(user.rows);
	} catch (err) {
		console.error(err.message);
	}
})

//update a user's username
app.put("/users/username/:username", async (req, res) => {
	try {
		const username = req.params.username;
		const password = req.body.password;
		const email = req.body.email;
		const updateUser = await pool.query(
			"UPDATE users SET username = $1 WHERE password = $2 AND email = $3",
			[username, password, email]);
		res.json(updateUser);
	} catch (err) {
		console.error(err.message);
	}
});

//update a user's password
app.put("/users/password/:password", async (req, res) => {
	try {
		const username = req.body.username;
		const password = req.params.password;
		const email = req.body.email;
		const updateUser = await pool.query(
			"UPDATE users SET password = $1 WHERE username = $2 AND email = $3",
			[password, username, email]);
		res.json(updateUser);
	} catch (err) {
		console.error(err.message);
	}
});

//delete user account
app.delete("/users/:username", async (req, res) => {
	try {
		const username = req.params.username;
		const deleteUser = await pool.query(
			"DELETE FROM users WHERE username = $1",
			[username]);
		res.json("User was deleted");
	} catch (err) {
		console.error(err.message);
	}
});

/* 
	This section is for posts and different actions for them
*/

//Puts a post into the table for future use
app.post("/posts/create", async (req, res) => {
	try {
		const newPost = await pool.query("INSERT INTO posts (author, title, body, date, likes) VALUES($1, $2, $3, to_timestamp($4) , $5) RETURNING *",
			[
				req.body.author,
				req.body.title,
				req.body.body,
				req.body.date,
				req.body.likes
			]);
		res.json(newPost.rows);
	} catch (err) {
		res.json({});
		console.error(err.message);
	}
});

//Gets all posts from the table
app.get("/posts", async (req, res) => {
	try {
		const allPosts = await pool.query("SELECT * FROM posts");
		res.json(allPosts.rows);
	} catch (err) {
		console.error(err.message);
	}
})

//Gets specific post
app.get("/posts/:author/:id", async (req, res) => {
	try {
		const post = await pool.query(
			"SELECT * FROM posts WHERE author = $1 AND post_id = $2",
			[
				req.params.author,
				req.params.id
			]);
		res.json(post.rows);
	} catch (err) {
		console.error(err.message);
	}
});

//Gets specific post from a user
app.get("/posts/:author", async (req, res) => {
	try {
		const post = await pool.query(
			"SELECT * FROM posts WHERE author = $1",
			[
				req.params.author
			]);
		res.json(post.rows);
	} catch (err) {
		console.error(err.message);
	}
});

//Changes the likes on a post
app.put("/posts/:author/:title/:likes", async (req, res) => {
	try {
		const post = await pool.query(
			"UPDATE posts SET likes = $1 WHERE author = $2 AND title = $3",
			[
				req.params.likes,
				req.params.author,
				req.params.title
			])
	} catch (err) {
		console.error(err.message);
	}
});

//Deletes post based on author, title, body combination
app.delete("/posts/delete/:author/:title/:body", async (req, res) => {
	try {
		const deletePost = await pool.query(
			"DELETE FROM posts WHERE author = $1 AND title = $2 AND body = $3",
			[
				req.params.author,
				req.params.title,
				req.params.body
			]);
		res.json("Post was deleted");
	} catch (err) {
		console.error(err.message);
	}
});


app.listen(port, () => console.log(`Listening on ${port}`));