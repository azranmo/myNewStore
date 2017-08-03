<<<<<<< HEAD
/**
 * Created by moran azran on 6/4/2017.
 */
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var Connection = require('tedious').Connection;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var cors = require('cors');
app.use(cors());
var DButilsAzure = require('./DButils');
var date = require('date-and-time');
var moment = require('moment');
app.use(express.static(__dirname + '/public'));
app.locals.users = {};
var config = {
    userName: 'moranandtal',
    password: 'MoranTal203307',
    server: 'moranandtal.database.windows.net',
    requestTimeout: 15000,
    options: {encrypt: true, database: 'Clothes'}
};
//-------------------------------------------------------------------------------------------------------------------
connection = new Connection(config);
var connected = false;
connection.on('connect', function(err) {
    if (err) {
        console.error('error connecting: ' + err.message);
        return;
    }
    else {
        console.log("Connected Azure");
        connected = true;
    }
});
//-------------------------------------------------------------------------------------------------------------------

app.use(function(req, res, next){
    if (connected)
        next();
    else
        res.status(503).send('Server is down');
});
//-------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");
    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
    } else {
        return next();
    }
});

app.post('/insert', function (req,res) {
    var categoryName = req.body.categoryName;
    var query= "Insert Into Categories Values ('"+categoryName+"');";
    // var name = req.body.name;
    // var id = req.body.id;
    // var query= "Insert Into Table_2 Values ('"+id+"','"+name+"');";
    console.log(query);
    DButilsAzure.Insert(connection, query)
        .then(function (ans){
            res.send(ans);
        })
        .catch(function (err){
            res.send(err);
        });
});

//-------------------------------------------------------------------------------------------------------------------
app.get('/getAllCategories',function (req,res) {
    var query = "SELECT * FROM Categories";

    DButilsAzure.Select(connection, query)
        .then(function (ans){
            console.log("get all categories");
            res.send(ans);

        })
        .catch(function (err){
            console.log("error");
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.get('/getCategoryClothes',function (req,res) {
    var categoryId = req.query.CategoryID;
    console.log(categoryId);
    var query = "SELECT * FROM Garments G Join GarmentCategories GC ON G.GarmentName=GC.GarmentName Where GC.CategoryID='"+categoryId+"';";
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            console.log("get all Category Clothes");
            res.send(ans);

        })
        .catch(function (err){
            console.log("error");
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.post('/register',function (req,res) {
    var firstName = req.body.FirstName;
    var lastName = req.body.LastName;
    var address = req.body.Adress;
    var city = req.body.City;
    var country = req.body.Country;
    var phone = req.body.Phone;
    var cellular = req.body.Cellular;
    var email = req.body.Mail;
    var creditCardNumber = req.body.CreditCardNumber;
    var isAdmin = req.body.isADmin;
    var categories = req.body.categories;
    var username = req.body.username;
    var password = req.body.Password;

    var query= "Insert Into Clients Values ('"+username+"','"+firstName+"','"+lastName+"','"+password+"','"+address+"','"+city+"','"+country+"','"+phone+"','"+cellular+"','"+email+"','"+creditCardNumber+"','"+isAdmin+"');";
    console.log(query);
    DButilsAzure.Insert(connection, query)
        .then(function (ans){
            console.log("insert new user to Clients table");
            query= "Insert Into ClientCategory (username,CategoryID) Values";
            for(var i=0; i<categories.length-1; i++){
                var category = categories[i].CategoryID;
                query = query +" ('"+username+"', '"+category+"'),";
            }
            category = categories[i].CategoryID;
            query = query +" ('"+username+"', '"+category+"');";
            DButilsAzure.Insert(connection, query)
                .then(function (ans){
                    console.log("insert categorues to ClientCategory table");
                    console.log(ans);
                    if(ans==true){
                        // 5 -> 20
                        var token = Math.floor(Math.random() * 16) + 5;
                        app.locals.users[username] = token;
                        res.json(token);
                    }
                    else {
                        res.status(403).send("incorrect");
                        // res.send(err);
                    }

                })
                .catch(function (err){
                    res.send(err);
                });
        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.post('/login',function (req,res) {
    var username = req.body.username;
    var password = req.body.password;
    var query= "Select * FROM Clients WHERE username='"+username+"' AND Password='"+password +"';";
    // console.log(query);
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            if(ans.length > 0) {
                // 5 -> 20
                var token = Math.floor(Math.random() * 16) + 5;
                app.locals.users[username] = token;
                res.json(token);
            }
            else
                res.status(403).send("username or password incorrect");
        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
function checkLogin(req) {
    var token = req.headers["my-token"];
    var user = req.headers["user"];
    if (!token || !user)
        return false;
    var validToken = app.locals.users[user];
    if (validToken == token)
        return true;
    else
        return false;
}
//-------------------------------------------------------------------------------------------------------------------
app.post('/restorePassword',function (req,res) {
    var username = req.body.username;
    var email = req.body.Mail;
    var city = req.body.City;
    var country = req.body.Country;
    var cellular = req.body.Cellular;
    var query= "Select password FROM Clients WHERE username='"+username+"' AND Mail='"+email+"' AND City='"+city+"' AND Country='"+country+"' AND Cellular='"+cellular+"';";
    console.log(query);
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            if(ans.length>0){
                ans = ans[0].password;
            }
            else{
                ans = "";
            }
            res.send(JSON.stringify(ans));
            console.log("password: " + JSON.stringify(ans));
        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.get('/getTop5HotClothes', function (req,res) {
    var today = date.format(new Date(), 'YYYY-MM-DD');
    var query ="SELECT TOP (5) GarmentName FROM Orders O JOIN GarmentsInOrders OD ON OD.OrderID = O.OrderID WHERE DATEDIFF(day,OrderDate,'"+today+"') between 0 and 7 GROUP BY GarmentName ORDER BY SUM(Amount) DESC;";
    console.log(query);
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            console.log(ans);
            res.send(ans);
        })
        .catch(function (err){
            console.log("err");
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.get('/getNewClothes', function (req,res) {
    var now = date.format(new Date(), 'YYYY-MM-DD');
    console.log(now);
    var query = "SELECT * FROM GARMENTS WHERE DATEDIFF(day,InsertDate,'"+now+"') between 0 and 30;";
    console.log(query);
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            console.log(ans);
            res.send(ans);
        })
        .catch(function (err){
            console.log("err");
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.get('/getAllClothes', function (req,res) {
    var query = "SELECT * FROM Garments";
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            res.send(ans);
            console.log("get all clothes");
        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.get('/getRecommendedClothes', function (req,res) {
    var username = req.query.username;
    // var query = "SELECT GarmentName FROM GarmentCategories GC JOIN GarmentsInOrders CC ON GC.GarmentName=GIO.GarmentName JOIN ClientCategory ON GC.CategoryID=CC.CategoryID;";
    var query = "SELECT DISTINCT GarmentsInOrders.GarmentName FROM GarmentsInOrders INNER JOIN GarmentCategories ON GarmentsInOrders.GarmentName=GarmentCategories.GarmentName INNER JOIN ClientCategory ON GarmentCategories.CategoryID=ClientCategory.CategoryID WHERE NOT ClientCategory.username='"+username+"';";
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            console.log(ans);
            res.send(ans);
        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.get('/getOrders', function (req,res) {
    var username = req.query.username;
    var query = "SELECT * FROM Orders WHERE username='"+username+"';";
    console.log(query);
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            console.log(ans);
            res.send(ans);
        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.post('/buyCart',function (req,res,next) {
    var username = req.body.username;
    var shipmentDate = req.body.ShipmentDate;
    var currency = req.body.Currency;
    var clothes = req.body.clothes;
    var totalAmount = req.body.TotalAmount;
    var orderDate = date.format(new Date(), 'YYYY-MM-DD');
    console.log(orderDate);
    query= "Insert Into Orders Values ('"+username+"','"+orderDate+"','"+shipmentDate+"','"+currency+"','"+totalAmount+"');";
    console.log(query);
    DButilsAzure.Insert(connection, query)
        .then(function (ans){
            console.log("insert new order to Orders table");
            var query= "SELECT MAX(OrderID) AS MaxID FROM Orders";
            console.log(query);
            DButilsAzure.Select(connection, query)
                .then(function (ans){
                    var MaxOrder = ans[0].MaxID;
                    query= "Insert Into GarmentsInOrders (OrderID,GarmentName,Amount) Values";
                    var queryUpdate= "UPDATE Garments SET StokAmount = CASE";
                    for(var i=0; i<clothes.length-1; i++){
                        var garment = clothes[i].GarmentName;
                        var amount = clothes[i].Amount;
                        query = query +" ('"+MaxOrder+"','"+garment+"', '"+amount+"'),";
                        queryUpdate = queryUpdate +" WHEN GarmentName='"+garment+"' THEN StokAmount-'"+amount+"'";
                    }
                    garment = clothes[i].GarmentName;
                    amount = clothes[i].Amount;
                    query = query +" ('"+MaxOrder+"','"+garment+"', '"+amount+"');";
                    queryUpdate = queryUpdate +" WHEN GarmentName='"+garment+"' THEN StokAmount-'"+amount+"' ELSE StokAmount END;";
                    console.log(query);
                    console.log(queryUpdate);
                    DButilsAzure.Insert(connection, query)
                        .then(function (ans){
                            console.log("insert new clothes to GarmentsInOrders table");
                            DButilsAzure.Update(connection, queryUpdate)
                                .then(function (ans){
                                    console.log("update garment StokAmount in Garment table");
                                    query = "SELECT * FROM Orders WHERE OrderID='"+MaxOrder+"';";
                                    DButilsAzure.Select(connection, query)
                                        .then(function (ans){
                                            res.send(ans);
                                        })
                                        .catch(function (err){
                                            res.send(err);
                                        });
                                })
                                .catch(function (err){
                                    res.send(err);
                                });
                        })
                        .catch(function (err){
                            res.send(err);
                        });

                })
                .catch(function (err){
                    res.send(err);
                });

        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.get('/getClients', function (req,res) {
    var query = "SELECT * FROM Clients";
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            res.send(ans);
            console.log("get all users");
        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.get('/getOrdersReports', function (req,res) {
    var query = "SELECT * FROM Orders";
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            console.log(ans);
            res.send(ans);
        })
        .catch(function (err){
            res.send(err);
        });

});
//-------------------------------------------------------------------------------------------------------------------
app.post('/addGarment', function (req,res) {
    var garmentName = req.body.GarmentName;
    var picturePath = req.body.PicturePath;
    var price = req.body.Price;
    var stokAmount = req.body.StokAmount;
    var categoryID =  req.body.categoryID;
    var insertDate = date.format(new Date(), 'YYYY-MM-DD');
    console.log(insertDate);
    var query= "Insert Into Garments Values ('"+garmentName+"','"+picturePath+"','"+insertDate+"','"+price+"','"+stokAmount+"');";
    console.log(query);
    DButilsAzure.Insert(connection, query)
        .then(function (ans){
            console.log("insert new Garment to Garments table");
            query = "Insert Into GarmentCategories Values ('"+garmentName+"','"+categoryID+"');";
            console.log(query);
            DButilsAzure.Insert(connection, query)
                .then(function (ans){
                    console.log("insert new Garment to GarmentCategories table");
                    res.send(ans);
                })
                .catch(function (err){
                    res.send(err);
                });

        })
        .catch(function (err){
            res.send(err);
        });

});
//-------------------------------------------------------------------------------------------------------------------
app.delete('/deleteGarment', function (req,res) {
    var garmentName = req.body.GarmentName;
    var query = "DELETE FROM Garments WHERE GarmentName='"+garmentName+"';";
    DButilsAzure.Delete(connection, query)
        .then(function (ans){
            console.log("delete from Garments");
            res.send(ans);

        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.post('/addUser', function (req,res) {
    var firstName = req.body.FirstName;
    var lastName = req.body.LastName;
    var address = req.body.Adress;
    var city = req.body.City;
    var country = req.body.Country;
    var phone = req.body.Phone;
    var cellular = req.body.Cellular;
    var email = req.body.Mail;
    var creditCardNumber = req.body.CreditCardNumber;
    var isAdmin = req.body.isADmin;
    var categories = req.body.categories;
    var username = req.body.username;
    var password = req.body.Password;

    var query= "Insert Into Clients Values ('"+username+"','"+firstName+"','"+lastName+"','"+password+"','"+address+"','"+city+"','"+country+"','"+phone+"','"+cellular+"','"+email+"','"+creditCardNumber+"','"+isAdmin+"');";
    console.log(query);
    DButilsAzure.Insert(connection, query)
        .then(function (ans){
            console.log("insert new user to Clients table");
            query= "Insert Into ClientCategory (username,CategoryID) Values";
            for(var i=0; i<categories.length-1; i++){
                var category = categories[i].CategoryID;
                query = query +" ('"+username+"', '"+category+"'),";
            }
            category = categories[i].CategoryID;
            query = query +" ('"+username+"', '"+category+"');";
            DButilsAzure.Insert(connection, query)
                .then(function (ans){
                    console.log("insert categorues to ClientCategory table");
                    res.send(ans);
                })
                .catch(function (err){
                    res.send(err);
                });
        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.delete('/deleteUser', function (req,res) {
    var username = req.body.username;
    var query = "DELETE FROM Clients WHERE username='"+username+"';";
    console.log(query);
    DButilsAzure.Delete(connection, query)
        .then(function (ans){
            res.send(ans);
            console.log("delete from Clients");
        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.get('/checkSupply', function (req,res) {
    var query = "SELECT * FROM Garments WHERE StokAmount<3";
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            console.log(ans);
            res.send(ans);
        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.put('/updateGarmentSupply', function (req,res)  {
    var clothes = req.body.clothes;
    var queryUpdate= "UPDATE Garments SET StokAmount = CASE";
    for(var i=0; i<clothes.length-1; i++){
        var garment = clothes[i].GarmentName;
        var amount = clothes[i].Amount;
        queryUpdate = queryUpdate +" WHEN GarmentName='"+garment+"' THEN '"+amount+"'";
    }
    garment = clothes[i].GarmentName;
    amount = clothes[i].Amount;
    queryUpdate = queryUpdate +" WHEN GarmentName='"+garment+"' THEN '"+amount+"' ELSE StokAmount END;";
    console.log(queryUpdate);
    DButilsAzure.Update(connection, queryUpdate)
        .then(function (ans){
            console.log("update garments StokAmount in Garment table");
            res.send(ans);
        })
        .catch(function (err){
            res.send(err);
        });

});
//-------------------------------------------------------------------------------------------------------------------


var port = 4000;
app.listen(port, function () {
    console.log('app listening on port ' + port);
});


//-------------------------------------------------------------------------------------------------------------------


=======
/**
 * Created by moran azran on 6/4/2017.
 */
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var Connection = require('tedious').Connection;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var cors = require('cors');
app.use(cors());
var DButilsAzure = require('./DButils');
var date = require('date-and-time');
var moment = require('moment');
app.use(express.static(__dirname + '/public'));
app.locals.users = {};
var config = {
    userName: 'moranandtal',
    password: 'MoranTal203307',
    server: 'moranandtal.database.windows.net',
    requestTimeout: 15000,
    options: {encrypt: true, database: 'Clothes'}
};
//-------------------------------------------------------------------------------------------------------------------
connection = new Connection(config);
var connected = false;
connection.on('connect', function(err) {
    if (err) {
        console.error('error connecting: ' + err.message);
        return;
    }
    else {
        console.log("Connected Azure");
        connected = true;
    }
});
//-------------------------------------------------------------------------------------------------------------------

app.use(function(req, res, next){
    if (connected)
        next();
    else
        res.status(503).send('Server is down');
});
//-------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");
    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
    } else {
        return next();
    }
});

app.post('/insert', function (req,res) {
    var categoryName = req.body.categoryName;
    var query= "Insert Into Categories Values ('"+categoryName+"');";
    // var name = req.body.name;
    // var id = req.body.id;
    // var query= "Insert Into Table_2 Values ('"+id+"','"+name+"');";
    console.log(query);
    DButilsAzure.Insert(connection, query)
        .then(function (ans){
            res.send(ans);
        })
        .catch(function (err){
            res.send(err);
        });
});

//-------------------------------------------------------------------------------------------------------------------
app.get('/getAllCategories',function (req,res) {
    var query = "SELECT * FROM Categories";

    DButilsAzure.Select(connection, query)
        .then(function (ans){
            console.log("get all categories");
            res.send(ans);

        })
        .catch(function (err){
            console.log("error");
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.get('/getCategoryClothes',function (req,res) {
    var categoryId = req.query.CategoryID;
    console.log(categoryId);
    var query = "SELECT * FROM Garments G Join GarmentCategories GC ON G.GarmentName=GC.GarmentName Where GC.CategoryID='"+categoryId+"';";
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            console.log("get all Category Clothes");
            res.send(ans);

        })
        .catch(function (err){
            console.log("error");
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.post('/register',function (req,res) {
    var firstName = req.body.FirstName;
    var lastName = req.body.LastName;
    var address = req.body.Adress;
    var city = req.body.City;
    var country = req.body.Country;
    var phone = req.body.Phone;
    var cellular = req.body.Cellular;
    var email = req.body.Mail;
    var creditCardNumber = req.body.CreditCardNumber;
    var isAdmin = req.body.isADmin;
    var categories = req.body.categories;
    var username = req.body.username;
    var password = req.body.Password;

    var query= "Insert Into Clients Values ('"+username+"','"+firstName+"','"+lastName+"','"+password+"','"+address+"','"+city+"','"+country+"','"+phone+"','"+cellular+"','"+email+"','"+creditCardNumber+"','"+isAdmin+"');";
    console.log(query);
    DButilsAzure.Insert(connection, query)
        .then(function (ans){
            console.log("insert new user to Clients table");
            query= "Insert Into ClientCategory (username,CategoryID) Values";
            for(var i=0; i<categories.length-1; i++){
                var category = categories[i].CategoryID;
                query = query +" ('"+username+"', '"+category+"'),";
            }
            category = categories[i].CategoryID;
            query = query +" ('"+username+"', '"+category+"');";
            DButilsAzure.Insert(connection, query)
                .then(function (ans){
                    console.log("insert categorues to ClientCategory table");
                    console.log(ans);
                    if(ans==true){
                        // 5 -> 20
                        var token = Math.floor(Math.random() * 16) + 5;
                        app.locals.users[username] = token;
                        res.json(token);
                    }
                    else {
                        res.status(403).send("incorrect");
                        // res.send(err);
                    }

                })
                .catch(function (err){
                    res.send(err);
                });
        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.post('/login',function (req,res) {
    var username = req.body.username;
    var password = req.body.password;
    var query= "Select * FROM Clients WHERE username='"+username+"' AND Password='"+password +"';";
    // console.log(query);
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            if(ans.length > 0) {
                // 5 -> 20
                var token = Math.floor(Math.random() * 16) + 5;
                app.locals.users[username] = token;
                res.json(token);
            }
            else
                res.status(403).send("username or password incorrect");
        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
function checkLogin(req) {
    var token = req.headers["my-token"];
    var user = req.headers["user"];
    if (!token || !user)
        return false;
    var validToken = app.locals.users[user];
    if (validToken == token)
        return true;
    else
        return false;
}
//-------------------------------------------------------------------------------------------------------------------
app.post('/restorePassword',function (req,res) {
    var username = req.body.username;
    var email = req.body.Mail;
    var city = req.body.City;
    var country = req.body.Country;
    var cellular = req.body.Cellular;
    var query= "Select password FROM Clients WHERE username='"+username+"' AND Mail='"+email+"' AND City='"+city+"' AND Country='"+country+"' AND Cellular='"+cellular+"';";
    console.log(query);
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            if(ans.length>0){
                ans = ans[0].password;
            }
            else{
                ans = "";
            }
            res.send(JSON.stringify(ans));
            console.log("password: " + JSON.stringify(ans));
        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.get('/getTop5HotClothes', function (req,res) {
    var today = date.format(new Date(), 'YYYY-MM-DD');
    var query ="SELECT TOP (5) GarmentName FROM Orders O JOIN GarmentsInOrders OD ON OD.OrderID = O.OrderID WHERE DATEDIFF(day,OrderDate,'"+today+"') between 0 and 7 GROUP BY GarmentName ORDER BY SUM(Amount) DESC;";
    console.log(query);
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            console.log(ans);
            res.send(ans);
        })
        .catch(function (err){
            console.log("err");
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.get('/getNewClothes', function (req,res) {
    var now = date.format(new Date(), 'YYYY-MM-DD');
    console.log(now);
    var query = "SELECT * FROM GARMENTS WHERE DATEDIFF(day,InsertDate,'"+now+"') between 0 and 30;";
    console.log(query);
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            console.log(ans);
            res.send(ans);
        })
        .catch(function (err){
            console.log("err");
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.get('/getAllClothes', function (req,res) {
    var query = "SELECT * FROM Garments";
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            res.send(ans);
            console.log("get all clothes");
        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.get('/getRecommendedClothes', function (req,res) {
    var username = req.query.username;
    // var query = "SELECT GarmentName FROM GarmentCategories GC JOIN GarmentsInOrders CC ON GC.GarmentName=GIO.GarmentName JOIN ClientCategory ON GC.CategoryID=CC.CategoryID;";
    var query = "SELECT DISTINCT GarmentsInOrders.GarmentName FROM GarmentsInOrders INNER JOIN GarmentCategories ON GarmentsInOrders.GarmentName=GarmentCategories.GarmentName INNER JOIN ClientCategory ON GarmentCategories.CategoryID=ClientCategory.CategoryID WHERE NOT ClientCategory.username='"+username+"';";
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            console.log(ans);
            res.send(ans);
        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.get('/getOrders', function (req,res) {
    var username = req.query.username;
    var query = "SELECT * FROM Orders WHERE username='"+username+"';";
    console.log(query);
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            console.log(ans);
            res.send(ans);
        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.post('/buyCart',function (req,res,next) {
    var username = req.body.username;
    var shipmentDate = req.body.ShipmentDate;
    var currency = req.body.Currency;
    var clothes = req.body.clothes;
    var totalAmount = req.body.TotalAmount;
    var orderDate = date.format(new Date(), 'YYYY-MM-DD');
    console.log(orderDate);
    query= "Insert Into Orders Values ('"+username+"','"+orderDate+"','"+shipmentDate+"','"+currency+"','"+totalAmount+"');";
    console.log(query);
    DButilsAzure.Insert(connection, query)
        .then(function (ans){
            console.log("insert new order to Orders table");
            var query= "SELECT MAX(OrderID) AS MaxID FROM Orders";
            console.log(query);
            DButilsAzure.Select(connection, query)
                .then(function (ans){
                    var MaxOrder = ans[0].MaxID;
                    query= "Insert Into GarmentsInOrders (OrderID,GarmentName,Amount) Values";
                    var queryUpdate= "UPDATE Garments SET StokAmount = CASE";
                    for(var i=0; i<clothes.length-1; i++){
                        var garment = clothes[i].GarmentName;
                        var amount = clothes[i].Amount;
                        query = query +" ('"+MaxOrder+"','"+garment+"', '"+amount+"'),";
                        queryUpdate = queryUpdate +" WHEN GarmentName='"+garment+"' THEN StokAmount-'"+amount+"'";
                    }
                    garment = clothes[i].GarmentName;
                    amount = clothes[i].Amount;
                    query = query +" ('"+MaxOrder+"','"+garment+"', '"+amount+"');";
                    queryUpdate = queryUpdate +" WHEN GarmentName='"+garment+"' THEN StokAmount-'"+amount+"' ELSE StokAmount END;";
                    console.log(query);
                    console.log(queryUpdate);
                    DButilsAzure.Insert(connection, query)
                        .then(function (ans){
                            console.log("insert new clothes to GarmentsInOrders table");
                            DButilsAzure.Update(connection, queryUpdate)
                                .then(function (ans){
                                    console.log("update garment StokAmount in Garment table");
                                    query = "SELECT * FROM Orders WHERE OrderID='"+MaxOrder+"';";
                                    DButilsAzure.Select(connection, query)
                                        .then(function (ans){
                                            res.send(ans);
                                        })
                                        .catch(function (err){
                                            res.send(err);
                                        });
                                })
                                .catch(function (err){
                                    res.send(err);
                                });
                        })
                        .catch(function (err){
                            res.send(err);
                        });

                })
                .catch(function (err){
                    res.send(err);
                });

        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.get('/getClients', function (req,res) {
    var query = "SELECT * FROM Clients";
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            res.send(ans);
            console.log("get all users");
        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.get('/getOrdersReports', function (req,res) {
    var query = "SELECT * FROM Orders";
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            console.log(ans);
            res.send(ans);
        })
        .catch(function (err){
            res.send(err);
        });

});
//-------------------------------------------------------------------------------------------------------------------
app.post('/addGarment', function (req,res) {
    var garmentName = req.body.GarmentName;
    var picturePath = req.body.PicturePath;
    var price = req.body.Price;
    var stokAmount = req.body.StokAmount;
    var categoryID =  req.body.categoryID;
    var insertDate = date.format(new Date(), 'YYYY-MM-DD');
    console.log(insertDate);
    var query= "Insert Into Garments Values ('"+garmentName+"','"+picturePath+"','"+insertDate+"','"+price+"','"+stokAmount+"');";
    console.log(query);
    DButilsAzure.Insert(connection, query)
        .then(function (ans){
            console.log("insert new Garment to Garments table");
            query = "Insert Into GarmentCategories Values ('"+garmentName+"','"+categoryID+"');";
            console.log(query);
            DButilsAzure.Insert(connection, query)
                .then(function (ans){
                    console.log("insert new Garment to GarmentCategories table");
                    res.send(ans);
                })
                .catch(function (err){
                    res.send(err);
                });

        })
        .catch(function (err){
            res.send(err);
        });

});
//-------------------------------------------------------------------------------------------------------------------
app.delete('/deleteGarment', function (req,res) {
    var garmentName = req.body.GarmentName;
    var query = "DELETE FROM Garments WHERE GarmentName='"+garmentName+"';";
    DButilsAzure.Delete(connection, query)
        .then(function (ans){
            console.log("delete from Garments");
            res.send(ans);

        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.post('/addUser', function (req,res) {
    var firstName = req.body.FirstName;
    var lastName = req.body.LastName;
    var address = req.body.Adress;
    var city = req.body.City;
    var country = req.body.Country;
    var phone = req.body.Phone;
    var cellular = req.body.Cellular;
    var email = req.body.Mail;
    var creditCardNumber = req.body.CreditCardNumber;
    var isAdmin = req.body.isADmin;
    var categories = req.body.categories;
    var username = req.body.username;
    var password = req.body.Password;

    var query= "Insert Into Clients Values ('"+username+"','"+firstName+"','"+lastName+"','"+password+"','"+address+"','"+city+"','"+country+"','"+phone+"','"+cellular+"','"+email+"','"+creditCardNumber+"','"+isAdmin+"');";
    console.log(query);
    DButilsAzure.Insert(connection, query)
        .then(function (ans){
            console.log("insert new user to Clients table");
            query= "Insert Into ClientCategory (username,CategoryID) Values";
            for(var i=0; i<categories.length-1; i++){
                var category = categories[i].CategoryID;
                query = query +" ('"+username+"', '"+category+"'),";
            }
            category = categories[i].CategoryID;
            query = query +" ('"+username+"', '"+category+"');";
            DButilsAzure.Insert(connection, query)
                .then(function (ans){
                    console.log("insert categorues to ClientCategory table");
                    res.send(ans);
                })
                .catch(function (err){
                    res.send(err);
                });
        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.delete('/deleteUser', function (req,res) {
    var username = req.body.username;
    var query = "DELETE FROM Clients WHERE username='"+username+"';";
    console.log(query);
    DButilsAzure.Delete(connection, query)
        .then(function (ans){
            res.send(ans);
            console.log("delete from Clients");
        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.get('/checkSupply', function (req,res) {
    var query = "SELECT * FROM Garments WHERE StokAmount<3";
    DButilsAzure.Select(connection, query)
        .then(function (ans){
            console.log(ans);
            res.send(ans);
        })
        .catch(function (err){
            res.send(err);
        });
});
//-------------------------------------------------------------------------------------------------------------------
app.put('/updateGarmentSupply', function (req,res)  {
    var clothes = req.body.clothes;
    var queryUpdate= "UPDATE Garments SET StokAmount = CASE";
    for(var i=0; i<clothes.length-1; i++){
        var garment = clothes[i].GarmentName;
        var amount = clothes[i].Amount;
        queryUpdate = queryUpdate +" WHEN GarmentName='"+garment+"' THEN '"+amount+"'";
    }
    garment = clothes[i].GarmentName;
    amount = clothes[i].Amount;
    queryUpdate = queryUpdate +" WHEN GarmentName='"+garment+"' THEN '"+amount+"' ELSE StokAmount END;";
    console.log(queryUpdate);
    DButilsAzure.Update(connection, queryUpdate)
        .then(function (ans){
            console.log("update garments StokAmount in Garment table");
            res.send(ans);
        })
        .catch(function (err){
            res.send(err);
        });

});
//-------------------------------------------------------------------------------------------------------------------


var port = 4000;
app.listen(port, function () {
    console.log('app listening on port ' + port);
});


//-------------------------------------------------------------------------------------------------------------------


>>>>>>> 975d93af26a98df9fd6cbf5fb7e1b6de6d1ee92f
