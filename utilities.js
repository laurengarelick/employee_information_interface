// const inqMod = require("./inquirer-module");
const inquirer = require("inquirer");
const util = require("util");
const readlineSync = require("readline-sync");
const mysql = require("mysql");
const constants = require("./constants");

let ROLES = {};
let DEPARTMENTS = {};
let MANAGERS = {};
let EMPLOYEES = {};
// https://codeburst.io/node-js-mysql-and-async-await-6fb25b01b628
// function makeDb(config) {
//   const connection = mysql.createConnection(config);
//   return {
//     query(sql, args) {
//       return util.promisify(connection.query).call(connection, sql, args);
//     },
//     close() {
//       return util.promisify(connection.end).call(connection);
//     },
//     beginTransaction() {
//       return util.promisify(connection.beginTransaction).call(connection);
//     },
//     commit() {
//       return util.promisify(connection.commit).call(connection);
//     },
//     rollback() {
//       return util.promisify(connection.rollback).call(connection);
//     },
//   };
// }
/**
// usage example:
 * 
 * const db = makeDb( config );
 * try {
 *  const someRows = await db.query( 'SELECT * FROM some_table' );
 *  const otherRows = await db.query( 'SELECT * FROM other_table' );
 *   // do something with someRows and otherRows
 * } catch ( err ) {
 *   // handle the error
 * } finally {
 *   await db.close();
 * }
 * 
 * ******* TRANSACTION *******
 * try {
  await db.beginTransaction();
  const someRows = await db.query( 'SELECT * FROM some_table' );
  const otherRows = await db.query( 'SELECT * FROM other_table' );
  // do something with someRows and otherRows
  await db.commit();
} catch ( err ) {
  await db.rollback();
  // handle the error
} finally {
  await db.close();
}
 */

function viewAllEmployees(connection) {
  console.clear();
  console.log("Running viewAllEmployees");
  let query = `select * from employee`;
  query = `select employee.id as id, employee.first_name as fn, employee.last_name as ln, role.title as title,
   department.name as department from employee, role, department where employee.role_id = role.id and 
   role.department_id = department.id order by employee.id`;
  connection.query(query, function (err, result) {
    if (!err) {
      console.log("  Emp. ID     First Name        Last Name            Role          Department");
      console.log("  =======  ===============  =============== ====================  ============");
      if (result.length != 0) {
        for (let index = 0; index < result.length; index++) {
          let res = result[index];
          let id = ("" + res.id).padStart(7, " ");
          let fn = ("" + res.fn).padStart(15, " ");
          let ln = ("" + res.ln).padStart(15, " ");
          let title = ("" + res.title).padStart(20, " ");
          let department = ("" + res.department).padStart(12, " ");
          console.log(`  ${id}  ${fn}  ${ln}  ${title}  ${department}`);
        }
      }
    } else console.log("\n\n***ERROR***\n" + err.sqlMessage + "\n");
    readlineSync.question(`Press "Enter" to continue...`);
    console.clear();
    getTask(connection);
  });
}

function addEmployees(connection) {
  console.clear();
  //loadRoles(connection);
  console.log("Running addEmployees");
  inquirer.prompt(ADD_EMPLOYEE_QUESTIONS).then(function (answer) {
    let fn = capitalizeFirstLetter(answer.firstName);
    let ln = capitalizeFirstLetter(answer.lastName);
    let role = answer.role;
    let roleId = ROLES[role];
    let query = `insert into employee (first_name, last_name, role_id) values ("${fn}","${ln}",${roleId})`;
    //console.log(query);
    connection.query(query, function (err, res) {
      if (err) console.log("****ERROR****" + err.sqlMessage);
      else console.log(`SUCCESS!!! Employee ${ln}, ${fn} (${role}) added!!)`);
      loadEmployees();
      loadManagers();
      readlineSync.question(`Press "Enter" to continue...`);
      console.clear();
      getTask(connection);
    });
  });
}

function viewEmployeeByDepartment(connection) {
  console.clear();
  //console.log(DEPARTMENTS);
  //loadDepartments(connection);
  console.log("Running viewEmployeeByDepartment");
  inquirer.prompt(EMPLOYEE_BY_DEPARTMENT_QUESTION).then(function (answer) {
    let id = DEPARTMENTS[answer.name];
    let query = `SELECT employee.id as id, employee.first_name as fn, employee.last_name as ln, role.title as title FROM employee, role, 
    department where employee.role_id = role.id and role.department_id = department.id and department.id = ${id}`;
    connection.query(query, function (err, res) {
      if (!err) {
        console.log(`******** Employees By Department (${answer.name}) ********`);
        console.log("Emp ID     First Name       Last Name        Title");
        console.log("======  ===============  ===============  ============");
        for (let index = 0; index < res.length; index++) {
          // list the employees that have this employee as manager
          let id = ("" + res[index].id).padStart(6, " ");
          let fn = ("" + res[index].fn).padStart(15, " ");
          let ln = ("" + res[index].ln).padStart(15, " ");
          let title = ("" + res[index].title).padStart(12, " ");
          console.log(`${id}  ${fn}  ${ln}  ${title}`);
        }
      } else console.error("\n****ERROR****" + err.sqlMessage);
      console.log("\n");
      readlineSync.question(`Press "Enter" to continue...`);
      console.clear();
      getTask(connection);
    });
  });
}

function viewEmployeeByManager(connection) {
  console.clear();
  console.log("Running viewEmployeeByManager");
  //console.log(MANAGERS);
  inquirer.prompt(EMPLOYEE_BY_MANAGER_QUESTION).then(function (answer) {
    let id = MANAGERS[answer.name];
    let query = `select * from employee where manager_id = ${id}`;
    connection.query(query, function (err, res) {
      if (!err) {
        console.log(`******** Employees By Manager (${answer.name}) ********`);
        console.log("Emp ID     First Name       Last Name     ");
        console.log("======  ===============  ===============  ");
        for (let index = 0; index < res.length; index++) {
          // list the employees that have this employee as manager
          let id = ("" + res[index].id).padStart(6, " ");
          let fn = ("" + res[index].first_name).padStart(15, " ");
          let ln = ("" + res[index].last_name).padStart(15, " ");
          console.log(`${id}  ${fn}  ${ln}`);
        }
      } else console.error("\n****ERROR****" + err.sqlMessage);
      console.log("\n");
      readlineSync.question(`Press "Enter" to continue...`);
      console.clear();
      getTask(connection);
    });
  });
}

function removeEmployee(connection) {
  console.clear();
  // console.log("Running removeEmployee");
  // get the ID of the employee you want to remove
  inquirer.prompt(constants.REMOVE_EMPLOYEE_QUESTION).then(function (answer) {
    // first check if there is an employee with the same manager id

    let query = `select * from employee where manager_id = ${answer.id}`;
    connection.query(query, function (err, res) {
      // console.log(res);
      if (res.length != 0) {
        console.error(`\n\n***ERROR*** Must first re-assign those managed by this employee:`);
        console.log("Emp ID     First Name       Last Name");
        console.log("======  ===============  ===============");
        for (let index = 0; index < res.length; index++) {
          // list the employees that have this employee as manager
          let id = ("" + res[index].id).padStart(6, " ");
          let fn = ("" + res[index].first_name).padStart(15, " ");
          let ln = ("" + res[index].last_name).padStart(15, " ");
          console.log(`${id}  ${fn}  ${ln}`);
        }
        console.log("\n");
        readlineSync.question(`Press "Enter" to continue...`);
        console.clear();
        getTask(connection);
      } else {
        query = `delete from employee where id = ${answer.id}`;
        connection.query(query, function (err, res) {
          if (err) console.error(`\n\n***ERROR*** \n${err.sqlMessage}`);
          else console.log(`Employee with ID = ${answer.id} successfully removed.`);

          readlineSync.question(`Press "Enter" to continue...`);
          console.clear();
          getTask(connection);
        });
      }
    });
  });
}

function updateEmployeeRole(connection) {
  console.clear();
  console.log("Running updateEmployeeRole");
  inquirer.prompt(UPDATE_EMPLOYEE_ROLE_QUESTIONS).then(function (answer) {
    let employeeId = EMPLOYEES[answer.employee];
    let roleId = ROLES[answer.role];
    let query = `update employee set role_id = ${roleId} where id = ${employeeId}`;
    connection.query(query, function (err, res) {
      if (err) {
        console.log(`\n\n****ERROR**** Unable to update role of "${answer.employee}" to "${answer.role}"`);
      } else {
        console.log(`\n\nSuccessfully updated role of "${answer.employee}" to "${answer.role}"`);
      }
      readlineSync.question(`Press "Enter" to continue...`);
      console.clear();
      getTask(connection);
    });
  });
}

function updateEmployeeManager(connection) {
  console.clear();
  console.log("Running updateEmployeeRole");
  inquirer.prompt(UPDATE_EMPLOYEE_MANAGER_QUESTIONS).then(function (answer) {
    let employeeId = EMPLOYEES[answer.employee];
    let managerId = EMPLOYEES[answer.manager];
    if (employeeId === managerId) managerId = null;
    let query = `update employee set manager_id = ${managerId} where id = ${employeeId}`;
    connection.query(query, function (err, res) {
      if (err) {
        console.log(`\n\n****ERROR**** Unable to update manager of "${answer.employee}" to "${answer.manager}"`);
      } else {
        console.log(`\n\nSuccessfully updated role of "${answer.employee}" to "${answer.manager}"`);
      }
      readlineSync.question(`Press "Enter" to continue...`);
      console.clear();
      getTask(connection);
    });
  });
}
// **********

function viewAllRoles(connection) {
  console.clear();
  console.log("Running viewAllRoles");
  let query = "select * from role";
  connection.query(query, function (err, res) {
    if (!err) {
      // console.log(res);
      console.log("\nDepartments:");
      console.log("          Title               Salary     Manager?  Dept. ID");
      console.log("=========================  ============  ========  ======== ");
      for (let index = 0; index < res.length; index++) {
        let title = ("" + res[index].title).padStart(25, " ");
        let salary = ("" + res[index].salary).padStart(10, " ");
        let isManager = "    No";
        let deptId = ("" + res[index].department_id).padStart(6, " ");
        if (res[index].isManager) isManager = "   Yes";
        console.log(title, "  ", salary, "  ", isManager, "  ", deptId);
      }
    } else console.log("\n\n***ERROR***\n" + err.sqlMessage + "\n");
    readlineSync.question(`Press "Enter" to continue...`);
    console.clear();
    getTask(connection);
  });
}

function defineRole(connection) {
  console.clear();
  console.log("Running defineRole");
  inquirer.prompt(DEFINE_ROLE_QUESTIONS).then(function (answer) {
    let roleName = capitalizeFirstLetter(answer.title);
    let salary = answer.salary;
    let isManager = false;
    if (answer.isManager === "Yes") isManager = true;
    let departmentId = DEPARTMENTS[answer.department];

    if (roleName === null || roleName.length == 0) {
      console.log(`\n\n***ERROR***\n"${roleName}" is an invalid Role name\n`);
      readlineSync.question(`Press "Enter" to continue...`);
      console.clear();
      getTask(connection);
    } else if (isNaN(salary)) {
      console.log(`\n\n***ERROR***\n"${salary}" is an invalid number\n`);
      readlineSync.question(`Press "Enter" to continue...`);
      console.clear();
      getTask(connection);
    } else {
      // check if the role already exists in the database
      let query = `select * from role where title = "${roleName}"`;
      connection.query(query, function (err, res) {
        if (res.length != 0) {
          console.log(`\n\n***ERROR***\n"${roleName}" is already defined\n`);
          readlineSync.question(`Press "Enter" to continue...`);
          console.clear();
          getTask(connection);
        } else {
          query = `insert into role (title, salary, isManager, department_id) values ("${roleName}", ${salary}, ${isManager}, ${departmentId})`;
          // console.log(query);
          connection.query(query, function (err, res) {
            if (err) {
              console.log("\n\n***ERROR*** Unable to create new Role:\n" + err.sqlMessage + "\n");
              readlineSync.question(`Press "Enter" to continue...`);
              console.clear();
              getTask(connection);
            } else {
              console.log(`\n\nSuccessfully create new Role "${roleName}"\n`);
              readlineSync.question(`Press "Enter" to continue...`);
              console.clear();
              loadRoles();
              getTask(connection);
            }
          });
        }
      });
    }
  });
}

function createDepartment(connection) {
  console.clear();
  console.log("Running createDepartment");
  inquirer.prompt(constants.CREATE_DEPARTMENT_QUESTIONS).then(function (answer) {
    //console.log(answer);
    // add new row to department table
    let departmentName = capitalizeFirstLetter(answer.name);
    let query = `insert into department (name) value ("${departmentName}")`;
    connection.query(query, function (err, res) {
      if (!err) {
        console.log(`\nSuccessfully created department "${answer.name}"\n`);
        loadDepartments();
        getTask(connection);
      } else {
        console.log("\n\n***ERROR***\n" + err.sqlMessage + "\n");
        readlineSync.question(`Press "Enter" to continue...`);
        console.clear();
        getTask(connection);
      }
    });
  });
}

function capitalizeFirstLetter(inputString) {
  let retval = inputString;
  if (inputString != null && inputString.trim().length != 0) {
    let arrayVal = inputString.trim().replace(/  /g, " ").split(" ");
    for (let index = 0; index < arrayVal.length; index++) {
      let val = arrayVal[index].toLowerCase();
      val = val.charAt(0).toUpperCase() + val.slice(1);
      arrayVal[index] = val;
    }
    retval = arrayVal.join(" ");
  }
  return retval;
}

function viewAllDepartments(connection) {
  console.clear();
  let query = "select * from department order by id";
  connection.query(query, function (err, res) {
    if (err) {
      console.log(err);
      getTask(connection);
    }
    // console.log(res);
    console.log("\nDepartments:");
    console.log("  Dept. ID       Department Name");
    console.log("============     ===============");
    for (let index = 0; index < res.length; index++) {
      let id = "" + res[index].id;
      let name = "" + res[index].name;
      console.log(id.padStart(12, " "), "   ", name.padStart(15, " "));
    }
    readlineSync.question(`Press "Enter" to continue...`);
    console.clear();
    getTask(connection);
  });
}
function exitApplication(connection) {
  console.clear();
  console.log("\nThank you for using Employee Tracker. Have a good day!!\n\n");
  connection.end();
  process.exit(1);
}

function getTask(connection) {
  inquirer.prompt(TASK_QUESTION).then(function (answer) {
    console.log(answer);
    console.log(TASK_CHOICES_FUNC);
    var func = TASK_CHOICES_FUNC[answer.task];
    console.log(func);
    if (!func) {
      console.log("ERROR!! Invalid choice");
      getTask(connection);
    }
    func(connection);
  });
}

const TASK_CHOICES_FUNC = {
  "View All Employees": viewAllEmployees,
  "Add Employee": addEmployees,
  "View All Employees by Department": viewEmployeeByDepartment,
  "View All Employees by Manager": viewEmployeeByManager,
  "Remove Employee": removeEmployee,
  "Update Employee Role": updateEmployeeRole,
  "Update Employee Manager": updateEmployeeManager,
  "View All Roles": viewAllRoles,
  "Define New Role": defineRole,
  "View Departments": viewAllDepartments,
  "Create Department": createDepartment,
  "Exit Application": exitApplication,
};

const TASK_QUESTION = {
  name: "task",
  type: "rawlist",
  message: "What Task would you like to perform?",
  choices: Object.keys(TASK_CHOICES_FUNC),
};

const ADD_EMPLOYEE_QUESTIONS = [
  {
    name: "firstName",
    type: "input",
    message: "Enter Employee First Name: ",
    validate: notBlank,
  },
  {
    name: "lastName",
    type: "input",
    message: "Enter Employee Last Name: ",
    validate: notBlank,
  },
  {
    name: "role",
    type: "list",
    message: "Choose the Employee Role:",
    choices: function getRoles() {
      return Object.keys(ROLES);
    },
  },
];

const EMPLOYEE_BY_DEPARTMENT_QUESTION = [
  {
    name: "name",
    type: "list",
    message: "Choose Department: ",
    choices: function getDepartments() {
      return Object.keys(DEPARTMENTS);
    },
  },
];

const EMPLOYEE_BY_MANAGER_QUESTION = [
  {
    name: "name",
    type: "list",
    message: "Choose Manager: ",
    choices: function getManagers() {
      return Object.keys(MANAGERS);
    },
  },
];

const UPDATE_EMPLOYEE_MANAGER_QUESTIONS = [
  {
    name: "employee",
    type: "list",
    message: "Choose Employee to Update: ",
    choices: function getEmployees() {
      return Object.keys(EMPLOYEES);
    },
  },
  {
    name: "manager",
    type: "list",
    message: "Choose Manager for Employee (Choose self for no Manager): ",
    choices: function getRoles() {
      return Object.keys(EMPLOYEES);
    },
  },
];

const DEFINE_ROLE_QUESTIONS = [
  {
    name: "title",
    type: "input",
    message: "What is the title for this role? ",
  },
  {
    name: "salary",
    type: "input",
    message: "What is the salary for this role? ",
  },
  {
    name: "isManager",
    type: "list",
    message: "Is this a Management Role? ",
    choices: ["No", "Yes"],
    default: "No",
  },
  {
    name: "department",
    type: "list",
    message: "Select the Department for this Role: ",
    choices: function getDepartments() {
      return Object.keys(DEPARTMENTS);
    },
  },
];

const UPDATE_EMPLOYEE_ROLE_QUESTIONS = [
  {
    name: "employee",
    type: "list",
    message: "Select Employee to update: ",
    choices: function getEmployees() {
      return Object.keys(EMPLOYEES);
    },
  },
  {
    name: "role",
    type: "list",
    message: "Select Role: ",
    choices: function getRoles() {
      return Object.keys(ROLES);
    },
  },
  // {
  //   name: "",
  //   type: "",
  //   message: "",
  // },
  // {
  //   name: "",
  //   type: "",
  //   message: "",
  // },
  // {
  //   name: "",
  //   type: "",
  //   message: "",
  // },
];

function notBlank(name) {
  if (name === null || name.trim().length === 0) {
    return "**ERROR*** Input required";
  } else return true;
}

/**
 * Returns an object of Role Names and IDs
 * @param {*} connection
 */
function loadRoles(connection) {
  let retval = {};
  let query = `select * from role order by id`;
  connection.query(query, function (err, response) {
    if (!err) {
      //console.log(response);
      for (let index = 0; index < response.length; index++) {
        let title = response[index].title;
        let id = response[index].id;
        ROLES[title] = id;
      }
    }
  });
  return retval;
}

function loadDepartments(connection) {
  let retval = {};
  let query = `select * from department order by id`;
  connection.query(query, function (err, response) {
    if (!err) {
      // console.log(response);
      for (let index = 0; index < response.length; index++) {
        let name = response[index].name;
        let id = response[index].id;
        DEPARTMENTS[name] = id;
      }
    }
  });
  return retval;
}

function loadManagers(connection) {
  let retval = {};
  let query = `select * from employee where id in (select manager_id from employee  where manager_id is not null group by manager_id)`;
  connection.query(query, function (err, response) {
    if (!err) {
      // console.log(response);
      for (let index = 0; index < response.length; index++) {
        let name = response[index].first_name + " " + response[index].last_name;
        let id = response[index].id;
        MANAGERS[name] = id;
      }
    }
  });
  return retval;
}
// *********************

function loadEmployees(connection) {
  let retval = {};
  let query = `select * from employee `;
  connection.query(query, function (err, response) {
    if (!err) {
      // console.log(response);
      for (let index = 0; index < response.length; index++) {
        let name = response[index].first_name + " " + response[index].last_name;
        let id = response[index].id;
        EMPLOYEES[name] = id;
      }
    }
  });
  return retval;
}

module.exports = {
  viewAllEmployees,
  addEmployees,
  viewEmployeeByDepartment,
  viewEmployeeByManager,
  removeEmployee,
  updateEmployeeRole,
  updateEmployeeManager,
  viewAllRoles,
  defineRole,
  createDepartment,
  viewAllDepartments,
  exitApplication,
  getTask,
  capitalizeFirstLetter,
  TASK_CHOICES_FUNC,
  DEPARTMENTS,
  ROLES,
  MANAGERS,
  EMPLOYEES,
  loadDepartments,
  loadRoles,
  loadManagers,
  loadEmployees,
};