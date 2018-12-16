var Mysql=require('mysql2');
var connecter=(config)=>{
    var connection=Mysql.createConnection(config);
    var tmp_wait;
    var f_err=function(q) {
        if(q.code==='PROTOCOL_CONNECTION_LOST'){
            if(!tmp_wait)tmp_wait=[];
            else if(tmp_wait.length)
                f_reconn();
            return;
        }
        console.error('mysql global error',q)
    };
    var f_reconn=()=>{
        var old_conn=connection;
        connection=Mysql.createConnection(config);
        connection.connect(err=>{
            if(err)throw err;
            f_init()
            tmp_wait.forEach(c=>c());
            tmp_wait=null;
        });
        old_conn.destroy();
    };
    var f_init=()=>{
        connection.on('error', f_err);
        connection.config.queryFormat=function(query,values){
            if(!values)return query;
            return query.replace(/\:(\w+)/g,function (txt,key){
                return values.hasOwnProperty(key)?mysqlCC.escape(values[key]):txt;
            }.bind(this));};
    };
    var secured=q=>q;
    var mysqlCC=secured(function(...ar){
        for(var i=0;i<ar.length;i++){
            if(typeof ar=='function')
                return connection.query(...ar)
        }
        return new Promise(resolve=>{
            if(!tmp_wait)return resolve();
            tmp_wait.push(resolve);
            if(tmp_wait.length==1)
                f_reconn();
        }).then(()=>new Promise(resolve=>{
            ar[ar.length]=(e,r,i)=>{
                if(e)console.error('mysql',{e,i:{req:ar}})
                if(!r)r=[];
                r.error=e;
                r.fields=i;
                return resolve(r)
            }
            connection.query(...ar)
        }));
    });
    connection.on('error', f_err);
    var local_escape;
    return new Promise((c)=>connection.connect(c))
        .then(err=>{
            if(err)throw err;
            f_init();
            mysqlCC.escape=mysqlCC.e=secured(v=>{
                if(local_escape)v=local_escape(v);
                return Mysql.escape(v);
            });
            mysqlCC.create=secured(connecter);
            mysqlCC.destroy=secured(()=>connection.destroy());
            mysqlCC.set_secured=ccc=>secured=ccc;
            mysqlCC.set_local_escape=ccc=>local_escape=ccc;
            mysqlCC.get_connection=()=>connection;
            return mysqlCC;
        });
}
module.exports=connecter;