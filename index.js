require('dotenv').config();

const Person = require('./models/person');
const express = require('express');

const app = express();

// parse request bodies to json:
app.use(express.json());

// request logging:
const morgan = require('morgan');
morgan.token('post-body', req =>
    req.method === "POST" ? JSON.stringify(req.body) : null);
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-body'));

// serve the static FE (assuming a react build has been placed here:)
app.use(express.static('uibuild'));

app.get('/info', (req, rsp, next) => {
    Person.countDocuments({}).then(count => {
        rsp.send(
            `<p>Phonebook has info for ${count} people</p>` +
            `<p>${new Date()}</p>`)
    }).catch(next);
});

app.get('/api/persons', (req, rsp, next) => {
    Person.find({}).then(persons => {
        rsp.json(persons);
    }).catch(next);
});

app.get('/api/persons/:id', (req, rsp, next) => {
    Person.findById(req.params.id).then(person => {
        if (person) {
            rsp.json(person);
        } else {
            rsp.status(404).end();
        }
    }).catch(next);
});

app.delete('/api/persons/:id', (req, rsp, next) => {
    Person.findByIdAndDelete(req.params.id).then(person => {
        rsp.status(person ? 204 : 404).end();
    }).catch(next);
});

app.post('/api/persons', (req, rsp, next) => {
    const body = req.body;
    if (typeof body.name !== 'string' || body.name.length === 0) {
        return rsp.status(400).json({ error: 'missing name' });
    }
    if (typeof body.number !== 'string' || body.number.length === 0) {
        return rsp.status(400).json({ error: 'missing number' });
    }
    // TODO: check for unique name...
    // return rsp.status(400).json({ error: 'name must be unique' });

    new Person({
        name: body.name,
        number: body.number,
    }).save().then(person => {
        rsp.json(person);
    }).catch(next);
});

app.patch('/api/persons/:id', (req, rsp, next) => {
    const newName = req.body.name;
    if (typeof newName === 'string') {
        if (newName.length === 0) {
            return rsp.status(400).json({ error: 'cannot make name empty' });
        }
    }

    const newNumber = req.body.number;
    if (typeof newNumber === 'string') {
        if (newNumber.length === 0) {
            return rsp.status(400).json({ error: 'cannot make number empty' });
        }
    }

    Person.findById(req.params.id).then(person => {
        if (!person) {
            return rsp.status(404).json({ error: 'unknown person' });
        }
        if (typeof newName === 'string') {
            person.name = newName;
        }
        if (typeof newNumber === 'string') {
            person.number = newNumber;
        }
        return person.save().then(person => {
            rsp.json(person);
        });
    }).catch(next);

    // TODO: check for unique name...
    // return rsp.status(400).json({ error: 'name must be unique' });
});

app.use((error, req, rsp, next) => {
    console.error(`${error.name ?? "??"}: ${error.message ?? error}`);
    if (error.name === 'CastError') {
        return rsp.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return rsp.status(400).send({ error: error.message })
    }
    return rsp.status(500).send({ error: "something went wrong" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
