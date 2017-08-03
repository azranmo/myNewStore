/**
 * Created by moran azran on 6/21/2017.
 */

app.factory('Category', ['$http', function($http) {
    function Category(category) {
        if (category)
            this.setData(category);
    }
    Category.prototype = {
        setData: function(category) {
            angular.extend(this, category);
        }
    };
    return Category;
}]);