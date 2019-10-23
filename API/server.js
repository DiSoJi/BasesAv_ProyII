const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const port = 8080;
//const sql = require('mssql');
var CryptoJS = require("crypto-js");
server.use(bodyParser.urlencoded({extended: false}))
server.use(bodyParser.json());

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true}); //Change this line to set conection string

//CORS Middleware
server.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});
//Setting up server
/*var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
 });
*/
/*
let config = {
    user: 'sa',
    password:'asd',
    server: 'localhost', 
    port:64403,
    database: 'FarmaTEC',
    //options: {
    //    instancename: 'MSSQLSERVER01'
        //encrypt: false
    //} 
};
*/
/**    
// Decrypt
var bytes  = CryptoJS.AES.decrypt(pass.toString(), 'zWqhtuy567lKhtgf3');
var plaintext = bytes.toString(CryptoJS.enc.Utf8);
console.log(plaintext);
**/

//DUmmy methods for API construction
server.post("/Pedidos/sp_delete_PedidoXMedicamento", async (req, res) => {
    
    let CodigoPedido= req.body["CodigoPedido"];
    let CodigoMedicamento = req.body["CodigoMedicamento"];
    
    let success;
    try
    {
        let pool = await sql.connect(config);
        let result2 = await pool.request()
            .input('CodigoDePedido', sql.VarChar(256), CodigoPedido)
            .input('CodigoDeMedicamento', sql.VarChar(256),CodigoMedicamento)
            //.output('Contraseña', sql.VarChar(256))
            .execute('sp_delete_PedidoXMedicamento')
        sql.close();
        success = {"Succes": "True", "Result": result2};
    }
    catch(err)
    {
        sql.close();
        success = {"Succes": "False", "Result": err};
        console.log(err);
    }
    res.send(success);
    console.log(req.body)
 });

 /*
//Conection and function
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});
//Schema to data manipulation
var kittySchema = new mongoose.Schema({
  name: String
});

//Schema use using a model
var Kitten = mongoose.model('Kitten', kittySchema);

//save method
fluffy.save(function (err, fluffy) {
    if (err) return console.error(err);
    fluffy.speak();
  });

//find methods
Kitten.find(function (err, kittens) {
  if (err) return console.error(err);
  console.log(kittens);
})
//find in rich query
Kitten.find({ name: /^fluff/ }, callback);

*/




server.post("/Pedidos/CantidadDePedidosEnRango", async (req, res) => {
    let FechaInicial= req.body["FechaInicial"];
    let FechaFinal = req.body["FechaFinal"];
    var Date1 = new Date(FechaInicial);
    var Date2 = new Date(FechaFinal);
    let success;
    try
    {
        let pool = await sql.connect(config);
        let result2 = await pool.request()
            .input('FechaInicial', sql.DateTime, Date1)
            .input('FechaFinal', sql.DateTime,Date2)
            //.output('Contraseña', sql.VarChar(256))
            .execute('sp_get_CantidadDePedidosEnRango')
        sql.close();
        success = {"Succes": "True", "Result": result2};
    }
    catch(err)
    {
        sql.close();
        success = {"Succes": "False", "Result": err};
        console.log(err);
    }
    res.send(success);
    console.log(req.body)
 });

server.post("/Usuarios/GetCliente", async (req, res) => {
    let Cedula= req.body["Cedula"];
    
    let success;
    try
    {
        let pool = await sql.connect(config);
        let result2 = await pool.request()
            .input('CedulaCliente', sql.BigInt, Cedula)
            //.output('Contraseña', sql.VarChar(256))
            .execute('sp_get_Cliente')
        sql.close();
        success = {"Succes": "True", "Result": result2};
    }
    catch(err)
    {
        sql.close();
        success = {"Succes": "False", "Result": err};
        console.log(err);
    }
    res.send(success);
    console.log(req.body)
 });
