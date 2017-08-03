<<<<<<< HEAD
/**
 * Created by moran azran on 6/4/2017.
 */
//this is only an example, handling everything is yours responsibilty !

var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

//----------------------------------------------------------------------------------------------------------------------

exports.Select = function (connection, query){
    return new Promise(function (resolve,reject){
        var ans = [];
        var properties = [];
        var req = new Request (query, function(err, rowCount){
            if(err){
                console.log('err insert '+err.message);
                reject(err.message);
            }
        });
        req.on('columnMetadata', function (columns) {
            columns.forEach(function (column) {
                if (column.colName != null)
                    properties.push(column.colName);
            });
        });
        req.on('row', function (row) {
            var item = {};
            for (i=0; i<row.length; i++) {
                item[properties[i]] = row[i].value;
            }
            ans.push(item);
        });
        req.on('requestCompleted', function(){
            console.log('request Completed: '+ req.rowCount + ' row(s) returned');
            resolve(ans);
        });
        connection.execSql(req);
    });
};
//----------------------------------------------------------------------------------------------------------------------

exports.Insert = function (connection, query){
    return new Promise(function (resolve,reject){
        var req = new Request (query, function(err, rowCount){
            if(err){
                console.log('err insert'+err.message);
                reject(err.message);
            }
        });
        req.on('requestCompleted', function(){
            console.log('requestCompleted with '+req.rowCount + ' row(s)');
            resolve(true);
        });
        connection.execSql(req);
    });
};
//----------------------------------------------------------------------------------------------------------------------
// exports.InsertMany = function (connection, query, values){
//     return new Promise(function (resolve,reject){
//         var req = new Request (query,values,function(err, rowCount){
//             if(err){
//                 console.log('err insert'+err.message);
//                 reject(err.message);
//             }
//         });
//         req.on('requestCompleted', function(){
//             console.log('requestCompleted with '+req.rowCount + ' row(s)');
//             resolve(true);
//         });
//         connection.execSql(req);
//     });
// };
//----------------------------------------------------------------------------------------------------------------------
exports.Delete = function (connection, query){
    return new Promise(function (resolve,reject){
        var req = new Request (query, function(err, rowCount){
            if(err){
                console.log('err insert'+err.message);
                reject(err.message);
            }
        });
        req.on('requestCompleted', function(){
            console.log('requestCompleted with '+req.rowCount + ' row(s)');
            resolve(true);
        });
        connection.execSql(req);
    });
};
//----------------------------------------------------------------------------------------------------------------------

exports.Update = function (connection, query){
    return new Promise(function (resolve,reject){
        var req = new Request (query, function(err, rowCount){
            if(err){
                console.log('err insert'+err.message);
                reject(err.message);
            }
        });
        req.on('requestCompleted', function(){
            console.log('requestCompleted with '+req.rowCount + ' row(s)');
            resolve(true);
        });
        connection.execSql(req);
    });
};

=======
/**
 * Created by moran azran on 6/4/2017.
 */
//this is only an example, handling everything is yours responsibilty !

var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

//----------------------------------------------------------------------------------------------------------------------

exports.Select = function (connection, query){
    return new Promise(function (resolve,reject){
        var ans = [];
        var properties = [];
        var req = new Request (query, function(err, rowCount){
            if(err){
                console.log('err insert '+err.message);
                reject(err.message);
            }
        });
        req.on('columnMetadata', function (columns) {
            columns.forEach(function (column) {
                if (column.colName != null)
                    properties.push(column.colName);
            });
        });
        req.on('row', function (row) {
            var item = {};
            for (i=0; i<row.length; i++) {
                item[properties[i]] = row[i].value;
            }
            ans.push(item);
        });
        req.on('requestCompleted', function(){
            console.log('request Completed: '+ req.rowCount + ' row(s) returned');
            resolve(ans);
        });
        connection.execSql(req);
    });
};
//----------------------------------------------------------------------------------------------------------------------

exports.Insert = function (connection, query){
    return new Promise(function (resolve,reject){
        var req = new Request (query, function(err, rowCount){
            if(err){
                console.log('err insert'+err.message);
                reject(err.message);
            }
        });
        req.on('requestCompleted', function(){
            console.log('requestCompleted with '+req.rowCount + ' row(s)');
            resolve(true);
        });
        connection.execSql(req);
    });
};
//----------------------------------------------------------------------------------------------------------------------
// exports.InsertMany = function (connection, query, values){
//     return new Promise(function (resolve,reject){
//         var req = new Request (query,values,function(err, rowCount){
//             if(err){
//                 console.log('err insert'+err.message);
//                 reject(err.message);
//             }
//         });
//         req.on('requestCompleted', function(){
//             console.log('requestCompleted with '+req.rowCount + ' row(s)');
//             resolve(true);
//         });
//         connection.execSql(req);
//     });
// };
//----------------------------------------------------------------------------------------------------------------------
exports.Delete = function (connection, query){
    return new Promise(function (resolve,reject){
        var req = new Request (query, function(err, rowCount){
            if(err){
                console.log('err insert'+err.message);
                reject(err.message);
            }
        });
        req.on('requestCompleted', function(){
            console.log('requestCompleted with '+req.rowCount + ' row(s)');
            resolve(true);
        });
        connection.execSql(req);
    });
};
//----------------------------------------------------------------------------------------------------------------------

exports.Update = function (connection, query){
    return new Promise(function (resolve,reject){
        var req = new Request (query, function(err, rowCount){
            if(err){
                console.log('err insert'+err.message);
                reject(err.message);
            }
        });
        req.on('requestCompleted', function(){
            console.log('requestCompleted with '+req.rowCount + ' row(s)');
            resolve(true);
        });
        connection.execSql(req);
    });
};

>>>>>>> 975d93af26a98df9fd6cbf5fb7e1b6de6d1ee92f
