/**
 * Created by moran azran on 6/21/2017.
 */
app.factory('Garment', ['$http', function($http) {
    function Garment(garment) {
        if (garment)
            this.setData(garment);
    }
    Garment.prototype = {
        setData: function(garmentData) {
            angular.extend(this, garmentData);
        },
        add: function () {
            $http.post('/addGarment', this).then(function(res) {
            });
        },
        delete: function() {
            $http.delete('/deleteGarment' + this.id); //not implemented
        }
    };
    return Garment;
}]);
