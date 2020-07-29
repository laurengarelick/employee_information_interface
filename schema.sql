DROP DATABASE IF EXISTS employee_TrackerDB;

-- Drops the database
CREATE DATABASE employee_TrackerDB;

-- creates the database
USE employee_TrackerDB;

create table department(
    id integer not null auto_increment,
    name varchar(30),
    primary key(id)
);

create unique index department_name_idx on department(name);

create table role (
    id integer not null auto_increment,
    title varchar(30),
    salary decimal(10, 2),
    isManager bool default false,
    department_id integer not null,
    primary key(id),
    index (department_id),
    foreign key(department_id) references department(id)
);

create unique index role_title_idx on role(title);

create table employee(
    id integer not null auto_increment,
    first_name varchar(30) not null,
    last_name varchar(30) not null,
    role_id integer not null,
    manager_id integer null,
    primary key(id),
    index (role_id),
    index (manager_id),
    foreign key (role_id) references role(id),
    foreign key (manager_id) references employee(id)
);

INSERT INTO
    department (name)
VALUES
    ('Sales'),
    ('Engineering'),
    ('Finance'),
    ('Legal');

INSERT INTO
    role (title, salary, department_id)
VALUES
    ('Sales Lead', 100000, 1),
    ('Salesperson', 80000, 1),
    ('Lead Engineer', 150000, 2),
    ('Software Engineer', 120000, 2),
    ('Account Manager', 160000, 3),
    ('Accountant', 125000, 3),
    ('Legal Team Lead', 250000, 4),
    ('Lawyer', 190000, 4);

INSERT INTO
    employee (first_name, last_name, role_id, manager_id)
VALUES
    ('John', 'Doe', 1, NULL),
    ('Mike', 'Chan', 2, 1),
    ('Ashley', 'Rodriguez', 3, NULL),
    ('Kevin', 'Tupik', 4, 3),
    ('Kunal', 'Singh', 5, NULL),
    ('Malia', 'Brown', 6, 5),
    ('Sarah', 'Lourd', 7, NULL),
    ('Tom', 'Allen', 8, 7),
    ('Derek', 'Dooley', 2, 1),
    ('Edmund ', 'Mccabe', 4, 3);