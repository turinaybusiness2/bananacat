import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { tweet_url } = req.body;
  if (!tweet_url) {
    return res.status(400).send("Tweet URL is required.");
  }

  try {
    // Check if the tweet URL already exists
    const checkResult = await pool.query(
      "SELECT * FROM ValidTweetUrls WHERE tweet_url = $1",
      [tweet_url]
    );

    if (checkResult.rows.length > 0) {
      // URL already exists, silently return success without adding
      return res.status(200).send("Tweet URL already exists.");
    }

    // Insert the new tweet URL if it doesn't exist
    const insertResult = await pool.query(
      "INSERT INTO ValidTweetUrls (tweet_url) VALUES ($1) RETURNING *",
      [tweet_url]
    );

    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    console.error("Error saving Tweet URL:", error);
    res.status(500).send("Error saving Tweet URL.");
  }
};
