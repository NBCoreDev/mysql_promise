var Mysql=require('mysql');
var escape=v=>{
    return Mysql.escape(v);
}
var secured=q=>q;
var connecter=(config)=>{
    var connection=Mysql.createConnection(config);
    return new Promise((c)=>connection.connect(c))
        .then(err=>{
            if(err)throw err;
            connection.config.queryFormat=function(query,values){
                if(!values)return query;
                return query.replace(/\:(\w+)/g,function (txt,key){
                    if(values.hasOwnProperty(key)){
                        return escape(values[key]);
                    }
                    return txt;
                }.bind(this));};
            var mysqlCC=secured(function(...ar){
                for(var i=0;i<ar.length;i++){
                    if(typeof ar=='function')
                        return connection.query(...ar)
                }
                return new Promise(resolve=>{
                    ar[ar.length]=(e,r,i)=>{
                        if(e)console.error('mysql',{e,i:{req:ar}})
                        if(!r)r=[];
                        //TODO: create prototype mysql response
                        //r.__proto__.error=e;
                        //r.__proto__.info=i;
                        return resolve(r)
                    }
                    connection.query(...ar)
                });
            });
            mysqlCC.escape=mysqlCC.e=secured(escape);
            mysqlCC.create=secured(connecter);
            mysqlCC.destroy=secured(()=>connection.destroy());
            return mysqlCC;
        })
    
}
module.exports=connecter;