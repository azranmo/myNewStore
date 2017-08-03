/**
 * Created by moran azran on 6/19/2017.
 */
var app = angular.module('myApp', ['ngRoute','LocalStorageModule']);

app.config(function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('node_angular_App');
});
//-------------------------------------------------------------------------------------------------------------------
app.controller('mainController', ['UserService','$http','$location','localStorageService',function (UserService,$http,$location,localStorageService) {
    var self = this;
    self.text2="";
    self.header2 = "";
    self.userService = UserService;
    self.Cart = [];
    self.logOut = function () {
        self.userService.isLoggedIn = false;
        self.deleteCookie('password');
        self.deleteCookie('username');
        self.deleteCookie('last entry date');
        $location.path('/');
    };

    self.deleteCookie = function (parameter) {
        var cookieVal = localStorageService.cookie.get(parameter);
        if (cookieVal) {
            localStorageService.cookie.remove(parameter);
        }

    };


    self.openModalDialog = function () {
        self.header2 = "Moran Azran & Tal Shkolnik";
        self.text2 = " Price: " ;
    };

    if( self.userService.isLoggedIn){
        self.username = $http.defaults.headers.common.user;
        if( localStorageService.cookie.get('last entry date')!= null){
            self.lastDate =  "last entry date: "+ localStorageService.cookie.get('last entry date');
        }
    }
        else
    {
        self.username = 'Guest';
    }


}]);

//-------------------------------------------------------------------------------------------------------------------
app.controller('categoriesController', ['$http', 'Category', function($http, Category) {
    var self = this;
    self.fieldToOrderBy = "CategoryName";
    self.getCategories = function () {
        $http.get('/getAllCategories')
            .then(function (res) {
                self.categories = [];
                angular.forEach(res.data, function (category) {
                    self.categories.push(new Category(category));
                });
            });
    };

}]);

//-------------------------------------------------------------------------------------------------------------------
app.controller('cartController', ['$http', 'Garment','Order','localStorageService', function($http, Garment,Order,localStorageService) {
    var self = this;
    var username = $http.defaults.headers.common.user;
    self.Cart = localStorageService.get(username);
    if(self.Cart.clothes!=null){
        self.clothes = self.Cart.clothes;
        self.totalAmount = 0;
        angular.forEach(self.clothes, function (garment) {
            self.totalAmount = self.totalAmount + garment.Price;
        });
    }
    self.deleteFromCart = function (garmentToDel) {
        var keepGoing = true;
        angular.forEach(self.clothes, function (garment) {
            if(keepGoing) {
                if(garment.GarmentName == garmentToDel.GarmentName){
                    keepGoing = false;
                    var index = self.clothes.indexOf(garment);
                    if (index > -1) {
                        self.clothes.splice(index, 1);
                        self.totalAmount = self.totalAmount - garmentToDel.Price;
                        var cart = {
                            clothes: self.clothes
                        };
                        var username = $http.defaults.headers.common.user;
                        localStorageService.set(username,cart);
                    }
                }
            }
        });
    };
    self.sortBy="GarmentName";
    self.changeSortBy = function (property) {
        self.sortBy = property;
    };
    self.text="";
    self.header = "";
    self.openModalDialog = function (garment) {
        self.header = "Product Name: " + garment.GarmentName;
        self.text = " Price: " + garment.Price +"\n" + " Insert Date: " + garment.InsertDate+"\n"+ " Stok Amount: " + garment.StokAmount ;
    };


    // self.openModalDialog = function (order) {
    //     self.header = "Order ID: " + order.OrderID;
    //     self.text = " Order Date: " + order.OrderDate +"\n" + " Shipment Date: " + order.ShipmentDate+"\n"+ " Currency: " + order.Currency+"\n"+ " TotalAmount: " + order.TotalAmount  ;
    // };
    self.getOrders = function () {
        var username = $http.defaults.headers.common.user;
        $http.get('/getOrders',{params: {username: username}})
            .then(function (res) {
                self.Orders = [];
                angular.forEach(res.data, function (order) {
                    self.Orders.push(new Order(order));
                });

            })
            .catch(function (err) {
                alert(err);
            });
    };


}]);
//-------------------------------------------------------------------------------------------------------------------
// app.controller('orderController', ['$http','Order', function($http, Garment,Order) {
//     var self = this;
//     self.getOrderData =function () {
//     }
//
// }]);

//-------------------------------------------------------------------------------------------------------------------
app.controller('productsController', ['$http', 'Garment','Category','localStorageService', function($http, Garment,Category,localStorageService) {
    var self = this;
    self.fieldToOrderBy = "GarmentName";

        self.options = [];
        self.options.push("Name");
        self.options.push("Price");

    self.getAllClothes = function () {
        $http.get('/getAllClothes')
            .then(function (res) {
                self.Clothes = [];
                angular.forEach(res.data, function (garment) {
                    self.Clothes.push(new Garment(garment));
                });
                $http.get('/getAllCategories')
                    .then(function (res) {
                        self.categories = [];
                        angular.forEach(res.data, function (category) {
                            self.categories.push(new Category(category));
                        });
                        $http.get('/getRecommendedClothes',{params: {username: $http.defaults.headers.common.user}})
                            .then(function (res) {
                                self.RecommendedClothes = [];
                                angular.forEach(res.data, function (garmentToCheck) {
                                    var keepGoing = true;
                                    angular.forEach(self.Clothes, function (garment) {
                                        if(keepGoing) {
                                            if(garment.GarmentName == garmentToCheck.GarmentName){
                                                keepGoing = false;
                                                self.RecommendedClothes.push(garment);
                                            }
                                        }
                                    });
                                });

                                self.getClothesByCategory = function (CategoryID) {
                                    $http.get('/getCategoryClothes',{params: {CategoryID: CategoryID}})
                                        .then(function (res) {
                                            self.ClothesByCategory = [];
                                            angular.forEach(res.data, function (garment) {
                                                self.ClothesByCategory.push(new Garment(garment));
                                            });
                                        })
                                        .catch(function (err) {
                                            alert(err);
                                        });
                                };


                                self.addToCart= function (garment) {
                                    var username = $http.defaults.headers.common.user;
                                    self.Cart = localStorageService.get(username);
                                    var clothes = self.Cart.clothes;
                                    clothes.push(garment);
                                    var cart = {
                                        clothes: clothes
                                    };

                                    localStorageService.set(username,cart);
                                    alert("product add to cart");
                                };



                                self.sortBy="";
                                self.changeSortBy = function (property) {
                                    self.sortBy = property;
                                };
                                self.text="";
                                self.header = "";
                                self.openModalDialog = function (garment) {
                                    self.header = "Product Name: " + garment.GarmentName;
                                    self.text = " Price: " + garment.Price +"\n" + " Insert Date: " + garment.InsertDate+"\n"+ " Stok Amount: " + garment.StokAmount ;
                                    // " Price: " + garment.Price+/n
                                };
                            })
                            .catch(function (err) {
                                alert(err);
                            });

                    })
                    .catch(function (err) {
                        alert(err);
                    });
            })
            .catch(function (err) {
                alert(err);
            });
    };


}]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('loginController', ['UserService','localStorageService', '$location', '$window','$http',
    function(UserService,localStorageService, $location, $window, $http) {
        var self = this;
        self.user = {username: '', password: ''};
        self.login = function(valid) {
            if (valid) {

                UserService.login(self.user).then(function (success) {
                    if((localStorageService.cookie.get('username')!=null && localStorageService.cookie.get('password')!=null)|| (localStorageService.cookie.get('username')!=self.user.username &&localStorageService.cookie.get('password')!=self.user.password)){
                        self.deleteCookie('username');
                        self.deleteCookie('password');
                        self.deleteCookie('last entry date');
                        self.cookieKey ='username';
                        self.cookieValue = self.user.username;
                        self.addCookie();
                        self.cookieKey ='password';
                        self.cookieValue = self.user.password;
                        self.addCookie();
                        self.cookieKey ='last entry date';
                        var d = new Date();
                        var today = d.toDateString();
                        self.cookieValue = today;
                        self.addCookie();
                    }
                    $location.path('/');
                    self.getCart();

                }, function (error) {
                    self.errorMessage = error.data;
                    $window.alert('Username not found in the system');
                });
            }
        };
        self.isRestore = false;
        self.changeIsRestore =function () {
            self.isRestore=true;
        };

        self.userRestore = {username: '', email: '', country: '', city: '', cellular: ''};
        self.restore = function(valid) {
            if (valid) {
                var password;
                var requestUrl1 = '/restorePassword';
                $http.post(requestUrl1, self.userRestore)
                    .then(function (res) {
                        password = res.data;
                        alert("your password is: " + password);
                    })
                    .catch(function () {
                        alert("Could not recover password");
                    });
            }
        };
        self.deleteCookie = function (parameter) {
            var cookieVal = localStorageService.cookie.get(parameter);
            if (cookieVal) {
                localStorageService.cookie.remove(parameter);
            }
        };

        self.addCookie = function () {
            var cookieVal = localStorageService.cookie.get(self.cookieKey);
            if (!cookieVal)
                localStorageService.cookie.set(self.cookieKey,self.cookieValue, 3);
        };

        self.getCart= function () {
            self.Cart = localStorageService.get(self.user.username);
            if(!self.Cart){
                self.StorageKey = self.user.username;
                var cart = {
                    clothes: []
                };
                self.StorageValue= cart;
                localStorageService.set(self.StorageKey, self.StorageValue);
                self.Cart = localStorageService.get(self.user.username);
            }
        };
    }]);
//-------------------------------------------------------------------------------------------------------------------
app.factory('UserService', ['$http', function($http) {
    var service = {};

    service.isLoggedIn = false;
    service.success = false;
    service.login = function(user) {
        var requestUrl = "/login";
        return $http.post(requestUrl, user)
            .then(function(response) {
                var token = response.data;
                $http.defaults.headers.common = {
                    'my-Token': token,
                    'user' : user.username
                };
                service.isLoggedIn = true;

                return Promise.resolve(response);
            })
            .catch(function (e) {
                return Promise.reject(e);
            });
    };
    service.Create = function(user) {
        var requestUrl = "/register";
        return $http.post(requestUrl, user)
            .then(function(response) {
                var token = response.data;
                if(token>=5 && token<=20){
                    console.log(token);
                    $http.defaults.headers.common = {
                        'my-Token': token,
                        'user' : user.username
                    };
                    // service.success = true;

                    return Promise.resolve(response);
                }
                else{
                    return Promise.resolve(false);
                }
            })
            .catch(function (e) {
                return Promise.reject(e);
            });
    };
    return service;
}]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('homeController', ['UserService', '$http', 'Garment','localStorageService','$location', function(UserService, $http, Garment, localStorageService, $location) {
    var self = this;
    self.getAllClothes = function () {
        $http.get('/getAllClothes')
            .then(function (res) {
                self.Clothes = [];
                angular.forEach(res.data, function (garment) {
                    self.Clothes.push(new Garment(garment));
                });
                $http.get('/getTop5HotClothes')
                    .then(function (res) {
                        self.Top5HotClothes = [];
                        angular.forEach(res.data, function (garmentToCheck) {
                            var keepGoing = true;
                            angular.forEach(self.Clothes, function (garment) {
                                if(keepGoing) {
                                    if(garment.GarmentName == garmentToCheck.GarmentName){
                                        keepGoing = false;
                                        self.Top5HotClothes.push(garment);
                                    }
                                }
                            });
                        });
                        $http.get('/getNewClothes')
                            .then(function (res) {
                                self.NewClothes = [];
                                angular.forEach(res.data, function (garment) {
                                    self.NewClothes.push(new Garment(garment));
                                })
                                if(localStorageService.cookie.get('username')!=null &&localStorageService.cookie.get('password')!=null) {
                                    self.login();
                                };
                            })
                            .catch(function (err) {
                                alert(err);
                            });
                    })
                    .catch(function (err) {
                        alert(err);
                    });
            })
            .catch(function (err) {
                alert(err);
            });
    };
    self.login = function() {
        self.user = {
            username: localStorageService.cookie.get('username'),
            password: localStorageService.cookie.get('password')
        };
        UserService.login(self.user).then(function () {
            $location.path('/');
            self.getCart();
            // self.username = localStorageService.cookie.get('username');
            // self.lastDate =  "last entry date: "+ localStorageService.cookie.get('last entry date');
        }, function (error) {
            self.errorMessage = error.data;
            $window.alert('Username not found in the system');
        });
    };
}]);

//-------------------------------------------------------------------------------------------------------------------
app.controller('registerController',['UserService', '$location', '$window','localStorageService','$scope',
    function(UserService, $location, $window,localStorageService, $scope) {

        $scope.countries = [];
        function readContries() {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", "countries.xml", false);
            xmlhttp.send();
            var xmldata = xmlhttp.responseXML;
            var data = xmldata.getElementsByTagName("Country");
            for(i = 0; i < data.length; i++) {
                $scope.countries.push(data[i].getElementsByTagName("Name")[0].childNodes[0].nodeValue);
            }
        }
        readContries();

        var self = this;
        self.user = {
            FirstName: '',
            LastName: '',
            Adress :'',
            City: '',
            Country: '',
            Phone: '',
            Cellular: '',
            Mail: '',
            CreditCardNumber: '',
            isADmin: 0,
            username: '',
            categories: [],
            Password: ''
        };
        self.register = function(valid) {
            if (valid) {
                UserService.Create(self.user).then(function (success) {
                    if(success!=false){
                        $location.path('/login');
                        self.cookieKey ='username';
                        self.cookieValue = self.user.username;
                        self.addCookie();
                        self.cookieKey ='password';
                        self.cookieValue = self.user.Password;
                        self.addCookie();
                        self.cookieKey ='last entry date';
                        var d = new Date();
                        var today = d.toDateString();
                        self.cookieValue = today;
                        self.addCookie();
                        self.StorageKey = self.user.username;
                        var cart = {
                            clothes: []
                        };
                        self.StorageValue= cart;
                        self.addStorageData();
                    }
                    else {
                        $window.alert('Username already in system');
                    }
                }, function (error) {
                    self.errorMessage = error.data;
                    $window.alert('Username already in system');
                })
            }
        };
        self.checkSelect = function (selectedCategory,categoryData) {
            if(selectedCategory == true) {
                self.user.categories.push({CategoryID : categoryData.CategoryID});
            }
            else{
                var keepGoing = true;
                angular.forEach(self.user.categories, function (category) {
                    if(keepGoing) {
                        if(category.CategoryID == categoryData.CategoryID){
                            keepGoing = false;
                            var index = self.user.categories.indexOf(category);
                            if (index > -1) {
                                self.user.categories.splice(index, 1);
                            }
                        }
                    }
                });
            }
        };
        self.addStorageData = function () {
            var lsLength = localStorageService.length();
            var valueStored = localStorageService.get(self.StorageKey);
            if (!valueStored) {
                localStorageService.set(self.StorageKey, self.StorageValue);
            }
            else
            localStorageService.get(key);
        };

        self.addCookie = function () {
            var cookieVal = localStorageService.cookie.get(self.cookieKey);
            if (!cookieVal)
                localStorageService.cookie.set(self.cookieKey,self.cookieValue, 3);
        };
    }]);

//-------------------------------------------------------------------------------------------------------------------
app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.hashPrefix('');
}]);
app.config( ['$routeProvider', function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl : "./components/home/home.html",
            controller : "mainController"
        })
        .when("/login", {
            templateUrl : "./components/login/login.html",
            controller : "loginController"
        })
        .when("/about", {
            templateUrl : "./components/about/about.html",
            controller : "aboutController"
        })
        .when("/products", {
            templateUrl : "./components/products/products.html",
            controller : "productsController"
        })
        .when("/register", {
            templateUrl : "./components/register/register.html",
            controller : "registerController"
        })
        .when("/cart", {
            templateUrl : "./components/cart/cart.html",
            controller: 'cartController'
        })
        .when("/cart/order", {
            templateUrl : "./components/cart/order.html",
            controller: 'orderController'
        })
        .when("/storage", {
            templateUrl : "./components/storage/storage.html",
            controller: 'storageController'
        })
        .otherwise({redirect: '/'
        });
}]);
//-------------------------------------------------------------------------------------------------------------------