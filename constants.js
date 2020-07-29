require("dotenv").config();
("use strict");

const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PWD || "root",
  database: process.env.DB_DATABASE || "employee_TrackerDB",
};

// const TASK_CHOICES = [
//   "View All Employees",
//   "Add Employee",
//   "View All Employees by Department",
//   "View All Employees by Manager",
//   "Remove Employee",
//   "Update Employee Role",
//   "Update Employee Manager",
//   "View All Roles",
//   "Define New Role",
//   "Create Department",
//   "Exit Application",
// ];
const CREATE_DEPARTMENT_QUESTIONS = [
  {
    name: "name",
    type: "input",
    message: "What is the name of this NEW department? ",
  },
];

const REMOVE_EMPLOYEE_QUESTION = [
  {
    name: "id",
    type: "input",
    message: "Enter the ID of the Employee you want to remove (fire!):",
    validate: function validateNumber(id) {
      if (isNaN(id)) {
        console.error("\n***Error***\nNumber expected");
        return false;
      } else return true;
    },
  },
];


module.exports = {
  DB_CONFIG,
  CREATE_DEPARTMENT_QUESTIONS,
  REMOVE_EMPLOYEE_QUESTION,
};