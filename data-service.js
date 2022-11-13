const fs = require("fs");

var employees = [];
var managers = [];
var departments = [];

function initialize(){
    return new Promise(function(resolve, reject){
        fs.readFile('./data/employees.json',(err,data)=>{
            if (err) {
                reject("Failure to read file employees.json!");
                //employees = JSON.parse(data);
            } else{ 
                employees = JSON.parse(data);
                fs.readFile('./data/departments.json',(err,data)=>{
                    if (err) {
                        reject("Failure to read file departments.json!");                            
                    } else{
                        departments = JSON.parse(data);
                        resolve("Success!");
                        }
                    });
                };
        });
    });
};

function getAllEmployees(){
    return new Promise(function(resolve, reject){
        if(employees.length == 0){
            reject("no results returned");
        }
        else{
            resolve(employees);
        }
    });
};

function getManagers(){
    return new Promise(function(resolve, reject){
        for(var i=0; i<employees.length; i++){
            if(employees[i].isManager == true){
                managers.push(employees[i]); 
            }
        }
        if(managers.length == 0){
            reject("no results returned");
        }
        resolve(managers);
    });
};

function getDepartments(){
    return new Promise(function(resolve, reject){
        if(departments.length == 0){
            reject("no results returned");
        }
        else{
            resolve(departments);
        }
    });
};


function addEmployee(employeeData){
    //var employeeNum = employees.length;
    return new Promise(function(resolve, reject){
        
        if(employeeData.isManager == undefined){
            employeeData.isManager == false;
        }
        else{
            employeeData.isManager == true;
        }
    employeeData.employeeNum = employees.length + 1;
    employees.push(employeeData);
    resolve();
    });
};

function getEmployeeByStatus(status){
    return new Promise(function(resolve, reject){
        var array_employee = [];
        for(var i=0; i<employees.length; i++){
            if(employees[i].status == status){
                array_employee.push(employees[i]);
            }
        }
        if(array_employee == 0){
            reject("no results returned");
        }
        resolve(array_employee);
    });
};


function getEmployeeByDepartment(department){
    return new Promise(function(resolve, reject){
        var department_employee = [];
        for(var i=0; i<employees.length; i++){
            if(employees[i].department == department){
                department_employee.push(employees[i]);
            };
        }
        if(department_employee == 0){
            reject("no results returned");
        }
        resolve(department_employee);
    });
};

function getEmployeeByManager(manager){
    return new Promise(function(resolve, reject){
        var manager_employee = [];
        for(var i=0; i<employees.length; i++){
            if(employees[i].employeeManagerNum == manager){
                manager_employee.push(employees[i]);
            };
        }
        if(manager_employee == 0){
            reject("no results returned");
        }
        resolve(manager_employee);
    });
};


function getEmployeeByNum(num){
    return new Promise(function(resolve, reject){
        var single_employee;

        for(var i=0; i<employees.length; i++){
            if(employees[i].employeeNum == num){
            single_employee = employees[i];
            }
        }

        if(single_employee == null){
            reject("no results returned");
        }
        resolve(single_employee);
    });
};

function updateEmployee(employeeData){
    return new Promise(function(resolve, reject){
        
        const employee = employees.find(employee => employee.employeeNum == employeeData.employeeNum);
        Object.assign(employee, employeeData);
        
        /*
        for(var i=0; i<employees.length; i++){
            if(employees[i].employeeNum == employeeData.employeeNum){
                Object.assign(employees, employeeData);
               // employees[i] = employeeData;
            }
        }
        */
        if(employees == null){
            reject("no results returned");
        }
        
        resolve();
    });
};


module.exports = {
    initialize,
    getAllEmployees,
    getManagers,
    getDepartments,
    addEmployee,
    getEmployeeByStatus,
    getEmployeeByDepartment,
    getEmployeeByManager,
    getEmployeeByNum,
    updateEmployee
};