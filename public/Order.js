/**
 * Created by moran azran on 6/22/2017.
 */
app.factory('Order', ['$http', function($http,Order) {
    function Order(order) {
        if (order)
            this.setData(order);
    }
    Order.prototype = {
        setData: function(orderData) {
            angular.extend(this, orderData);
        }
    };
    return Order;
}]);