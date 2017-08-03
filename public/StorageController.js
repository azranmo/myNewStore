/**
 * Created by moran azran on 6/22/2017.
 */
angular.module("myApp")
    .controller('storageController', ['localStorageService','$window', function (localStorageService, $window) {
        var self = this;
        self.value1 = '';
        self.value2 = '';

        self.addData = function () {
            var lsLength = localStorageService.length();
            var valueStored = localStorageService.get(self.key1);
            if (!valueStored) {
                if (localStorageService.set(self.key1, self.value1))
                    $window.alert('data was added successfully');
                else
                    $window.alert('failed to add the data');
            }
            else
                $window.alert('failed to add the data');

            localStorageService.get(key);
        };
        self.deleteData = function () {
            var valueStored = localStorageService.get(self.key1);
            if (valueStored) {
                localStorageService.remove(self.key1);
                $window.alert('data was deleted successfully');
            }
            else
                $window.alert('failed to delete the data');
        };

        self.addCookie = function () {
            var cookieVal = localStorageService.cookie.get(self.cookieKey);
            if (!cookieVal)
                if (localStorageService.cookie.set(self.cookieKey,self.cookieValue, 3))
                    $window.alert('cookie was added successfully');
                else
                    $window.alert('failed to add the cookie');
            else
                $window.alert('failed to add the cookie');
        };

        self.deleteCookie = function () {

            var cookieVal = localStorageService.cookie.get(self.cookieKey);
            if (cookieVal) {
                localStorageService.cookie.remove(self.cookieKey);
                $window.alert('data was deleted successfully');
            }
            else
                $window.alert('failed to delete the cookie');
        };
    }]);