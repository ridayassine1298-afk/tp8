const express = require('express');
const { MongoClient } = require('mongodb')
const app = express()

app.use(express.json());
const client = new MongoClient('mongodb://127.0.0.1:27017')
let db;
client.connect().then(() => {
    db = client.db('dbClass')
    console.log('Connected!');
})
app.get('/members', async(req, res) => {
    try {
        const members = await db.collection('members').find({}).toArray();
        res.status(200).json(members)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
})
app.get('/members/:id', async(req, res) => {
    try {
        const id = parseInt(req.params.id);
        const member = await db.collection('members').findOne({ id: id });
        res.status(200).json(member)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

app.post('/members', async(req, res) => {
    try {
        const { nom, prenom, actif } = req.body;
        const members = await db.collection('members').find({}).toArray();
        let id;

        id = members.length == 0 ? 1 : members[members.length - 1].id + 1
        const member = {
            id: id,
            nom,
            prenom,
            actif: true,
            dateCreation: new Date().toISOString()
        }
        await db.collection('members').insertOne(member);

    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

app.put('/members/:id', async(req, res) => {
    try {
        const id = parseInt(req.params.id);
        const member = await db.collection('members').findOne({ id: id });
        if (!member) {
            return res.status(404).json({ message: "Member not found" })
        }
        const result = await db.collection('members').replaceOne({ id: id }, { id, ...res.body, dateCreation: member.dateCreation });
        if (result.matchedCount == 0) return res.status(404).json({ message: "Error" })
        res.status(200).json({ message: "Member misAjour" })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
})
app.patch('/members/:id/status', async(req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { actif } = req.body;
        const result = await db.collection('members').updateOne({ id: id }, { actif });
        res.status(200).json({ message: "Status changed" })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
})
app.delete('/members/:id', async(req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await db.collection('members').deleteOne({ id: id });
        if (result.deletedCount == 0) return res.status(404).json({ message: "Error" })
        res.status(200).json({ message: "Member deleted" })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
})


app.listen(3002, () => {

    console.log("Memers service demarre sur le port 3002")
})