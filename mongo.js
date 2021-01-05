const mongoose = require('mongoose');

// no passwords in the shell history, thank-you...
const url = process.env.MONGO_URL;
if (!url) {
    console.log('Please set $MONGO_URL');
    process.exit(1);
}

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
}).catch(e => {
    console.log(`unable to connect to mongo: ${e}`);
    process.exit(1);
});

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Person = mongoose.model('Person', personSchema);

async function logAllPersons() {
    return Person.find().then(result => {
        console.log('phonebook:');
        result.forEach(person => {
            console.log(`${person.name}: ${person.number}`);
        });
    });
}

async function savePerson(name, number) {
    return new Person({ name, number }).save().then(result => {
        console.log(`saved: ${result}`);
    });
}

async function doIt(args) {
    if (args.length === 2) {
        return logAllPersons();
    } else if (args.length === 4) {
        return savePerson(args[2], args[3]);
    } else {
        console.log('wrong number of arguments');
        process.exit(1);
    }
}

doIt(process.argv)
    .catch(e => {
        console.log(`failure: ${e}`);
    })
    .finally(() => {
        mongoose.connection.close();
    });
