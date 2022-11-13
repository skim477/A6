/*************************************************************************
* BTI325– Assignment 4
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part * of this assignment has been copied manually or electronically from any
other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Seongjun Kim   Student ID: 157681206   Date: Nov 10, 2022
*
* Your app’s URL (from heroku) : https://damp-cliffs-07593.herokuapp.com/
*
*************************************************************************/

var express = require("express");
var app = express();
var path = require("path");
const fs = require("fs");
var dataService = require("./data-service.js")
const multer = require("multer");
var exphbs = require("express-handlebars");
//const { json } = require("express");


var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
    });


// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.engine(".hbs", exphbs.engine({
  extname: ".hbs",
  defaultLayer: "main",
  helpers: {
    navLink: function(url, options){
        return '<li' +
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
        '><a href=" ' + url + ' ">' + options.fn(this) + '</a></li>';
        },
    equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
        return options.inverse(this);
        } else {
        return options.fn(this);
        }
        }   
  }
}));

app.set("view engine", ".hbs");

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
    res.redirect("/home");
});

// setup another route to listen on /home
app.get("/home", function(req,res){
    res.render("home");
  });

// setup another route to listen on /about
app.get("/about", function(req,res){
    res.render("about");
  });

app.get("/employees/add", function(req,res){
  res.render("addEmployee");
});
  
app.get("/images/add", function(req,res){
  res.render("addImage");
});

/*
app.get("/departments", function(req,res){
    res.sendFile(path.join(__dirname,"/data/departments.json"));
  });
*/

app.get("/departments", function(req,res){
  dataService.getDepartments().then((data)=>{
    /*return JSON data*/
    //res.json(data);
    res.render("departments", {departments: data});
  }).catch(()=>{
     /* return err message in the JSON format: {message: err}*/
    //res.json({message: err});
    res.render({message: "no results"});
  });
});

  /*
  app.get("/employees", function(req,res){
    res.sendFile(path.join(__dirname,"/data/employees.json"));
  });
*/
 
  app.get("/employees", function(req,res){
    if(req.query.status){
      dataService.getEmployeeByStatus(req.query.status).then((data)=>{
        console.log("Status: " + req.query.status);
        //res.json(data);
        res.render("employees", {employees: data});
      });
    }

    else if(req.query.department){
      dataService.getEmployeeByDepartment(req.query.department).then((data)=>{
        console.log("department: " + req.query.department);
        //res.json(data);
        res.render("employees", {employees: data});
      });
    }

    else if(req.query.manager){
      dataService.getEmployeeByManager(req.query.manager).then((data)=>{
        console.log("employeeManagerNum: " + req.query.manager);
        //res.json(data);
        res.render("employees", {employees: data});
      });
    }

    else{
        dataService.getAllEmployees().then((data)=>{
        //res.json(data);
        res.render("employees", {employees: data});
        }).catch(()=>{
            //res.json({message: err});
            res.render({message: "no results"});
          });
    };

  });

  app.get("/employee/:num", function(req,res){
    if(req.params.num){
      dataService.getEmployeeByNum(req.params.num).then((data)=>{
        //res.json(data);
        res.render("employee", {employee: data});
      }).catch(()=>{
        //res.json({message: err});
        res.render("employee",{message:"no results"}); 
      });
    };
  });

 /*
  app.get("/managers", function(req,res){
    res.sendFile(path.join(__dirname,"/data/employees.json"));
  });
*/

app.get("/managers", function(req,res){
  dataService.getManagers().then((data)=>{
    /*return JSON data*/
    res.json(data);
  }).catch((err)=>{
     /* return err message in the JSON format: {message: err}*/
    res.json({message: err});
  });
});

const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
    }
});

// tell multer to use the diskStorage function for naming files instead of the default.
const upload = multer({ storage: storage });


app.post("/images/add", upload.single("imageFile"), (req, res) => {
  /*
  var formData = req.body;
  let formFile = req.file;
  const dataReceived = " Form data: " + JSON.stringify(req.body) + "<br>" +
                       "File: " + JSON.stringify(formFile) + "<br>" +
                       "<p style='color:red;'> Your user name is: " + formData.userName + "</p> <br>"+
                       "<img src = '/images/uploaded/"+ formFile.filename +"' width=300 height =200/>";
   res.send(dataReceived);
  */
   res.redirect("/images");
});


app.get("/images", function(req,res){
  fs.readdir("./public/images/uploaded", function(err, items){
    //var string = [];
    //string = "images: " + JSON.stringify(items);
    //res.send(string);
    res.render("images", {images: items});
  });
});


app.post("/employees/add", (req,res)=>{
  dataService.addEmployee(req.body).then(()=>{
  res.redirect("/employees");
  });
});


app.post("/employee/update", (req, res) => {
  dataService.updateEmployee(req.body).then(()=>{
      console.log(req.body);
      res.redirect("/employees");
  });
});


// setup http server to listen on HTTP_PORT
// app.listen(HTTP_PORT, onHttpStart);

app.use((req, res)=>{
    res.status(404).send("Page Not Found");
});

dataService.initialize().then(() => { 
  console.log("start the server");
  app.listen(HTTP_PORT, onHttpStart);
}).catch(()=>{ 
  /*output the error to the console */
  console.log("error");
});

