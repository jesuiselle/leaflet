const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const data = [
  {id: 1, name: "Cookies", coordinates: [10.2, 56.6], image: ''},
  {id: 2, name: "test", coordinates: [17.2, 66.6], image: ''}
]

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.get("/data", (req, res, next) => {
  try {
    res.status(200).json({data})
  } catch (error) {
    res.catch(500).send(error);
  }
});

app.get('/data/:id', (req, res) => {
  const reqId = req.params.id;
  const dataIndex = data.findIndex(element => element.id === +reqId);
  if (dataIndex === -1) return res.status(404).json({})

  res.json(data[dataIndex])
})

app.post('/data', (req, res) => {

  try {
    if (+req.body.coordinates[0] === 0 || +req.body.coordinates[1] === 0)
      return res.status(400).send(`Error`)


    const aux = req.body;

    aux.id = data.length + 1;
    aux.name = req.body.name;
    aux.coordinates = req.body.coordinates;
    aux.image = req.body.image;
    data.push(aux)

    res.status(200).send(aux)
  } catch (error) {
    res.status(500).send(error)
  }
})

app.patch('/data/:id', (req, res) => {
  const id = req.params.id;
  const element = data.find(e => e.id == id);
  if (!element) return res.sendStatus(404);
  if (req.body.name) {
    const name = req.body.name;
    element.name = name;
  }
  if (req.body.image) {
    const image = req.body.image;
    element.image = image;
  }
  res.json(element);
});

app.delete('/data/:id', (req, res) => {
  const reqId = req.params.id;
  console.log('hello from reqId', reqId);
  const dataIndex = data.findIndex(element => element.id === +reqId);
  console.log(dataIndex)
  if (dataIndex === -1) return res.status(404).json({})

  data.splice(dataIndex, 1)
  res.json(data)
})

module.exports = app;
