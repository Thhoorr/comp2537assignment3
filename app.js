const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const session = require("cookie-session");

app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(
  session({
    secret: "your-secret-key",
    name: "session",
    darkMode: false,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },
  }),
);
app.set("view engine", "ejs");

// Routes
app.get("/", (req, res) => {
  res.redirect("/easy");
});

app.get("/easy", async (req, res) => {
  const cards = await getCards(3);
  res.render("index", {
    cards: cards,
    columns: 3,
    difficulty: "easy",
    theme: getTheme(req),
  });
});

app.get("/medium", async (req, res) => {
  const cards = await getCards(6);
  res.render("index", {
    cards: cards,
    columns: 4,
    difficulty: "medium",
    theme: getTheme(req),
  });
});

app.get("/hard", async (req, res) => {
  const cards = await getCards(12);
  res.render("index", {
    cards: cards,
    columns: 6,
    difficulty: "hard",
    theme: getTheme(req),
  });
});

async function getCards(count) {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${count}`,
  );
  const data = await response.json();

  const images = await Promise.all(
    data.results.map(async (pokemon) => {
      const details = await fetch(pokemon.url);
      const json = await details.json();
      return json.sprites.front_default;
    }),
  );
  return images;
}

app.post("/:difficulty/theme", (req, res) => {
  req.session.darkMode = !req.session.darkMode;
  res.redirect("/" + req.params.difficulty);
});

function getTheme(req) {
  return req.session.darkMode ? "dark" : "light";
}

// 404 handler
app.use((req, res) => {
  res.status(404).render("404");
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Server Error");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
