const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456"
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523"
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345"
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122"
  }
];

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map(n => n.id)) : 0;
  return maxId + 1;
};

morgan.token("requestData", (req, res) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  } else {
    return " ";
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static("build"));
app.use(morgan(":method :url :status :requestData"));

app.get("/info", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.write(`<p>Phonebook has info for ${persons.length} people</p>`);
  res.write(`<p>${new Date()}</p>`);
  res.end();
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(person => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.post("/api/persons", (req, res) => {
  const body = req.body;
  const isExists = persons.find(
    person => person.name.toLowerCase() === body.name.toLowerCase()
  );

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "The name or number is missing"
    });
  }
  if (isExists) {
    return res.status(400).json({
      error: "The name already exists in the phonebook"
    });
  }

  const entry = {
    id: generateId(),
    name: body.name,
    number: body.number
  };
  persons = persons.concat(entry);
  res.json(entry);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(person => person.id !== id);
  res.status(204).end();
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
