const express = require('express');
const connectionhelper = require('./connetToDB')
const jwt = require('jsonwebtoken');
const jwtKey = 'my_secret_key';
const jwtExpiryTimeInMilliSeconds = 1000 * 60 * 15; // 15 min

//-------------------------------------------------------------<<<< Users >>>>-------------------------------------------------------------------

function CheckAccountByUserName(userName) {

    return new Promise(async (resolve, reject) => {
        let y = await connectionhelper.connectionfun()
        y.query(`SELECT * FROM users WHERE username ='${userName}'`, (err, rows) => {
            if (!err) {
                console.log('The data from users table are: \n', rows)
                y.release()
            } else {
                console.log(err)
                y.release()
                reject(err);
            }
            if (Object.keys(rows).length > 0) {
                console.log(rows, "from line 25")
                resolve(false)
            }
            else {
                console.log(rows, " from line 30")
                resolve(true)
            }
        })
    })
}
exports.CheckAccountByUserName = CheckAccountByUserName


function AddNewUser(req) {
    return new Promise(async (resolve, reject) => {
        let y = await connectionhelper.connectionfun()

        y.query('INSERT INTO users (username,email,birthday,password) VALUES(?,?,?,?)', [req.userName, req.Email, req.birthday, req.password], (err, rows) => {
            if (!err) {
                console.log('The data from users table are: \n', rows);
                y.release()
            } else {
                console.log(err);
                y.release()
                reject(err);
            }
        })
    })
}
exports.AddNewUser = AddNewUser



function deletAccountByuserName(userName) {
    return new Promise(async (resolve, reject) => {
        let y = await connectionhelper.connectionfun()
        y.query(`DELETE FROM users WHERE username = '${userName}'`, (err, rows) => {
            if (!err) {
                console.log('The data from users table are: \n', rows);
                y.release()
            } else {
                console.log(err);
                y.release()
                reject(err);
            }
            if (rows.affectedRows > 0) {
                resolve(true)
            }
            else {
                resolve(false)
            }
        })
    })
}
exports.deletAccountByuserName = deletAccountByuserName
//--------------------------------------------------------------------
function myCheckUserPasswordService(username, password) {
    return new Promise(async (resolve, reject) => {
        try {
            let y = await connectionhelper.connectionfun()
            y.query(`SELECT * FROM users WHERE userName ='${username}' and password='${password}' `, (err, rows) => {
                if (err) {
                    console.log("there was an error while sending query to"
                        + " db to get the customer details by uname and pass", err)
                    y.release()
                    reject(err);
                } else {
                    console.log("myCheckUserPasswordService - rtnd rows ", rows)
                    y.release()
                }
                if (Object.keys(rows).length > 0) {
                    console.log('Found data for the provided uname and pass: ', rows)
                    resolve(true)
                }
                else {
                    resolve(false)
                }
            })
        }
        catch (err) {
            reject("myCheckUserPasswordService error: ", err)
        }
    })
}
exports.myCheckUserPasswordService = myCheckUserPasswordService
//-----------------------------------------------------------------------
//     (only if username, password match our records)
const signIn = async (req, res) => {
    // Get credentials (username and password) from JSON body
    //   and use our service to check if they are OK
    const { username, password } = req.body;
    const isPassOK = await myCheckUserPasswordService(username, password);
    if (!isPassOK) {
        // return 401 error if authentication not OK  
        return res.status(401).send("username or password didnt match the info we have");
    }
    // once we got here, we know that a user with the provided uname and pass exists in the db,
    //          lets get a cart for him 
    // let cartnum
    // try {
    //     console.log("signIn - going to try to get a cart for the user");
    //     let resultFromGetCartForTheUser = await getCartForTheUser(username);
    //     cartnum = resultFromGetCartForTheUser;
    // }
    // catch (err) {
    //     console.log(`signIn - while we were waiting for getCartForTheUser there was an error:  ${err}`);
    //     return res.status(500).send("error getting a cart");
    // }

    // Create a new token with the username in the payload
    //  which expires X seconds after issue
    let token;
    try {
        let X = jwtExpiryTimeInMilliSeconds;
        token = jwt.sign({ username }, jwtKey, {
            algorithm: 'HS256',
            expiresIn: X
        })
    }
    catch (err) {
        console.log("signin - error while creating the new token: ", err);
    }
    console.log('signin - successfully creaeted token:', token)

    // set a cookie named 'token' with value = the token string we created above, 
    //   with max age 
    // here, the max age is in milliseconds, so we multiply by 1000
    res.cookie('token', token, { maxAge: jwtExpiryTimeInMilliSeconds })
    console.log(token);
    res.json({ username, token });
}
exports.signIn = signIn
//--------------------------------------------------
//--------------------------

const refresh = async (req, res) => {
    console.log("going to try to refresh the token (if there is one and it is still valid");

    let statusCode = 200 // OK
    const token = req.cookies.token;
    console.log(token, "!!!!!!!!!!!!!!!!!!!!");

    if (!token) {
        console.log('refresh - couldnt find token in cookies');
        statusCode = 401;
        return statusCode;
    }
    // once we got here, it means we did found a token in the cookies
    let payload;
    try {
        payload = jwt.verify(token, jwtKey);
    }
    catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
            console.log("refresh - jwt.JsonWebTokenError error: " + e);
            statusCode = 401
            return statusCode;
        }
        console.log('refresh - error while reading the token, but NOT a jwt.JsonWebTokenError: ', e);
        statusCode = 400;
        return statusCode;
    }

    // Once we got here it means the token was checked and is valid
    // Now, create a new token for the current user, 
    //   with a renewed expiration time
    console.log("refresh - yayyy we got payload: ", payload);
    console.log("refresh - now creating NEW TOKEN with extended time");
    const newToken = jwt.sign({ username: payload.username }, jwtKey, {
        algorithm: 'HS256',
        expiresIn: jwtExpiryTimeInMilliSeconds
    })

    // Set the new token as the users `token` cookie
    console.log(`refresh - the new refreshed token - ${newToken}`);
    res.cookie('token', newToken, { maxAge: jwtExpiryTimeInMilliSeconds })
    res.thePayload = payload;
    // once we got here it means the statusCode is still 200 (as we initialized to be)
    return statusCode; // returning 200
}
module.exports.refresh = refresh






//---------------------------------------------------------------------<<<< Images >>>>------------------------------------------------------------------------
function GetAllImages() {
    return new Promise(async (resolve, reject) => {
        let y = await connectionhelper.connectionfun()
        y.query(`SELECT* FROM cataloge `, (err, rows) => {
            if (!err) {
                console.log('The data from users table are: \n', rows);
                resolve(rows)
                y.release()

            } else {
                console.log(err);
                y.release()
                reject(err);
            }

        })

    })
}
exports.GetAllImages = GetAllImages


function GetImgByCategoreName(req) {
    return new Promise(async (resolve, reject) => {
        let y = await connectionhelper.connectionfun()
        y.query(`SELECT* FROM ${req} `, (err, rows) => {
            if (!err) {
                console.log('The data from users table are: \n', rows);
                resolve(rows)
                y.release()

            } else {
                console.log(err);
                y.release()
                reject(err);
            }

        })

    })

}

exports.GetImgByCategoreName = GetImgByCategoreName

function GetGallery() {
    return new Promise(async (resolve, reject) => {
        let y = await connectionhelper.connectionfun()
        y.query(`SELECT* FROM gallery `, (err, rows) => {
            if (!err) {
                console.log('The data from users table are: \n', rows);
                resolve(rows)
                y.release()

            } else {
                console.log(err);
                y.release()
                reject(err);
            }

        })

    })
}


exports.GetGallery = GetGallery

