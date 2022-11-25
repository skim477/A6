/*************************************************************************
* BTI325– Assignment 5
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part * of this assignment has been copied manually or electronically from any
other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Seongjun Kim   Student ID: 157681206   Date: Nov 27, 2022
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
    res.render("departments", {message: "no results"});
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
      }).catch(()=>{
        //res.json({message: err});
        res.render("employees",{message: "no results"});
      });
    }

    else if(req.query.department){
      dataService.getEmployeeByDepartment(req.query.department).then((data)=>{
        console.log("department: " + req.query.department);
        //res.json(data);
        res.render("employees", {employees: data});
      }).catch(()=>{
        //res.json({message: err});
        res.render("employees",{message: "no results"});
      });
    }

    else if(req.query.manager){
      dataService.getEmployeeByManager(req.query.manager).then((data)=>{
        console.log("employeeManagerNum: " + req.query.manager);
        //res.json(data);
        res.render("employees", {employees: data});
      }).catch(()=>{
        //res.json({message: err});
        res.render("employees",{message: "no results"});
      });
    }

    else{
        dataService.getAllEmployees().then((data)=>{
        res.render("employees", {employees: data});
        }).catch(()=>{
            res.render("employees",{message: "no results"});
          });
    };

  });
/*
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
*/

app.get("/employee/:empNum", (req, res) => {
  // initialize an empty object to store the values
  let viewData = {};

  dataService.getEmployeeByNum(req.params.empNum).then((data) => {
    if (data) {
      viewData.employee = data; //store employee data in the "viewData" object as "employee"
    } else {
      viewData.employee = null; // set employee to null if none were returned
    }
  }).catch(() => {
    viewData.employee = null; // set employee to null if there was an error
  }).then(dataService.getDepartments)
  .then((data) => {
    viewData.departments = data; // store department data in the "viewData" object as "departments"

  // loop through viewData.departments and once we have found the departmentId that matches
  // the employee's "department" value, add a "selected" property to the matching
  // viewData.departments object

    for (let i = 0; i < viewData.departments.length; i++) {
      if (viewData.departments[i].departmentId == viewData.employee.department) {
        viewData.departments[i].selected = true;
      }
    }

  }).catch(() => {
    viewData.departments = []; // set departments to empty if there was an error
  }).then(() => {
    if (viewData.employee == null) { // if no employee - return an error
      res.status(404).send("Employee Not Found");
    } else {
      res.render("employee", { viewData: viewData }); // render the "employee" view
    }
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
   res.redirect("/images");
});


app.get("/images", function(req,res){
  fs.readdir("./public/images/uploaded", function(err, items){
    res.render("images", {images: items});
  });
});


app.post("/employees/add", (req,res)=>{
  dataService.addEmployee(req.body).then(dataService.getDepartments(req.body)).then((data)=>{
    res.render("addEmployee", {departments: data});
  }).then(()=>{
  res.redirect("/employees");
  }).catch(()=>{
    res.render("addEmployee", {departments: []});
  })
});


app.post("/employee/update", (req, res) => {
  dataService.updateEmployee(req.body).then(()=>{
      res.redirect("/employees");
  }).catch((err)=>{
    res.status(500).send("Unable to update Employee");
    });
});


app.get("/departments/add", (req, res) => {
  res.render("addDepartment");
});

app.post("/departments/add", (req,res)=>{
  dataService.addDepartment(req.body).then(()=>{
  res.redirect("/departments");
  }).catch((err)=>{
    res.status(500).send("Unable to add Department");
    });
});

app.post("/department/update", (req, res) => {
  dataService.updateDepartment(req.body).then(()=>{
      console.log(req.body);
      res.redirect("/departments");
  }).catch((err)=>{
    res.status(500).send("Unable to Update Department");
    });
});

app.get("/department/:departmentId", function(req,res){
  if(req.params.departmentId){
    dataService.getDepartmentById(req.params.departmentId).then((data)=>{
      res.render("department", {department: data});
    }).catch((err)=>{
      res.status(404).send("Department Not Found"); 
    });
  };
});

app.get("/employees/delete/:empNum", (req, res) => {
  dataService.deleteEmployeeByNum(req.params.empNum).then(()=>{
    res.redirect("/employees");
  }).catch((err)=>{
    res.status(500).send("Unable to Remove Employee / Employee not found");
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

