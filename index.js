require("dotenv").config();
const express = require("express");
const app = express();
const Contact = require("./models/contact");
const morgan = require("morgan");

const cors = require("cors");
app.use(cors());

app.use(express.static("build"));
app.use(express.json());

morgan.token("requestBody", (req, res) => {
  if (req.method === "POST" || req.method === "PUT") {
    return JSON.stringify(req.body);
  } else {
    return " ";
  }
});

app.use(morgan(":method :url :status :requestBody"));

app.get("/info", (req, res) => {
  const date = new Date();
  Contact.countDocuments().then(result => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.write(`<p> Phonebook has info for ${result} people</p>`);
    res.write(`<p>${date}</p>`);
    res.end();
  });
});

app.get("/api/contacts", (req, res) => {
  Contact.find({}).then(contacts => {
    res.json(contacts.map(contact => contact.toJSON()));
  });
});

app.get("/api/contacts/:id", (req, res, next) => {
  Contact.findById(req.params.id)
    .then(contact => {
      if (contact) {
        res.json(contact.toJSON());
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.post("/api/contacts", (req, res, next) => {
  const body = req.body;

  const contact = new Contact({
    name: body.name,
    number: body.number
  });

  contact
    .save()
    .then(newContact => newContact.toJSON())
    .then(formattedNewContact => res.json(formattedNewContact))
    .catch(error => next(error));
});

app.put("/api/contacts/:id", (req, res, next) => {
  const body = req.body;

  const contact = {
    name: body.name,
    number: body.number
  };

  Contact.findByIdAndUpdate(req.params.id, contact, { new: true })
    .then(updatedContact => res.json(updatedContact.toJSON()))
    .catch(error => next(error));
});

app.delete("/api/contacts/:id", (req, res, next) => {
  Contact.findByIdAndRemove(req.params.id)
    .then(result => res.status(204).end())
    .catch(error => next(error));
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === "CastError" && error.kind === "ObjectId") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
