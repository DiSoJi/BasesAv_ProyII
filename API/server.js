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
 
 var masterdb = 'mongodb://localhost:30001/test' //Remember to change this for an extraction from a file, changed with docker.
 var slavedb = 'mongodb://localhost:30002/test' //Remember to change this for an extraction from a file, changed with docker.
 
 
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
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));

    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Aeropuerto.find({'codigoAeropuerto':codigo}).read('secondary').exec();
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
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb aero_todos");
    let success;
    try {
        var response = await Aeropuerto.find().read('secondary').exec();
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
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Funcionario.find({'cedula':codigo}).read('secondary').exec();
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
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Funcionario.find().read('secondary').exec();
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
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Aerolinea.find({'id':codigo}).read('secondary').exec();
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
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Aerolinea.find().read('secondary').exec();
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
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Vuelo.find({'codigoVuelo':codigo}).read('secondary').exec();
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
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    let success;
    try {
        var vueloArray = await Vuelo.find().read('secondary').exec();
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
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Vuelo.find().read('secondary').exec();
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
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Pasajero.find({'cedula':codigo}).read('secondary').exec();
        let respo = response[0];
        let Decryptedbytes  = CryptoJS.AES.decrypt(respo['contrasena'].toString(), encryptionKey);
        let DecryptedPass = Decryptedbytes.toString(CryptoJS.enc.Utf8);
        respo['contrasena'] = DecryptedPass;
        response[0] = respo;
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
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Pasajero.find().read('secondary').exec();
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
        aero['contrasena'] = CryptoJS.AES.encrypt(aero['contrasena'].toString(), encryptionKey);
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
        let date = new Date();
        date = date.toISOString();
        let compra;
        if (isThereCompra != ""){
            console.log("Theres already a compra like that");
            compra = isThereCompra[0];
            
            req.body['cantidadBoletos'] = parseInt(compra['cantidadBoletos']) + parseInt(req.body['cantidadBoletos']);
            arrayAsientos = compra['asientos'];
            arrayEstado = compra['estado'];
            date = compra['fechaCompra'];
            string = compra['codigoCompra'];
        }
        req.body['codigoCompra'] = string;
        req.body['fechaCompra'] = date;
        //let compraBody = req.body;
        for (i = 0; i < parseInt(tempTickets);i++){
            arrayEstado.push("Bought");
            arrayAsientos.push(0);
        }
        req.body['estado'] = arrayEstado;
        req.body['asientos'] = arrayAsientos;
        if (isThereCompra == ""){
            let newCompra = new Compra(req.body);
            response = await newCompra.save();
        }else{
            ///compra = compra.set(compraBody);
            console.log("req.body");
            console.log(req.body);
            /*
            Compra.updateOne({
                'codigoCompra': req.body['codigoCompra']
              }, {
                $set: { 
                  'estado': req.body['estado'],
                  'asientos': req.body['asientos'],
                  'cantidadBoletos': req.body['cantidadBoletos']
                }
              }, function (err, user) {})*/
            let update = await Compra.findOneAndUpdate({'_id':compra['_id']},{'estado':req.body['estado']});
            update = await Compra.findOneAndUpdate({'_id':compra['_id']},{'asientos':req.body['asientos']});
            update = await Compra.findOneAndUpdate({'_id':compra['_id']},{'cantidadBoletos':req.body['cantidadBoletos']});
            update = await Compra.findOneAndUpdate({'_id':compra['_id']},{'cantidadMaletas':req.body['cantidadMaletas']});
            //response = await compra.save();
            response = req.body;
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
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Compra.find({'codigoCompra':codigo}).read('secondary').exec();
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
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Compra.find({'idPasajero':codigo}).read('secondary').exec();
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
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Compra.find({'codigoVuelo':codigo,'idPasajero':cedula}).read('secondary').exec();
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
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    let success;
    try {
        var response = await Compra.find().read('secondary').exec();
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
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    try {
        let user = req.body['cedula']
        let pass = req.body['contrasena']
        //let newCompra = new Compra(req.body);
        let userResp = await Funcionario.find({'cedula':user}).read('secondary').exec();
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
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    try {
        let user = req.body['cedula']
        let pass = req.body['contrasena']
        //let newCompra = new Compra(req.body);
        let userResp = await Pasajero.find({'cedula':user}).read('secondary').exec();
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
                console.log(aero);
                let codigo = aero['codigoCompra'];
                let update = await Compra.update({
                    'codigoCompra': codigo //if now fails is because of the ''
                  }, {
                    $set: { 
                      "estado": tempArray,
                      "asientos": tempAsientos
                    }
                  }, function (err, user) {})
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
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    try {
        let listAerolineas = await Aerolinea.find().read('secondary').exec();
        let listVuelos = []; //Defintiva (contiene temVuelos x cada aerolinea)
        let listAeros = [];

        for (i = 0; i< listAerolineas.length;i++){
            aerolinea = listAerolineas[i];
            let idAerolinea = aerolinea['id'];
            console.log(idAerolinea);
            let tempVuelos = [] //Contiene cada lista de resultados
            listAeros.push(aerolinea['nombre']);
            let vuelos = await Vuelo.find({'codigoAerolinea':idAerolinea}).read('secondary').exec();
            console.log("antes de vuelos.forEach");
            for (j=0;j< vuelos.length;j++){
                let vuelo = vuelos[j];
                console.log("dentro de vuelos.forEach");
                let tempResults =[]; //contiene los resultados
                let precioVuelo = parseInt(vuelo['precio']);
                console.log(precioVuelo);
                tempResults.push(vuelo['nombre']);
                console.log("antes de compra.find");
                let compras = await Compra.find({'codigoVuelo':vuelo['codigoVuelo']}).read('secondary').exec();
                let tempMoney = 0;
                let tempCount = 0;
                for (k=0;k<compras.length;k++){
                    let compra = compras[k];
                    let cantBols = parseInt(compra['cantidadBoletos']);
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
        success = {'Codigo':true,'Contenido':{'Aerolineas':listAeros,'Vuelos':listVuelos}}
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
en el vuelo que menos boletos compró, adquirió uno 
y en el que más boletos compró, adquirió tres, 
entonces su rango será [1,3]
*/

server.get("/Administrador/Pasajero_RangoBoletos", async (req, res) => {
    console.log("Request received");
    let success;
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    try {
        let listPasajeros = await Pasajero.find().read('secondary').exec();
        let pasajeros = [];
        let rango = [];
        for (i=0;i<listPasajeros.length;i++){
            let pasajero = listPasajeros[i];
            console.log(pasajero);
            let tempCedNombre = pasajero['cedula'].toString().concat(" - ");
            console.log(tempCedNombre);
            tempCedNombre = tempCedNombre.concat(pasajero['nombreCompleto']);
            pasajeros.push(tempCedNombre);
            console.log("Before listVentas");
            let listVentas = await Compra.find({'idPasajero':pasajero['cedula']}).read('secondary').exec();
            console.log("After listVentas");
            let tempRango = [];
            for (j=0;j<listVentas.length;j++){
                console.log("Inside for listVentas");
                tempRango.push(parseInt(listVentas[j]['cantidadBoletos']));
            }
            console.log("Before sort");
            console.log(tempRango);
            tempRango.sort(function(a, b){
                return a-b;
            });
            console.log("After sort");
            rango.push([tempRango[0],tempRango.pop()]);
        }
        success = {'Codigo':true,'Contenido':{'Pasajeros':pasajeros,'Rangos':rango}}
    } catch (error) {
        success = {'Codigo':false,'Contenido':"error"}
    } 
    mongoose.disconnect();
    res.send(success)
});

/*
¿Cuáles son las destinos más visitados? 
Se debe mostrar el nombre de cada destino
y la cantidad de pasajero que han comprado vuelos para ese destino.
*/

server.get("/Administrador/DestinosMasVisitados", async (req, res) => {
    console.log("Request received");
    let success;
    //var db = mongoose.connection;
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    try {
        let allVuelos = await Vuelo.find().read('secondary').exec();
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
            let compras = await Compra.find({'codigoVuelo':vuelo['codigoVuelo']}).read('secondary').exec(); //obtenemos todas las compras para este vuelo
            amountPasajeros = compras.length; //Como cada pasajero tiene una sola compra por vuelo esto sirve
            for (j = 0;j<amountPasajeros;j++){ //Para cada compra
                amountTicketes += parseInt(compras[j]['cantidadBoletos']); //acumulamos la cantidad de boletos
            }
            totales[destinoIndex][0] += amountTicketes; //Añadimos a la lista de totales al campo 0 de la posicion correspondiente al destino
            totales[destinoIndex][1] += amountPasajeros; //Añadimos a la lista de totales al campo 1 de la posicion correspondiente al destino
        }
        /* //In case of deciding to order here is this shit
        totales.sort(function(first, second) {
            return second[0] - first[0];
        });*/
        //Los indices de destinos coinciden con los de totales, esto pues cada entrada en totales corresponde al destino del mismo indice
        success = {'Codigo':true,'Contenido':{'Destinos':destinos,'Totales':totales}} //destinos lleva la lista de destinos y totales lleva la lista de listas de los valores correspondiente a los destinos
    } catch (error) {
        success = {'Codigo':false,'Contenido':"error"}
    }
    mongoose.disconnect();
    res.send(success)
});


/*
*Cantidad  de operaciones  de  compra  de  boletos registradas  en  el sistema,
*esta  información  se  puede filtrar  por pasajero, por rango de fechas, 
*por estado de vuelo. También mostrar los tres pasajeros con más vuelos adquiridos.
*/

server.post("/Administrador/CantidadCompras", async (req, res) => {
    console.log("Request received");
    let minDate = req.body['minDate'];
    let maxDate = req.body['maxDate'];
    minDate = new Date(minDate);
    maxDate = new Date(maxDate);
    let estado = req.body['estado'];
    let pasajero = req.body['idPasajero'];
    let success;
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    try {
        let compras = await Compra.find().read('secondary').exec();
        let arrayComprasinDate = [];
        let arrayComprasforClient = [];
        for (i = 0;i<compras.length;i++){ //Para cada compra
            let compra = compras[i]; //Extrae la compra
            let compraFecha = new Date(compra['fechaCompra']);
            if (compraFecha<=maxDate && compraFecha>=minDate){ //Si esta en el rango de fechas
                if (estado == "Any"){ //Si no importa el estado
                    arrayComprasinDate.push(compra); //Lo mete a la lista de vuelos que estan en el rango y el estado
                    if (pasajero == compra['idPasajero']){ //Si cumple con el idPasajero lo mete a la lista de los que cumplen
                        arrayComprasforClient.push(compra); //aqui lo mete
                    } else{
                        if (pasajero == 'Any'){ //Si no importa el id del pasajer lo mete
                            arrayComprasforClient.push(compra);
                        }
                    }
                } else{ //Ahora, si el estado si importa
                    let vuelo = await Vuelo.find({'codigoVuelo':compra['codigoVuelo']}).read('secondary').exec(); //Se extrae el vuelo
                    vuelo = vuelo[0]; //Se cada el vuelo (viene en una lista con un solo elemento)
                    if (vuelo['estado'] == estado){ //Si el estado del vuelo es el que buscamos
                        arrayComprasinDate.push(compra); //Lo mete a los que cumplen rango de fechas y estado
                        if (pasajero == compra['idPasajero']){ //Si cumple con el idPasajero lo mete a la lista de los que cumplen
                            arrayComprasforClient.push(compra); //aqui lo mete
                        } else{
                            if (pasajero == 'Any'){ //Si no importa el id del pasajero lo mete
                                arrayComprasforClient.push(compra);
                            }
                        }
                    }
                }
                
            }
        }
        //Una vez aqui ya se tiene lo primero que se desea, los datos en el rago de fecha y estado para el pasajero especifico.
        let amountCompras = arrayComprasforClient.length; //Aqui se extrae el tamaño de la lista de compras, lo que nos da el primer dato deseado
        let comprasDict = {};
        for (j=0;j<arrayComprasinDate.length;j++){ //Para cada compra (indiferentemente del usuario)
            tempCompra = arrayComprasinDate[j];
            comprasDict[tempCompra['idPasajero']] = 0;
        }
        for (j=0;j<arrayComprasinDate.length;j++){ //Para cada compra (indiferentemente del usuario)
            tempCompra = arrayComprasinDate[j];
            comprasDict[tempCompra['idPasajero']] = parseInt(comprasDict[tempCompra['idPasajero']]) + parseInt(tempCompra['cantidadBoletos']);
        }
        let items = Object.keys(comprasDict).map(function(key) { //Se crea un arreglo para almacenar el diccionario ordenado
            return [key, comprasDict[key]];
        });
        console.log("before sort");
        items.sort(function(first, second) { //Se ordena por el segundo valor, la funcion propia de items 
            //se asegura que al reordenarlo los valores en el dicionario correspondan a sus respectivas keys
            return second[1] - first[1];
        });
        items = items.slice(0,3); //Se toman solo los primeros 3 (los mejores)
        let finalItems = []
        for (k=0;k<items.length;k++){
            let tempItem = items[k];
            let tempName = await Pasajero.find({'cedula':tempItem[0]}).read('secondary').exec(); //Se extraen los documentos 
            tempName = tempName[0]['nombreCompleto']; //Se toma el nombre
            tempName = tempName.concat(" - "); //Separador
            tempName = tempName.concat(tempItem[0]); //Se le concatena la cedula
            finalItems.push([tempName,tempItem[1]]); //Se mete la tupla al resultado a enviar
        }
        
        success = {'Codigo':true,'Contenido':{'CantidadCompras':amountCompras,'Pasajeros':finalItems}} 
    } catch (error) {
        success = {'Codigo':false,'Contenido':"error"}
    }
    mongoose.disconnect();
    res.send(success)
});

//////////////////////////////////////////////////////////////////////////////////////////////////////
/*---Funcionario APIs---------------------------------------------------------------------------------------*/

/*
* Funcion de Abordaje
*/
server.get("/Funcionario/Abordaje", async (req, res) => {
    console.log("Request received");
    let success;
    //var db = mongoose.connection;
    let codigoVuelo = req.body['codigoVuelo'];
    let cedula = req.body['cedula'];
    mongoose.connect(masterdb, {useNewUrlParser: true});
    console.log("Connected to mongodb");
    try {
        let compras = await Compra.find({'idPasajero':cedula,'codigoVuelo':codigoVuelo}).exec();
        let compra = compras[0];
        let estados = compra['estado'];
        for (i=0;i<estados.length;i++){
            if (estados[i] == "checkedIn"){
                estados[i] = "Used";
            }
        }
        compra['estado'] = estados;
        let codigo = compra['codigoCompra'];
        let update = await Compra.update({
            'codigoCompra': codigo
          }, {
            $set: { 
              "estado": estados
            }
          }, function (err, user) {})
        success = {'Codigo':true,'Contenido':compra} //destinos lleva la lista de destinos y totales lleva la lista de listas de los valores correspondiente a los destinos
    } catch (error) {
        success = {'Codigo':false,'Contenido':"error"}
    }
    mongoose.disconnect();
    res.send(success)
});

/*
* Vuelosregistrados  en  el  sistema:  se  muestra  un 
* listado  con  la información de los vuelos registrados. 
* Se puede filtrar por rango de fechas,  por  estado, por  
* nombre  de  pasajero.  Para  cada vuelose debe mostrar el detalle
*/

server.post("/Funcionario/Vuelos", async (req, res) => {
    console.log("Request received");
    let minDate = req.body['minDate'];
    let maxDate = req.body['maxDate'];
    minDate = new Date(minDate);
    maxDate = new Date(maxDate);
    let estado = req.body['estado'];
    let pasajero = req.body['idPasajero'];
    let success;
    let finalVuelos = [];
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    try {
        if (pasajero == "Any"){
            let vuelos = await Vuelo.find().read('secondary').exec();
            for (i = 0;i <vuelos.length;i++){
                let vuelo = vuelos[i];
                fechaVuelo = new Date(vuelo['fechaVuelo']);
                if (fechaVuelo >= minDate && fechaVuelo <= maxDate){
                    if (estado == "Any"){
                        finalVuelos.push(vuelo);
                    }else{
                        if (vuelo['estado'] == estado){
                            finalVuelos.push(vuelo);
                        }
                    }
                }
            }
            
        }else{
            let compras = await Compra.find({'idPasajero':pasajero}).read('secondary').exec();
            for (i = 0;i< compras.length;i++){
                let compra = compras[i];
                let vuelo = await Vuelo.find({'codigoVuelo':compra['codigoVuelo']}).read('secondary').exec();
                vuelo = vuelo[0];
                let fechaVuelo = new Date(vuelo['fechaVuelo']);
                if (fechaVuelo >= minDate && fechaVuelo <= maxDate){
                    if (estado == "Any"){
                        finalVuelos.push(vuelo);
                    }else{
                        if (vuelo['estado'] == estado){
                            finalVuelos.push(vuelo);
                        }
                    }
                }
            }
        }
        success = {'Codigo':true,'Contenido':finalVuelos} 
    } catch (error) {
        success = {'Codigo':false,'Contenido':"error"}
    }
    mongoose.disconnect();
    res.send(success)
});


//////////////////////////////////////////////////////////////////////////////////////////////////////
/*---testing APIs (Remember to delete from production---------------------------------------------------------------------------------------*/

server.get("/Test/test1", async (req, res) => {
    console.log("Request received");
    let success;
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    try {
        let compras = await Compra.find().read('secondary').exec();
        let arrayComprasinDate = [];
        //let arrayComprasforClient = [];
        for (i=0;i<compras.length;i++){
            arrayComprasinDate.push(compras[i]);
        }

        let comprasDict = {};
        for (j=0;j<arrayComprasinDate.length;j++){ //Para cada compra (indiferentemente del usuario)
            tempCompra = arrayComprasinDate[j];
            comprasDict[tempCompra['idPasajero']] = 0;
        }
        for (j=0;j<arrayComprasinDate.length;j++){ //Para cada compra (indiferentemente del usuario)
            tempCompra = arrayComprasinDate[j];
            comprasDict[tempCompra['idPasajero']] = parseInt(comprasDict[tempCompra['idPasajero']]) + parseInt(tempCompra['cantidadBoletos']);
        }
        console.log("before items array");
        // Create items array
        let items = Object.keys(comprasDict).map(function(key) {
            return [key, comprasDict[key]];
        });
        console.log("before sort");
        // Sort the array based on the second element
        items.sort(function(first, second) {
            return second[1] - first[1];
        });
        
        // Create a new array with only the first 5 items
        console.log(items.slice(0, 3));
        items = items.slice(0,3);
        let finalItems = []
        for (k=0;k<items.length;k++){
            let tempItem = items[k];
            let tempName = await Pasajero.find({'cedula':tempItem[0]}).read('secondary').exec();
            tempName = tempName[0]['nombreCompleto'];
            tempName = tempName.concat(" - ");
            tempName = tempName.concat(tempItem[0]);
            finalItems.push([tempName,tempItem[1]]);
        }
        success = {'Codigo':true,'Contenido':finalItems} 
    } catch (error) {
        success = {'Codigo':false,'Contenido':"error"}
    }
    mongoose.disconnect();
    res.send(success)
});


server.get("/Test/test2", async (req, res) => {
    console.log("Request received");
    let success;
    mongoose.connect(slavedb, {useNewUrlParser: true}).catch(error =>  mongoose.connect(masterdb, {useNewUrlParser: true}));
    console.log("Connected to mongodb");
    try {
        let keys = ["agua","perro","gato","iguana","Ramiro"];
        let Totales = [[0,0],[5,1],[4,1],[8,1],[6,3]]
        let dic = {};
        //for (i=0;)
        console.log("before items array");
        // Create items array
        let items = Object.keys(Totales).map(function(key) {
            return [key, Totales[key]];
        });
        console.log("before sort");
        // Sort the array based on the second element
        Totales.sort(function(first, second) {
            return second[0] - first[0];
        });
        
        // Create a new array with only the first 5 items
        //console.log(items.slice(0, 3));
        items = Totales
        //let finalItems = []
        /*for (k=0;k<items.length;k++){
            let tempItem = items[k];
            let tempName = await Pasajero.find({'cedula':tempItem[0]}).exec();
            tempName = tempName[0]['nombreCompleto'];
            tempName = tempName.concat(" - ");
            tempName = tempName.concat(tempItem[0]);
            finalItems.push([tempName,tempItem[1]]);
        }*/
        success = {'Codigo':true,'Contenido':items} 
    } catch (error) {
        success = {'Codigo':false,'Contenido':"error"}
    }
    mongoose.disconnect();
    res.send(success)
});


//////////////////////////////////////////////////////////////////////////////////////////////////////

 server.listen(process.env.PORT || port, () => {
    //var port = server.address().port;
    console.log("Server listening on port",port);
 });