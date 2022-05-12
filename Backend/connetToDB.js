const mysql = require('mysql')

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    //password: 'password',
    database: 'database'
})

function connectionfun() {
    return new Promise((resolve, reject) => {
        pool.getConnection(async (err, connection) => {
            if (err) reject(err)
            else {
                resolve(connection);
            }
        })
    })

}
module.exports.connectionfun = connectionfun
