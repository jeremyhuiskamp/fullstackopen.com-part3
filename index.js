const express = require('express');
const app = express();
app.use(express.json());

const morgan = require('morgan');
morgan.token('post-body', req =>
    req.method === "POST" ? JSON.stringify(req.body) : null);
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-body'));

app.use(require('cors')());

app.use(express.static('uibuild'));

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

app.post('/api/persons', (req, rsp) => {
    const body = req.body;
    if (typeof body.name !== 'string' || body.name.length === 0) {
        return rsp.status(400).json({ error: 'missing name' });
    }
    if (typeof body.number !== 'string' || body.number.length === 0) {
        return rsp.status(400).json({ error: 'missing number' });
    }
    if (persons.some(p => p.name === body.name)) {
        return rsp.status(400).json({ error: 'name must be unique' });
    }

    const person = {
        name: body.name,
        number: body.number,
        id: Math.floor(Math.random() * 9999999999),
    }
    persons.push(person);
    rsp.json(person);
});

app.patch('/api/persons/:id', (req, rsp) => {
    const id = Number(req.params.id);
    const person = persons.find(p => p.id === id);
    if (!person) {
        return rsp.status(404).json({ error: 'unknown person' });
    }

    const newName = req.body.name;
    if (typeof newName === 'string') {
        if (newName.length === 0) {
            return rsp.status(400).json({ error: 'cannot make name empty' });
        }
        if (persons.some(p => p.name === newName && p.id !== id)) {
            return rsp.status(400).json({ error: 'name must be unique' });
        }
    }

    const newNumber = req.body.number;
    if (typeof newNumber === 'string') {
        if (newNumber.length === 0) {
            return rsp.status(400).json({ error: 'cannot make number empty' });
        }
    }

    if (typeof newName === 'string') {
        person.name = newName;
    }
    if (typeof newNumber === 'string') {
        person.number = newNumber;
    }
    return rsp.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
