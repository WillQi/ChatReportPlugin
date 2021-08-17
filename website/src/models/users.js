const bcrypt = require('bcrypt');
const { sqlConnection } = require('../utility/database');

const GET_USER_BY_USERNAME_STMT = 'SELECT id, password, is_admin FROM users WHERE username=?';
const GET_USER_BY_ID_STMT = 'SELECT username, password, is_admin FROM users WHERE id=?';
const LIST_ALL_USERS_QUERY = 'SELECT id, username, is_admin FROM users';
const CREATE_USER_STMT = 'INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)';
const DELETE_USER_STMT = 'DELETE FROM users WHERE id=?';

const SALT_ROUNDS = 8;

class UsersModel {

    async getUserByUsername(username) {
        const [[row]] = await sqlConnection.query(GET_USER_BY_USERNAME_STMT, [username]);
        if (!row) {
            return null;
        }
        const { id, password: hash, is_admin } = row;
        
        return {
            id,
            username,
            hash,
            isAdmin: !!is_admin
        };
    }

    async getUserById(id) {
        const [[row]] = await sqlConnection.query(GET_USER_BY_ID_STMT, [id]);
        if (!row) {
            return null;
        }
        const { username, password: hash, is_admin } = row;
        
        return {
            id,
            username,
            hash,
            isAdmin: !!is_admin
        };
    }

    async getAllUsers() {
        const users = (await sqlConnection.query(LIST_ALL_USERS_QUERY))[0];

        return users.map(data => ({
            id: data.id,
            username: data.username,
            isAdmin: data.is_admin
        }));
    }

    async createUser(username, rawPassword, isAdmin = false) {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hash = await bcrypt.hash(rawPassword, salt);

        await sqlConnection.execute(CREATE_USER_STMT, [username, hash, isAdmin]);
    }

    async deleteUser(id) {
        await sqlConnection.emit(DELETE_USER_STMT, [id]);
    }

    async checkLogin(username, password) {
        const user = await this.getUserByUsername(username);
        if (!user) return false;

        const validLogin = await bcrypt.compare(password, user.hash);
        return validLogin;
    }

}

const usersModel = new UsersModel();
module.exports = usersModel;