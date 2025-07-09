-- create database
CREATE DATABASE NoMoneyDb;
GO

USE NoMoneyDb;
GO

-- create categories table
CREATE TABLE Categories (
    Id int IDENTITY(1,1) PRIMARY KEY,
    Name nvarchar(50) NOT NULL UNIQUE,
    Color nvarchar(7) NOT NULL,
    IsDefault bit NOT NULL DEFAULT 0,
    UserId int NOT NULL DEFAULT 1
);

-- create expenses table
CREATE TABLE Expenses (
    Id int IDENTITY(1,1) PRIMARY KEY,
    Amount decimal(18,2) NOT NULL,
    Description nvarchar(200) NOT NULL,
    CategoryId int NOT NULL,
    Date datetime2 NOT NULL,
    UserId int NOT NULL DEFAULT 1,
    FOREIGN KEY (CategoryId) REFERENCES Categories(Id)
);

-- create indexes
CREATE INDEX IX_Expenses_Date ON Expenses(Date);
CREATE INDEX IX_Expenses_CategoryId ON Expenses(CategoryId);
CREATE INDEX IX_Expenses_UserId ON Expenses(UserId);

-- insert default categories
INSERT INTO Categories (Name, Color, IsDefault, UserId) VALUES
('food', '#ff4444', 1, 1),
('entertainment', '#44ff44', 1, 1),
('transport', '#ffff44', 1, 1),
('healthcare', '#4444ff', 1, 1),
('rent', '#ff44ff', 1, 1),
('shopping', '#ff8844', 1, 1);

-- insert sample data
INSERT INTO Expenses (Amount, Description, CategoryId, Date, UserId) VALUES
(25.50, 'lunch at bistro', 1, GETDATE(), 1),
(8.00, 'bus ticket', 3, GETDATE(), 1),
(45.00, 'cinema tickets', 2, GETDATE(), 1),
(35.20, 'grocery shopping', 1, DATEADD(day, -1, GETDATE()), 1),
(10.00, 'coffee', 6, DATEADD(day, -1, GETDATE()), 1),
(100.00, 'monthly rent', 5, DATEADD(day, -2, GETDATE()), 1),
(20.00, 'pharmacy', 4, DATEADD(day, -2, GETDATE()), 1);

GO
