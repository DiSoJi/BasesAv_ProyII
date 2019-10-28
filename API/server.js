const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const port = 8080;
//const sql = require('mssql');
var CryptoJS = require("crypto-js");
server.use(bodyParser.urlencoded({extended: false}))
server.use(bodyParser.json());

//Encryption Key. TOP SECRET (that's why it's in source code like a complete madlad :V)
var encryptionKey = 'AMelodyThatUneasesTheWellOfTheSoul';

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
 //mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true}); //Change this line to set conection string
 
 var masterdb = 'mongodb://localhost/test' //Remember to change this for an extraction from a file, changed with docker.
 var slavedb = 'mongodb://localhost/mongoide' //Remember to change this for an extraction from a file, changed with docker.
 
 
 //mongoide.connect('mongodb://localhost/mongoide', {useNewUrlParser: true}); //Change this line to set conection string


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
    tipo:String,
    fechaIngreso:Date,
    areaTrabajo:Array,
    contrasena:String

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
    contrasena:String

}, {
    versionKey: false // You should be aware of the outcome after set to false
});

var compraSchema = new mongoose.Schema({
    idPasajero:Number, //Added idPasajero to keep the relation between a buy and the buyer
    codigoVuelo:String, //Added codigoVuelo to keep the relation between a buy and the buyer
    codigoCompra:String,
    cantidadBoletos:Number,
    cantidadMaletas:Number,
    estado:Array,
    observaciones:String

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
    //var db = mongoide.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    try {
        let newAeropuerto = new Aeropuerto(req.body);
        response = await newAeropuerto.save()
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/GetAeropuerto_codigo", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['codigoAeropuerto']
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Aeropuerto.find({codigoAeropuerto:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.get("/CRUDS/GetAeropuerto_todos", async (req, res) => {
    console.log("Request recieved");
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb aero_todos");
    let success;
    try {
        var response = await Aeropuerto.find().exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/UpdateAeropuerto", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['codigoAeropuerto']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
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
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/DeleteAeropuerto", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['codigoAeropuerto']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Aeropuerto.deleteOne({codigoAeropuerto:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

//////////////////////////////////////////////////////////////////////////////////////////////////////
/*CRUDS Funcionarios*///----------------------------------------------------------------------------------
server.post("/CRUDS/CreateFuncionario", async (req, res) => {
    console.log("Request recieved");
    let success;
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    try {
        let tempBody = req.body;
        tempBody['contrasena'] = CryptoJS.AES.encrypt(tempBody['contrasena'].toString(), encryptionKey);
        let newFuncionario = new Funcionario(tempBody);
        response = await newFuncionario.save()
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/GetFuncionario_cedula", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['cedula']
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Funcionario.find({cedula:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.get("/CRUDS/GetFuncionario_todos", async (req, res) => {
    console.log("Request recieved");
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Funcionario.find().exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/UpdateFuncionario", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['cedula']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
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
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/DeleteFuncionario", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['cedula']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Funcionario.deleteOne({cedula:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});
//////////////////////////////////////////////////////////////////////////////////////////////////////

/*CRUDS Aerolineas*///----------------------------------------------------------------------------------
server.post("/CRUDS/CreateAerolinea", async (req, res) => {
    console.log("Request recieved");
    let success;
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    try {
        let newAerolinea = new Aerolinea(req.body);
        response = await newAerolinea.save()
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/GetAerolinea_id", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['id']
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Aerolinea.find({id:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.get("/CRUDS/GetAerolinea_todos", async (req, res) => {
    console.log("Request recieved");
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Aerolinea.find().exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/UpdateAerolinea", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['id']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
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
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/DeleteAerolinea", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['id']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Aerolinea.deleteOne({id:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});
//////////////////////////////////////////////////////////////////////////////////////////////////////

/*CRUDS Vuelo*///----------------------------------------------------------------------------------
server.post("/CRUDS/CreateVuelo", async (req, res) => {
    console.log("Request recieved");
    let success;
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    try {
        let newVuelo = new Vuelo(req.body);
        response = await newVuelo.save()
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/GetVuelo_codigo", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['codigoVuelo']
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Vuelo.find({codigoVuelo:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.get("/CRUDS/GetVuelo_todos", async (req, res) => {
    console.log("Request recieved");
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Vuelo.find().exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/UpdateVuelo", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['codigoVuelo']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
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
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/DeleteVuelo", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['codigoVuelo']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Vuelo.deleteOne({codigoVuelo:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});
//////////////////////////////////////////////////////////////////////////////////////////////////////

/*CRUDS Pasajero*///----------------------------------------------------------------------------------
server.post("/CRUDS/CreatePasajero", async (req, res) => {
    console.log("Request recieved");
    let success;
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    try {
        let tempBody = req.body;
        tempBody['contrasena'] = CryptoJS.AES.encrypt(tempBody['contrasena'].toString(), encryptionKey);
        let newPasajero = new Pasajero(tempBody);
        response = await newPasajero.save()
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/GetPasajero_cedula", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['cedula']
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Pasajero.find({cedula:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.get("/CRUDS/GetPasajero_todos", async (req, res) => {
    console.log("Request recieved");
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Pasajero.find().exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/UpdatePasajero", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['cedula']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
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
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/DeletePasajero", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['cedula']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Pasajero.deleteOne({cedula:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});
//////////////////////////////////////////////////////////////////////////////////////////////////////

/*CRUDS Compra*///----------------------------------------------------------------------------------
server.post("/CRUDS/CreateCompra", async (req, res) => {
    console.log("Request recieved");
    let success;
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    try {
        let compraBody = req.body;
        let arrayEstado = [];
        for (i = 0; i < parseInt(req.body['cantidadBoletos']);i++){
            arrayEstado.push("Comprado")
        }
        compraBody['estado'] = arrayEstado;
        let newCompra = new Compra(compraBody);
        response = await newCompra.save()
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/GetCompra_codigo", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['codigoCompra']
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Compra.find({codigoCompra:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/GetCompra_pasajero", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['idPasajero']
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Compra.find({idPasajero:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/GetCompra_pasajeroXvuelo", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['codigoVuelo']
    let cedula = req.body['idPasajero']
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Compra.find({codigoVuelo:codigo,idPasajero:cedula}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});


server.get("/CRUDS/GetCompra_todos", async (req, res) => {
    console.log("Request recieved");
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Compra.find().exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/UpdateCompra", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['codigoCompra']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
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
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/DeleteCompra", async (req, res) => {
    console.log("Request recieved");
    let codigo = req.body['codigoCompra']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Compra.deleteOne({codigoCompra:codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});
//////////////////////////////////////////////////////////////////////////////////////////////////////
/*---LogIn-----------------------------------------------------------------------------------------*/

server.post("/LOGIN/Funcionario", async (req, res) => {
    console.log("Request recieved");
    let success;
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    try {
        let user = req.body['cedula']
        let pass = req.body['contrasena']
        //let newCompra = new Compra(req.body);
        let userResp = await Funcionario.find({'cedula':user}).exec();
        if (userResp == ""){
            console.log("No resp");
            success = {'Codigo':false,'Contenido':'404u'}
        } else {
            let Decryptedbytes  = CryptoJS.AES.decrypt(userResp[0]['contrasena'].toString(), encryptionKey);
            let DecryptedPass = Decryptedbytes.toString(CryptoJS.enc.Utf8);
            if (DecryptedPass != pass){
                success = {'Codigo':false,'Contenido':'404c'}
            }else{
                success = {'Codigo':true,'Contenido':userResp[0]['tipo']}
            }
        }
    } catch (error) {
        success = {'Codigo':false,'Contenido':"error"}
    }
    mongoose.disconnect();
    res.send(success)
});

server.post("/LOGIN/Pasajero", async (req, res) => {
    console.log("Request recieved");
    let success;
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    try {
        let user = req.body['cedula']
        let pass = req.body['contrasena']
        //let newCompra = new Compra(req.body);
        let userResp = await Pasajero.find({'cedula':user}).exec();
        if (userResp == ""){
            console.log("No resp");
            success = {'Codigo':false,'Contenido':'404u'}
        } else {
            let Decryptedbytes  = CryptoJS.AES.decrypt(userResp[0]['contrasena'].toString(), encryptionKey);
            let DecryptedPass = Decryptedbytes.toString(CryptoJS.enc.Utf8);
            if (DecryptedPass != pass){
                success = {'Codigo':false,'Contenido':'404c'}
            }else{
                success = {'Codigo':true,'Contenido':'200'}
            }
        }
    } catch (error) {
        success = {'Codigo':false,'Contenido':"error"}
    }
    mongoose.disconnect();
    res.send(success)
});
//////////////////////////////////////////////////////////////////////////////////////////////////////
/*---Passengers API's---------------------------------------------------------------------------------------*/
/*
* Passenger info registration: Already coded in passenger's CRUDS
* Buy tickets: Already coded in Ticket CRUDS
* 
*/

server.post("/Pasajeros/CheckIn", async (req, res) => { //Deberia estar listo. Falta probarlo
    console.log("Request recieved");
    let codigo = req.body['codigoVuelo']
    let cedula = req.body['idPasajer']
    let numCheck = parseInt(req.body['cantChecked']);
    let tempCheck = numCheck;
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true}); //Usa master por los updates
    console.log("Connected to mongodb");
    let success;
    try {
        var aero = await Compra.find({codigoVuelo:codigo,idPasajero:cedula}).exec();
        //console.log(aero)
        aero = aero[0]
        let tempArray = aero['estado'];
        for (i = 0; i < tempArray.length; i++){
            if (tempArray[i] == "comprado" && numCheck != 0){
                tempArray[i] = "checkedIn";
                numCheck--;
            }
        }
        if (numCheck != 0){
            success = {'Codigo':false,'Contenido':404} //404: no tiene suficientes volestos para la cantidad que esta haciendo check in
        }else{
            aero['estado'] = tempArray;
            //console.log(aero)
            //capacidadMaxima:Number,
            //asientosDisponibles:Number
            let vuelo = await Vuelo.find({codigoVuelo:codigo}).exec();
            vuelo = vuelo[0];
            if (parseInt(vuelo['asientosDisponibles']) == 0){
                success = {'Codigo':false,'Contenido':405} //405: el vuelo no tiene suficientes asientos (seria raro que ocurra)
            }else{
                let asientos = parseInt(vuelo['capacidadMaxima']) - parseInt(vuelo['asientosDisponibles']);
                let asientos2 = asientos + tempCheck;
                let rangoasientos = asientos.toString + asientos2.toString;
                var response = await aero.save();
                var response2 = await vuelo.save();
                success = {'Codigo':true,'Contenido':rangoasientos}
            }
        }
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
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



 server.listen(process.env.PORT || port, () => {
    //var port = server.address().port;
    console.log("Server listening on port",port);
 });