// GET Route: Fetch the Site Logo
app.get('/api/site-logo', (req, res) => {
    // 1. The Query: Ask MySQL for the logo path
    const sql = "SELECT setting_value FROM site_settings WHERE setting_key = 'app_logo'";

    db.query(sql, (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        // 2. The Check: Did we find a row?
        if (result.length > 0) {
            // Success! Send the path back to React (e.g., "/uploads/logo.png")
            res.json({ logoUrl: result[0].setting_value });
        } else {
            // Fallback: If no logo is set in DB, send a default text or placeholder
            res.json({ logoUrl: null });
        }
    });
});