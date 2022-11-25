const Sequelize = require('sequelize');
/*
var sequelize = new Sequelize('database','user','password',{
    host: 'host',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    },
    query:{raw:true} //update here. You need it.
});
*/
var sequelize = new Sequelize('zpagdzfb','zpagdzfb','oecWwQcX_tL4JUGwk68KbnPmpI2NNSyz',{
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    },
     
   /*
   dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // <<<<<<< YOU NEED THIS
          //https://github.com/brianc/node-postgres/issues/2009 
        }
      },
     */ 
    query:{raw:true} //update here. You need it.

});

sequelize.authenticate().then(()=> console.log('Connection success.'))
.catch((err)=>console.log("Unable to connect to DB.", err));


var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER, 
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
}, {
    createdAt: false, // disable createdAt
    updatedAt: false // disable updatedAt
});

var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
},{
    createdAt: false, // disable createdAt
    updatedAt: false // disable updatedAt
})


function initialize(){
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function() {
            resolve();
            console.log("success!");
        }).catch(function(error){
            reject("unable to sync the database");
        });
    });
};

function getAllEmployees(){
    return new Promise(function (resolve, reject) {
        Employee.findAll().then(data => {
            resolve(data);
        }).catch(error => {
            reject("no results returned");
        });
    });
};



function getDepartments(){
    return new Promise(function (resolve, reject) {
        Department.findAll().then(data => {
            resolve(data);
        }).catch(error => {
            reject("no results returned");
        });
    });
};


function addEmployee(employeeData){
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for(var i in employeeData){
            i = "" ? null: i;
        };
        Employee.create(employeeData).then(data => {
            resolve(data);
        }).catch(error =>{
           reject("unable to create employee"); 
        })
    });
};

function getEmployeeByStatus(status){
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
                status: status
            }
        }).then(data => {
            resolve(data);
        }).catch(error => {
            reject("no results returned");
        });
    });
};


function getEmployeeByDepartment(department){
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
                departmentId: department
            }
        }).then(data => {
            resolve(data);
        }).catch(error => {
            reject("no results returned");
        });
    });
};

function getEmployeeByManager(manager){
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
                employeeManagerNum: manager
            }
        }).then(data => {
            resolve(data);
        }).catch(error => {
            reject("no results returned");
        });
    });
};


function getEmployeeByNum(empNum){
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
                employeeNum: empNum
            }
        }).then(data => {
            resolve(data[0]);
        }).catch(error => {
            reject("no results returned");
        });
    });
};

function updateEmployee(employeeData){
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for(var i in employeeData){
            i = "" ? null: i;
        };
        Employee.update(employeeData, {
            where: {
                employeeNum: employeeData.employeeNum
            }
        }).then(data => {
            resolve(data);
        }).solve(error => {
            reject("unable to update employee");
        });
    });
};

function addDepartment(departmentData){
    return new Promise(function (resolve, reject) {
        for(var i in departmentData){
            i = "" ? null: i;
        };
        Department.create(departmentData).then(data => {
            resolve(data);
        }).catch(error =>{
           reject("unable to create department"); 
        })
    });
};

function updateDepartment(departmentData){
    return new Promise(function (resolve, reject) {
        for(var i in departmentData){
            i = "" ? null: i;
        };
        Department.update(departmentData, {
            where: {
                departmentId: departmentData.departmentId
            }
        }).then(data => {
            resolve(data);
        }).catch(error =>{
           reject("unable to update department"); 
        })
    });
};

function getDepartmentById(id){
    return new Promise(function (resolve, reject) {
        Department.findAll({
            where: {
                departmentId: id
            }
        }).then(data => {
            resolve(data[0]);
        }).catch(error => {
            reject("no results returned");
        });
    });
};

function deleteEmployeeByNum(empNum){
    return new Promise(function (resolve, reject) {

        Employee.destroy(empNum, {
            where: {
                employeeNum: empNum
            }
        }).then(() => {
            resolve("deleted");
        }).catch(error =>{
           reject("unable to delete employee"); 
        })
    });
};

module.exports = {
    initialize,
    getAllEmployees,
    getDepartments,
    addEmployee,
    getEmployeeByStatus,
    getEmployeeByDepartment,
    getEmployeeByManager,
    getEmployeeByNum,
    updateEmployee,
    addDepartment,
    updateDepartment,
    getDepartmentById,
    deleteEmployeeByNum
};