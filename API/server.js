const express = require('express');
const bodyParser = require('body-parser');
const { Entropy } = require('entropy-string')
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
 var slavedb = 'mongodb://localhost/test' //Remember to change this for an extraction from a file, changed with docker.
 
 
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
    codigoAerolinea:String,
    fechaVuelo:Date,
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
    asientos:Array,
    fechaCompra:Date, //Necesaria para ser usada en la 4ta API de administrador
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
    console.log("Request received");
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
    console.log("Request received");
    let codigo = req.body['codigoAeropuerto']
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Aeropuerto.find({'codigoAeropuerto':codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.get("/CRUDS/GetAeropuerto_todos", async (req, res) => {
    console.log("Request received");
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
    console.log("Request received");
    let codigo = req.body['codigoAeropuerto']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var aero = await Aeropuerto.find({'codigoAeropuerto':codigo}).exec();
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
    console.log("Request received");
    let codigo = req.body['codigoAeropuerto']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Aeropuerto.deleteOne({'codigoAeropuerto':codigo}).exec();
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
    console.log("Request received");
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
    console.log("Request received");
    let codigo = req.body['cedula']
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Funcionario.find({'cedula':codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.get("/CRUDS/GetFuncionario_todos", async (req, res) => {
    console.log("Request received");
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
    console.log("Request received");
    let codigo = req.body['cedula']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var aero = await Funcionario.find({'cedula':codigo}).exec();
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
    console.log("Request received");
    let codigo = req.body['cedula']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Funcionario.deleteOne({'cedula':codigo}).exec();
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
    console.log("Request received");
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
    console.log("Request received");
    let codigo = req.body['id']
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Aerolinea.find({'id':codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.get("/CRUDS/GetAerolinea_todos", async (req, res) => {
    console.log("Request received");
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
    console.log("Request received");
    let codigo = req.body['id']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var aero = await Aerolinea.find({'id':codigo}).exec();
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
    console.log("Request received");
    let codigo = req.body['id']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Aerolinea.deleteOne({'id':codigo}).exec();
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
    console.log("Request received");
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
    console.log("Request received");
    let codigo = req.body['codigoVuelo']
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Vuelo.find({'codigoVuelo':codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});
//todo esto en un solo API
//GetVuelo x rango de fechas //Si el mae pone Any entonces minDate = 2000 y maxDate = 2030
//Get Vuelo x origen y destino  //Si elige any yo hago if-else


server.post("/CRUDS/GetVuelo_fechasxlugares", async (req, res) => {
    console.log("Request received");
    //let codigo = req.body['codigoVuelo']
    let minDate = new Date(req.body['minDate']);
    let maxDate = new Date(req.body['maxDate']);
    let origen = req.body['origen'];
    let destino = req.body['destino'];
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var vueloArray = await Vuelo.find().exec();
        //console.log(vueloArray);
        let vuelosIn = [];
        vueloArray.forEach(function(vuelo){
            //console.log(vuelo);
            let vueloDate = new Date(vuelo['fechaVuelo']);
            let vueloDestino = vuelo['destino'];
            let vueloOrigen = vuelo['origen'];
            console.log(vueloDate);
            console.log(minDate);
            console.log(maxDate);
            if (vueloDate <= maxDate && vueloDate >= minDate){
                console.log("Dentro del rango de fechas");
                if (origen == "Any"){
                    if (destino == "Any"){
                        vuelosIn.push(vuelo);
                    }else{
                        if (vueloDestino == destino){
                            vuelosIn.push(vuelo);
                        }
                    }
                }else{
                    if (vueloOrigen == origen){
                        if (destino == "Any"){
                            vuelosIn.push(vuelo);
                        }else{
                            if (vueloDestino == destino){
                                console.log("Detino y Origen coinciden");
                                vuelosIn.push(vuelo);
                            }
                        }
                    }
                }
            }
        });
        success = {'Codigo':true,'Contenido':vuelosIn}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});


server.get("/CRUDS/GetVuelo_todos", async (req, res) => {
    console.log("Request received");
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
    console.log("Request received");
    let codigo = req.body['codigoVuelo']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var aero = await Vuelo.find({'codigoVuelo':codigo}).exec();
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
    console.log("Request received");
    let codigo = req.body['codigoVuelo']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Vuelo.deleteOne({'codigoVuelo':codigo}).exec();
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
    console.log("Request received");
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
    console.log("Request received");
    let codigo = req.body['cedula']
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Pasajero.find({'cedula':codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.get("/CRUDS/GetPasajero_todos", async (req, res) => {
    console.log("Request received");
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
    console.log("Request received");
    let codigo = req.body['cedula']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var aero = await Pasajero.find({'cedula':codigo}).exec();
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
    console.log("Request received");
    let codigo = req.body['cedula']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Pasajero.deleteOne({'cedula':codigo}).exec();
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
    console.log("Request received");
    let success;
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    try {
        var isThereCompra = await Compra.find({'idPasajero':req.body['idPasajero'],'codigoVuelo':req.body['codigoVuelo']}).exec();
        console.log(isThereCompra);
        //aero = aero[0].set(req.body);
        //console.log(aero)
        //var response = await aero.save();
        let tempTickets = req.body['cantidadBoletos'];
        let arrayEstado = [];
        let arrayAsientos = [];
        let entropy = new Entropy()
        let string = entropy.string()
        req.body['codigoCompra'] = string;
        let date = new Date();
        date = date.toISOString();
        if (isThereCompra != ""){
            compra = isThereCompra[0];
            req.body['cantidadBoletos'] = parseInt(compra['cantidadBoletos']) + parseInt(req.body['cantidadBolestos']);
            arrayAsientos = compra['asientos'];
            arrayEstado = compra['estado'];
            req.body['codigoCompra'] = compra['codigoCompra'];
            date = req.body['fechaCompra'];
        }
        req.body['fechaCompra'] = date;
        let compraBody = req.body;
        for (i = 0; i < parseInt(tempTickets);i++){
            arrayEstado.push("Bought");
            arrayAsientos.push(0);
        }
        compraBody['estado'] = arrayEstado;
        compraBody['asientos'] = arrayAsientos;
        if (isThereCompra == ""){
            let newCompra = new Compra(compraBody);
            response = await newCompra.save();
        }else{
            compra = compra.set(compraBody);
            response = await compra.save();
        }
        success = {'Codigo':true,'Contenido':response}
        
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/GetCompra_codigo", async (req, res) => {
    console.log("Request received");
    let codigo = req.body['codigoCompra']
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Compra.find({'codigoCompra':codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/GetCompra_pasajero", async (req, res) => {
    console.log("Request received");
    let codigo = req.body['idPasajero']
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Compra.find({'idPasajero':codigo}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.post("/CRUDS/GetCompra_pasajeroXvuelo", async (req, res) => {
    console.log("Request received");
    let codigo = req.body['codigoVuelo']
    let cedula = req.body['idPasajero']
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Compra.find({'codigoVuelo':codigo,'idPasajero':cedula}).exec();
        success = {'Codigo':true,'Contenido':response}
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});


server.get("/CRUDS/GetCompra_todos", async (req, res) => {
    console.log("Request received");
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
    console.log("Request received");
    let codigo = req.body['codigoCompra']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var aero = await Compra.find({'codigoCompra':codigo}).exec();
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
    console.log("Request received");
    let codigo = req.body['codigoCompra']
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Compra.deleteOne({'codigoCompra':codigo}).exec();
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
    console.log("Request received");
    let success;
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
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
    console.log("Request received");
    let success;
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
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
    console.log("Request received");
    let codigo = req.body['codigoVuelo']
    let cedula = req.body['idPasajero']
    let numCheck = parseInt(req.body['cantChecked']);
    let tempCheck = numCheck;
    //var db = mongoose.connection;
    mongoose.connect(masterdb, {useNewUrlParser: true}); //Usa master por los updates
    console.log("Connected to mongodb");
    let success;
    try {
        var aero = await Compra.find({'codigoVuelo':codigo,'idPasajero':cedula}).exec();
        //console.log(aero)
        aero = aero[0]
        let tempArray = aero['estado'];
        let tempAsientos = aero['asientos'];
        let vuelo = await Vuelo.find({'codigoVuelo':codigo}).exec();
        vuelo = vuelo[0];
        let asientosDisponibles = parseInt(vuelo['asientosDisponibles']);
        let capacidadMaxima = parseInt(vuelo['capacidadMaxima']);
        if (asientosDisponibles == 0){
            success = {'Codigo':false,'Contenido':405} //405: el vuelo no tiene suficientes asientos (seria raro que ocurra)
        }else{
            let numAsientos = capacidadMaxima - asientosDisponibles;
            for (i = 0; i < tempArray.length; i++){
                if (tempArray[i] == "Bought" && numCheck != 0){
                    tempAsientos[i] = ++numAsientos;
                    tempArray[i] = "checkedIn";
                    numCheck--;
                }
            }
            if (numCheck != 0){
                success = {'Codigo':false,'Contenido':404} //404: no tiene suficientes bolestos para la cantidad que esta haciendo check in
            }else{
                let aerobody = aero;
                aerobody['estado'] = tempArray;
                aerobody['asientos'] = tempAsientos;
                vuelo['asientosDisponibles'] = asientosDisponibles - tempCheck;
                aero = aero.set(aerobody);
                let codigo = aero['codigoCompra'];
                var response = aero.findOneAndUpdate({'codigoCompra':codigo}, aero, {upsert:true});
                //var response = await aero.save();
                var response2 = await vuelo.save();
                success = {'Codigo':true,'Contenido':tempAsientos}  //Devuelve el array con los asientos
            }
        }
    } catch (error) {
        success = {'Codigo':false,'Contenido':error}
    }
    mongoose.disconnect();
    res.send(success)
});

server.post("/Pasajeros/vuelosAsociados", async (req, res) => {
    console.log("Request received");
    //Valores necesarios en el body
    let idpasa = req.body['cedula']; //Para ubicar los vuelos
    let minDate = new Date(req.body['minDate']); //Limite inferior del rango de fechas
    let maxDate = new Date(req.body['maxDate']); //Limite superior del rango de fechas
    let estado = req.body['estado']; //Estado del vuelo
    let success;
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    try {
        let userResp = await Compra.find({'idPasajero':idpasa}).exec();
        if (userResp == ""){
            success = {'Codigo':false,'Contenido':'404v'} //No tiene vuelos asociados
        } else {
            
            let vueloArray = [];
            let vueloJsonArray = [];
            for (i=0;i<userResp.length;i++){
                let comp = userResp[i];
                vueloArray.push(comp['codigoVuelo']);
            }
            let tempVuelo;
            for (j=0;j<vueloArray.length;j++){
                let vuelo = vueloArray[j];
                tempVuelo = await Vuelo.find({'codigoVuelo':vuelo}).exec();
                vueloJsonArray.push(tempVuelo[0]);
            }
            vueloArray = [];
            for (k=0;k<vueloJsonArray.length;k++){
                let vuelojs = vueloJsonArray[k];
                let fechaVuelo = new Date(vuelojs['fechaVuelo'])
                if (fechaVuelo >= minDate && fechaVuelo <= maxDate){
                    if (estado == "Any"){
                        vueloArray.push(vuelojs);
                    }else{
                        if (vuelojs['estado'] == estado){
                            vueloArray.push(vuelojs);
                        }
                    }

                }
            }
            success = {'Codigo':true,'Contenido':vueloArray} //No tiene vuelos asociados
        }
    } catch (error) {
        success = {'Codigo':false,'Contenido':"error"}
    }
    mongoose.disconnect();
    res.send(success)
});
//////////////////////////////////////////////////////////////////////////////////////////////////////
/*---Administrador APIs---------------------------------------------------------------------------------------*/

/*
Para todas las aerolíneas debe mostrar todos los vuelos
junto con la  cantidad  de  boletos  vendidos  en  cada  
uno y el monto total correspondiente a los boletos vendidos.
*/
server.get("/Administrador/ReporteVuelos_cantBoletos_montoVendido", async (req, res) => {
    console.log("Request received");
    let success;
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    try {
        let listAerolineas = await Aerolinea.find().exec();
        let listVuelos = []; //Defintiva (contiene temVuelos x cada aerolinea)
        let listAeros = [];

        for (i = 0; i< listAerolineas.length;i++){
            aerolinea = listAerolineas[i];
            let idAerolinea = aerolinea['id'];
            console.log(idAerolinea);
            let tempVuelos = [] //Contiene cada lista de resultados
            listAeros.push(aerolinea['nombre']);
            let vuelos = await Vuelo.find({'codigoAerolinea':idAerolinea}).exec();
            console.log("antes de vuelos.forEach");
            for (j=0;j< vuelos.length;j++){
                let vuelo = vuelos[j];
                console.log("dentro de vuelos.forEach");
                let tempResults =[]; //contiene los resultados
                let precioVuelo = parseint(vuelo['precio']);
                console.log(precioVuelo);
                tempResults.push(vuelo['codigoVuelo']);
                console.log("antes de compra.find");
                let compras = await Compra.find({'codigoVuelo':vuelo['codigoVuelo']}).exec();
                let tempMoney = 0;
                let tempCount = 0;
                for (k=0;k<compras.length;k++){
                    let compra = compras[k];
                    let cantBols = parseint(compra['cantidadBoletos']);
                    console.log(cantBols);
                    tempMoney = tempMoney + (precioVuelo*cantBols );
                    tempCount = tempCount + cantBols;
                }
                tempResults.push(tempCount);
                tempResults.push(tempMoney);
                tempVuelos.push(tempResults);
            }
            listVuelos.push(tempVuelos)
        }
        success = {'Codigo':true,'Aerolineas':listAeros,'Vuelos':listVuelos}
    } catch (error) {
        success = {'Codigo':false,'Contenido':"error"}
    }
    mongoose.disconnect();
    res.send(success)
});


/*
Rango  de boletos  comprados por  cada pasajero.  
El  rango  va  del menor al mayor número de boletos 
adquiridos por un pasajero. Por ejemplo, si Ana ha 
comprado boletos para 5 vuelos, y se identifica que 
en el vuelo quemenos boletos compró, adquirió uno 
y en el que más boletos compró, adquirió tres, 
entonces su rango será [1,3]
*/

server.post("/Administrador/Pasajero_RangoBoletos", async (req, res) => {
    console.log("Request received");
    let success;
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    try {
        let listPasajeros = await Pasajero.find().exec();
        let pasajeros = [];
        let finalRangos = [];
        for (i=0;i<listPasajeros.length;i++){
            let pasajero = listPasajeros[i];
            pasajeros.push(pasajero['cedula']);
            let listVentas = await Compra.find({'cedula':pasajero['cedula']}).exec();
            let rango = [];
            for (j=0;j<listVentas.length;j++){
                let tempRango = [];
                tempRango.push(listVentas[i]['cantidadBoletos']);
            }
            tempRango.sort(function(a, b){return a-b});
            rango.push([tempRango[0],tempRango.pop()]);
            finalRangos.push(rango);
        }
        success = {'Codigo':true,'Pasajeros':pasajeros,'Rangos':finalRangos}
    } catch (error) {
        success = {'Codigo':false,'Contenido':"error"}
    }
    mongoose.disconnect();
    res.send(success)
});

/*
¿Cuáles son las destinos más visitados? 
Se debe mostrar el nombre de cada destino
y la cantidad de pasajero que han comprado vuelos para esedestino.
*/

server.post("/Administrador/DestinosMasVisitados", async (req, res) => {
    console.log("Request received");
    let success;
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    try {
        let allVuelos = await Vuelo.find().exec();
        let destinos = [];
        let totales = [];
        for (i=0;i<allVuelos.length;i++){
            let vuelo = allVuelos[i]
            let destinoIndex = destinos.indexOf(vuelo['destino']);
            let amountPasajeros = 0;
            let amountTicketes = 0;
            if ( destinoIndex == -1){ //Si el destino no existe (no tiene indice en la lista) 
                destinos.push(vuelo['destino']); //Añade el destino al final de la lista
                totales.push([0,0]); //Para cada destino añade a totales una lista con dos elementos: [amountTicketes,amountPasajeros]
            }
            //Si el destino ya existe en la lista es innecesario añadir nada mas
            destinoIndex = destinos.indexOf(vuelo['destino']); //obtenemos el indice de nuevo (por seguridad)
            let compras = await Compra.find({'codigoVuelo':vuelo['codigoVuelo']}); //obtenemos todas las compras para este vuelo
            amountPasajeros = compras.length; //Como cada pasajero tiene una sola compra por vuelo esto sirve
            for (j = 0;j<amountPasajeros;j++){ //Para cada compra
                amountTicketes += parseInt(compras[j]['cantidadBoletos']); //acumulamos la cantidad de boletos
            }
            totales[destinoIndex][0] += amountTicketes; //Añadimos a la lista de totales al campo 0 de la posicion correspondiente al destino
            totales[destinoIndex][1] += amountPasajeros; //Añadimos a la lista de totales al campo 1 de la posicion correspondiente al destino
        }
        //Los indices de destinos coinciden con los de totales, esto pues cada entrada en totales corresponde al destino del mismo indice
        success = {'Codigo':true,'Destinos':destinos,'Totales':totales} //destinos lleva la lista de destinos y totales lleva la lista de listas de los valores correspondiente a los destinos
    } catch (error) {
        success = {'Codigo':false,'Contenido':"error"}
    }
    mongoose.disconnect();
    res.send(success)
});


/*
*Cantidad  de operaciones  de  compra  de  boletos registradas  en  el sistema,
*esta  información  se  puede filtrar  por pasajero, por rango de fechas, 
*por estado de vuelo. También mostrar los tres pasajeroscon más vuelos adquiridos.
*/

server.post("/Administrador/CantidadCompras", async (req, res) => {
    console.log("Request received");
    let success;
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    try {

        //Los indices de destinos coinciden con los de totales, esto pues cada entrada en totales corresponde al destino del mismo indice
        success = {'Codigo':true,'Destinos':destinos,'Totales':totales} //destinos lleva la lista de destinos y totales lleva la lista de listas de los valores correspondiente a los destinos
    } catch (error) {
        success = {'Codigo':false,'Contenido':"error"}
    }
    mongoose.disconnect();
    res.send(success)
});

//////////////////////////////////////////////////////////////////////////////////////////////////////
/*---Funcionario APIs---------------------------------------------------------------------------------------*/

 server.listen(process.env.PORT || port, () => {
    //var port = server.address().port;
    console.log("Server listening on port",port);
 });