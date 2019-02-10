# mysql_promise
Simply module for connect to mysql with promises

## Install
```sh
npm i @utyfua/mysql_promise --save
```

## Example
```javascript
### Create connection
var Mysql=require('mysql_promise');
var mysql=await Mysql({
    "host":"127.0.0.1",
    "user":"user",
    "password":"password",
    "database":"database"
});
```
[see all options](https://www.npmjs.com/package/mysql#connection-options)
### Query to db
```javascript
console.log(await mysql('select 1 as `col`'));//[{col:1}]
console.log(await mysql('select :col as `col`',{col:'user value "`\''}));//[{col:"user value \"`'"}]
console.log(await mysql('select '+mysql.escape('user value "`\'')+' as `col`'));//[{col:"user value \"`'"}]
mysql('select 1 as `col`',function (error, results, fields){
    //your code
})
```
[see mysql query docs](https://www.npmjs.com/package/mysql#performing-queries)

## Apis
### Mysql(options)
Function for create connection.
Returned promise. He returned query function.
### Mysql.escape(value)
In order to avoid SQL Injection attacks, you should always escape any user provided data before using it inside a SQL query. You can do so using the Mysql.escape, mysql.escape(), mysql.e().
Returned escaped value.
### mysql(sqlstring [,escape object] [,callback])
Example for "escape object"
```javascript
mysql('select :col as `col`',{col:'user value "`\''}));//[{col:"user value \"`'"}]
```
Returned promise. He returned array or object(example for insert request).
### mysql.destroy()
Destroy connection
### mysql.create()
See [Mysql()](#mysqloptions)
### mysql.set_secured(function)
Set function for hide internal code this module for any.
### mysql.set_local_escape(function)
Add your function before standard escape.