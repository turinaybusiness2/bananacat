import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Allows self-signed certificates if needed
  },
});

export default async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const result = await pool.query(
      "SELECT * FROM ValidTweetUrls ORDER BY created_at DESC"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching Tweet URLs:", error);
    res.status(500).send("Error fetching Tweet URLs.");
  }
};
