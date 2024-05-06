
let con=require("./db")
const setUserSchema =( data, callBack)=>{
    const setUserSchemaQ=`create schema  technursery`;
    console.log(con)
    con.query(setUserSchemaQ,(error,info)=>{
        callBack(error,info);
    })

}

module.exports ={
    setUserSchema
}