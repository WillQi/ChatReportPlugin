const { redisConnection } = require('../utility/database');
const userModel = require('./users');

const CODE_LENGTH = 8;  // amount of characters to generate for the code

const EXPIRY_TIME = 60 * 10;    // 10 minutes to go in-game to confirm your code

function generateCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let code = "registration:";
    for (let i = 0; i < CODE_LENGTH; i++) {
        code += characters[Math.floor(Math.random() * characters.length)];
    }
    return code;
}

class RegistrationModel {

    async createRegistrationCode(username, password) {
        // Generate an unused code
        let code = null;
        while (code === null) {
            code = await new Promise(function(resolve, reject) {
                const generated = generateCode();
                redisConnection.HSETNX(generated, 'username', username, function(err, response) {
                    if (err !== null) {
                        reject(err);
                        return;
                    }

                    if (response === 1) {
                        resolve(generated);
                    } else {
                        resolve(null);
                    }
                });
            });
        }

        // The username property was applied, but we need to apply the other object properties
        try {
            await new Promise(async function (resolve, reject){
                const hash = await userModel.generateHash(password);
                redisConnection.HSET(code, 'password', hash, function(err, _) {
                    if (err !== null) {
                        reject(err);
                        return;
                    }

                    // Delete the user's registration if they're too slow in verifying
                    redisConnection.EXPIRE(code, EXPIRY_TIME, function(err, _) {
                        if (err !== null) {
                            reject(err);
                        } else {
                            resolve(null);
                        }
                    });
                });
            });
        } catch (error) {
            // Delete the entry
            redisConnection.DEL(code, function(err, _) {
                if (err !== null) {
                    console.error(`Failed to delete registration code: ${code}`, err);
                }
            });
            throw error;
        }

        return code;
    }

    async deleteRegistrationByCode(code) {
        await new Promise(function(resolve, reject) {
            redisConnection.DEL(code, function(err, _) {
                if (err !== null) {
                    reject(err);
                } else {
                    resolve(null);
                }
            });
        });
    }

    async getRegistrationByCode(code) {
        const storedData = await new Promise(function(resolve, reject) {
            redisConnection.HGETALL(code, function(err, data) {
                if (err !== null) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        if (!storedData) {
            return null;
        }

        const { username, password } = storedData;
        return {
            username,
            password
        };
    }

}

const registrationModel = new RegistrationModel();
module.exports = registrationModel;