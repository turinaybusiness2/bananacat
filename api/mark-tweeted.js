import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Allows self-signed certificates if needed
  },
});

export default async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { id } = req.body;
  if (!id) return res.status(400).send("ID is required.");

  try {
    const result = await pool.query(
      "DELETE FROM ValidTweetUrls WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).send("Tweet URL not found.");
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error marking Tweet as tweeted.");
  }
};
