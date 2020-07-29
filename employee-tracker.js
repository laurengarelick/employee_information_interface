
const fs = require("fs");
const inquirer = require("inquirer");
require("dotenv").config();
const mysql = require("mysql");
const readEachLineSync = require("read-each-line-sync");
const util = require("util");
const constants = require("./constants");
const utilities = require("./utilities");
("use strict");

let connection = null;

function initialize() {
  console.clear();
  //console.log(constants.DB_CONFIG);
  connection = mysql.createConnection(constants.DB_CONFIG);
  connection.connect(function (err) {
    if (err) throw err;
    utilities.loadDepartments(connection);
    utilities.loadRoles(connection);
    utilities.loadManagers(connection);
    utilities.loadEmployees(connection);
    utilities.getTask(connection);
  });
}

initialize();