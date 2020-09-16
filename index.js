require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const Person = require("./models/person");

morgan.token("requestData", (req, res) => {
  if (req.method === "POST" || req.method === "PUT") {
    return JSON.stringify(req.body);
  } else {
    return " ";
  }
});

app.use(express.static("build"));
app.use(express.json());
app.use(cors());
app.use(morgan(":method :url :status :requestData"));

app.get("/info", (req, res) => {
  Person.find({}).then(persons => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.write(`<p> Phonebook has info for ${persons.length} people</p>`);
    res.write(`<p>${new Date()}</p>`);
    res.end();
  });
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => {
      next(error);
    });
});

app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  Person.find({ name: body.name }).then(name => {
    if (name.length) {
      return res.status(400).json({
        error: "name already in the phonebook"
      });
    } else {
      const person = new Person({
        name: body.name,
        number: body.number
      });
      person
        .save()
        .then(newPerson => newPerson.toJSON())
        .then(formattedNewPerson => {
          res.json(formattedNewPerson);
        })
        .catch(error => next(error));
    }
  });
});

app.put("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson);
    })
    .catch(error => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end();
    })
    .catch(error => next(error));
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
