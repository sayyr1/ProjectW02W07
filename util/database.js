const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const MongoConnect = callback => {
    MongoClient.connect('mongodb+srv://sayyr1:rpagm27MlsWl5EzU@cluster0.vs0of.mongodb.net/shop?retryWrites=true&w=majority')
        .then(client => {
            console.log('Connected');
            _db = client.db();
            callback()
        }
        ).catch(err => {
            console.log((err));
            throw err;
        });
}

const getDb = () => {
    if (_db) {
        return _db
    }
    throw 'No database Found'
}
module.exports.mongoConnect = MongoConnect;
module.exports.getDb = getDb




