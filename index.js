const express = require('express');
const app = express();
app.use(express.json());

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456",
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523",
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345",
    },
    {
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122",
    },
];

app.get('/info', (req, rsp) => {
    rsp.send(
        `<p>Phonebook has info for ${persons.length} people</p>` +
        `<p>${new Date()}</p>`)
});

app.get('/api/persons', (req, rsp) => {
    rsp.json(persons);
});

app.get('/api/persons/:id', (req, rsp) => {
    const id = Number(req.params.id);
    const person = persons.find(p => p.id === id);
    if (person) {
        rsp.json(person);
    } else {
        rsp.status(404).end();
    }
});

app.delete('/api/persons/:id', (req, rsp) => {
    const id = Number(req.params.id);
    const without = persons.filter(p => p.id !== id);
    if (without.length === persons.length) {
        rsp.status(404).end();
    } else {
        persons = without;
        rsp.status(204).end();
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})