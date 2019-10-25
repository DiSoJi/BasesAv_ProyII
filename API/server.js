const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const port = 8080;
//const sql = require('mssql');
var CryptoJS = require("crypto-js");
server.use(bodyParser.urlencoded({extended: false}))
server.use(bodyParser.json());


//CORS Middleware
server.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});
//Setting up server
/*app.listen(3000, () => {
    console.log("Listening at :3000...");
});*/


 var mongoose = require('mongoose');
 mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true}); //Change this line to set conection string
 
//Esquemas para documentos//////////////////////////////////////////////////////////////////////////
/*Esquemas de Administrador*/
var aeropuertoSchema = new mongoose.Schema({
    codigoAeropuerto:String,
    nombre:String,
    lugar:String,
    infoContacto:String,
    sitioWeb:String

}, {
    versionKey: false // You should be aware of the outcome after set to false
});

var funcionarioSchema = new mongoose.Schema({
    cedula:Number,
    nombreCompleto:String,
    tipo:Number,
    fechaIngreso:Date,
    areTrabajo:String,
    contraseña:String

}, {
    versionKey: false // You should be aware of the outcome after set to false
});

var aerolineaSchema = new mongoose.Schema({
    id:String,
    nombre:String,
    paisesVuelos:Array,

}, {
    versionKey: false // You should be aware of the outcome after set to false
});

var vueloSchema = new mongoose.Schema({
    codigoVuelo:String,
    nombre:String,
    origen:String,
    destino:String,
    sitioWeb:String,
    itinerario:String,
    precio:Number,
    restricciones:Array,
    caracteristicasVuelo:Array,
    estado:String, //retrasado, adelantado a tiempo
    capacidadMaxima:Number,
    asientosDisponibles:Number

}, {
    versionKey: false // You should be aware of the outcome after set to false
});

/*Esquemas de boletos*/

var pasajeroSchema = new mongoose.Schema({
    cedula:Number,
    nombreCompleto:String,
    fechaNacimiento:Date,
    nacionalidad:String,
    lugarResidencia:String,
    telefono:Number,
    correo:String,
    contraseña:String

}, {
    versionKey: false // You should be aware of the outcome after set to false
});

var compraSchema = new mongoose.Schema({
    codigoCompra:String,
    cantidadBoletos:Number,
    cantidadMaletas:Number,
    estado:Array,
    observaciones:Array

}, {
    versionKey: false // You should be aware of the outcome after set to false
});


//////////////////////////////////////////////////////////////////////////////////////////////////////
//Creacion de modelos/////////////////////////////////////////////////////////////////////////////////
/*Modelos de administrador*///------------------------------------------------------------------------
var Aeropuerto = mongoose.model('Aeropuerto', aeropuertoSchema);
var Funcionario = mongoose.model('Funcionario', funcionarioSchema);
var Aerolinea = mongoose.model('Aerolinea', aerolineaSchema);
var Vuelo = mongoose.model('Vuelo', vueloSchema);

/*Modelos de boletos*///-----------------------------------------------------------------------------
var Pasajero = mongoose.model('Pasajero', pasajeroSchema);
var Compra = mongoose.model('Compra', compraSchema);

//////////////////////////////////////////////////////////////////////////////////////////////////////
//CRUDS de Colecciones////////////////////////////////////////////////////////////////////////////////

/*CRUDS Aeropuertos*///----------------------------------------------------------------------------------
server.post("/CRUDS/CreateAeropuerto", async (req, res) => {
    console.log("Request recieved");
    let success;
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    try {
        let newAeropuerto = new Aeropuerto(req.body);
        response = await newAeropuerto.save()
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.post("/CRUDS/GetAeropuerto_codigo", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['codigoAeropuerto']
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Aeropuerto.find({codigoAeropuerto:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.get("/CRUDS/GetAeropuerto_todos", async (req, res) => {
    console.log("Request recieved");
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Aeropuerto.find().exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.post("/CRUDS/UpdateAeropuerto", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['codigoAeropuerto']
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var aero = await Aeropuerto.find({codigoAeropuerto:codigo}).exec();
        console.log(aero)
        aero = aero[0].set(req.body);
        console.log(aero)
        var response = await aero.save();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.post("/CRUDS/DeleteAeropuerto", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['codigoAeropuerto']
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Aeropuerto.deleteOne({codigoAeropuerto:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

//////////////////////////////////////////////////////////////////////////////////////////////////////
/*CRUDS Funcionarios*///----------------------------------------------------------------------------------
server.post("/CRUDS/CreateFuncionario", async (req, res) => {
    console.log("Request recieved");
    let success;
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    try {
        let newFuncionario = new Funcionario(req.body);
        response = await newFuncionario.save()
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.post("/CRUDS/GetFuncionario_cedula", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['cedula']
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Funcionario.find({cedula:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.get("/CRUDS/GetFuncionario_todos", async (req, res) => {
    console.log("Request recieved");
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Funcionario.find().exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.post("/CRUDS/UpdateFuncionario", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['cedula']
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var aero = await Funcionario.find({cedula:codigo}).exec();
        console.log(aero)
        aero = aero[0].set(req.body);
        console.log(aero)
        var response = await aero.save();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.post("/CRUDS/DeleteFuncionario", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['cedula']
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Funcionario.deleteOne({cedula:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});
//////////////////////////////////////////////////////////////////////////////////////////////////////

/*CRUDS Aerolineas*///----------------------------------------------------------------------------------
server.post("/CRUDS/CreateAerolinea", async (req, res) => {
    console.log("Request recieved");
    let success;
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    try {
        let newAerolinea = new Aerolinea(req.body);
        response = await newAerolinea.save()
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.post("/CRUDS/GetAerolinea_id", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['id']
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Aerolinea.find({id:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.get("/CRUDS/GetAerolinea_todos", async (req, res) => {
    console.log("Request recieved");
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Aerolinea.find().exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.post("/CRUDS/UpdateAerolinea", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['id']
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var aero = await Aerolinea.find({id:codigo}).exec();
        console.log(aero)
        aero = aero[0].set(req.body);
        console.log(aero)
        var response = await aero.save();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.post("/CRUDS/DeleteAerolinea", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['id']
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Aerolinea.deleteOne({id:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});
//////////////////////////////////////////////////////////////////////////////////////////////////////

/*CRUDS Vuelo*///----------------------------------------------------------------------------------
server.post("/CRUDS/CreateVuelo", async (req, res) => {
    console.log("Request recieved");
    let success;
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    try {
        let newVuelo = new Vuelo(req.body);
        response = await newVuelo.save()
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.post("/CRUDS/GetVuelo_codigo", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['codigoVuelo']
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Vuelo.find({codigoVuelo:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.get("/CRUDS/GetVuelo_todos", async (req, res) => {
    console.log("Request recieved");
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Vuelo.find().exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.post("/CRUDS/UpdateVuelo", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['codigoVuelo']
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var aero = await Vuelo.find({codigoVuelo:codigo}).exec();
        console.log(aero)
        aero = aero[0].set(req.body);
        console.log(aero)
        var response = await aero.save();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.post("/CRUDS/DeleteVuelo", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['codigoVuelo']
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Vuelo.deleteOne({codigoVuelo:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});
//////////////////////////////////////////////////////////////////////////////////////////////////////

/*CRUDS Pasajero*///----------------------------------------------------------------------------------
server.post("/CRUDS/CreatePasajero", async (req, res) => {
    console.log("Request recieved");
    let success;
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    try {
        let newPasajero = new Pasajero(req.body);
        response = await newPasajero.save()
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.post("/CRUDS/GetPasajero_cedula", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['cedula']
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Pasajero.find({cedula:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.get("/CRUDS/GetPasajero_todos", async (req, res) => {
    console.log("Request recieved");
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Pasajero.find().exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.post("/CRUDS/UpdatePasajero", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['cedula']
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var aero = await Pasajero.find({cedula:codigo}).exec();
        console.log(aero)
        aero = aero[0].set(req.body);
        console.log(aero)
        var response = await aero.save();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.post("/CRUDS/DeletePasajero", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['cedula']
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Pasajero.deleteOne({cedula:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});
//////////////////////////////////////////////////////////////////////////////////////////////////////

/*CRUDS Compra*///----------------------------------------------------------------------------------
server.post("/CRUDS/CreateCompra", async (req, res) => {
    console.log("Request recieved");
    let success;
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    try {
        let newCompra = new Compra(req.body);
        response = await newCompra.save()
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.post("/CRUDS/GetCompra_codigo", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['codigoCompra']
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Compra.find({codigoCompra:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.get("/CRUDS/GetCompra_todos", async (req, res) => {
    console.log("Request recieved");
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Compra.find().exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.post("/CRUDS/UpdateCompra", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['codigoCompra']
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var aero = await Compra.find({codigoCompra:codigo}).exec();
        console.log(aero)
        aero = aero[0].set(req.body);
        console.log(aero)
        var response = await aero.save();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});

server.post("/CRUDS/DeleteCompra", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['codigoCompra']
    var db = mongoose.connection;
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Compra.deleteOne({codigoCompra:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    res.send(success)
});
//////////////////////////////////////////////////////////////////////////////////////////////////////


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

/**    //Encription for passwords
// Decrypt
var bytes  = CryptoJS.AES.decrypt(pass.toString(), 'zWqhtuy567lKhtgf3');
var plaintext = bytes.toString(CryptoJS.enc.Utf8);
console.log(plaintext);
**/


 server.listen(process.env.PORT || 8080, () => {
    //var port = server.address().port;
    console.log("App now running on port",8080);
 });