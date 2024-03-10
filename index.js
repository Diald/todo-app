import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: 'localhost',
  database: 'todo',
  password: 'Divya123',
  port: 5432,
});

db.connect()
  .then(() => {
    console.log('Connected to database');
  })
  .catch(err => {
    console.error('Error connecting to database:', err);
  });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function fetchItems() {
  try {
    const result = await db.query("SELECT * FROM items");
    return result.rows;
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
}

app.get("/", async (req, res) => {
  try {
    const items = await fetchItems();
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  } catch (error) {
    console.error("Error rendering index:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    await db.query("INSERT INTO items (title) VALUES ($1)", [item]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/edit", async (req, res) => {
  const item = req.body.updatedItemTitle;
  const id = req.body.updatedItemId;

  try {
    await db.query("UPDATE items SET title = ($1) WHERE id = $2", [item, id]);
    res.redirect("/");
  } catch (error) {
    console.error("Error editing item:", error); // Log the error message
    res.status(500).send("Error editing item");
  }
});

app.post("/delete", async(req, res) => {
  const id = req.body.deleteItemId;
  try {
    await db.query("DELETE FROM items WHERE id = ($1)",[id]);
    res.redirect("/");
  } catch (error) {
    console.error("Error editing item:", error); 
    res.status(500).send("Error editing item");
  }
  // Handle item deletion
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
