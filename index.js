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

function handleError(rsp) {
    // TODO: handle invalid ids and return 404
    // Eg: Cast to ObjectId failed for value "invalid" at path "_id" for model "Person"
    return (e) => {
        console.log(e);
        rsp.status(500).json({ error: e.message });
    };
}

app.get('/info', (req, rsp) => {
    Person.countDocuments({}).then(count => {
        rsp.send(
            `<p>Phonebook has info for ${count} people</p>` +
            `<p>${new Date()}</p>`)
    }).catch(handleError(rsp));
});

app.get('/api/persons', (req, rsp) => {
    Person.find({}).then(persons => {
        rsp.json(persons);
    }).catch(handleError(rsp));
});

app.get('/api/persons/:id', (req, rsp) => {
    Person.findById(req.params.id).then(person => {
        if (person) {
            rsp.json(person);
        } else {
            rsp.status(404).end();
        }
    }).catch(handleError(rsp));
});

app.delete('/api/persons/:id', (req, rsp) => {
    Person.findByIdAndDelete(req.params.id).then(person => {
        rsp.status(person ? 204 : 404).end();
    }).catch(handleError(rsp));
});

app.post('/api/persons', (req, rsp) => {
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
    }).catch(handleError(rsp));
});

app.patch('/api/persons/:id', (req, rsp) => {
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
    }).catch(handleError(rsp));

    // TODO: check for unique name...
    // return rsp.status(400).json({ error: 'name must be unique' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
