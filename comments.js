const express = require('express');
const comment = express.Router();
const Pool = require('pg').Pool;

const pool = new Pool({
	user: "jlklgjwjrljdia",
	password: "f764627797a02adc2e5b4e1240954b5dacab81c7b85bd47b4cafb6ae21318f70",
	host: "ec2-54-86-170-8.compute-1.amazonaws.com",
	port: 5432,
	database: "d629o90e5nactm",
	ssl: {
		rejectUnauthorized: false
	}
});

comment.post('/create', async (req, res) => {
	try {
		const newComment = await pool.query("INSERT INTO comments (username, body, post, post_author) VALUES($1, $2, $3, $4) RETURNING *",
			[
			req.body.username,
			req.body.body,
			req.body.post,
			req.body.post_author
			]);
		res.json(newComment);
	} catch (err) {
		console.error(err.message);
	}
});

comment.get('/:id/:post_author', async (req, res) => {
	try {
		const comment = await pool.query("SELECT * FROM comments WHERE post_id = $1 AND post_author = $2",
			[
				req.params.id,
				req.params.post_author
			]);
		res.json(comment.rows);
	} catch (err) {
		console.error(err.message);
	}
});

comment.delete('/delete/:post/:username/:body', async (req, res) => {
	try {
		const comment = await pool.query("DELETE FROM comments WHERE post = $1 AND username = $2 AND body = $3",
			[
				req.body.post,
				req.body.username,
				req.body.body
			]);
		res.json("Comment deleted");
	} catch (err) {
		console.error(err.message);
	}
});

module.exports = comment;