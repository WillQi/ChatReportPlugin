const { sqlConnection, redisConnection } = require('../utility/database');


const CREATE_REPORT_STMT = 'INSERT INTO reports (reported_uuid, created_at, resolved_at) VALUES (?, ?, NULL)';
const GET_REPORT_STMT = 'SELECT reported_uuid, assigned_to, created_at, resolved_at FROM reports WHERE id=?';
const GET_OPEN_REPORTS_STMT = 'SELECT id, reported_uuid, assigned_to, created_at FROM reports WHERE resolved_at IS NULL ORDER BY created_at ASC LIMIT ?';
const GET_REPORTS_ASSIGNED_TO_STMT = 'SELECT id, reported_uuid, created_at FROM reports WHERE assigned_to=? AND resolved_at IS NULL ORDER BY created_at DESC';
const ASSIGN_REPORT_STMT = 'UPDATE reports SET assigned_to=? WHERE id=?';
const COMPLETE_REPORT_STMT = 'UPDATE reports SET resolved_at=? WHERE id=?';

const ADD_CHAT_LOG_STMT = 'INSERT INTO chat_logs (report_id, uuid, username, message) VALUES (?, ?, ?, ?)';
const GET_CHAT_LOGS = 'SELECT id, uuid, username, message FROM chat_logs WHERE report_id=? ORDER BY id ASC';

const ADD_PUNISHMENT_STMT = 'INSERT INTO punishments (report_id, type, assigned_at, expires_at) VALUES (?, ?, ?, ?)';

class ReportModel {

    /**
     * Create a report on a player
     * @param {string} reportedUUID reported players uuid
     * @param {{ uuid : string, username : string, message : string }[]} messages chat messages to store
     */
    async createReport(reportedUUID, messages) {
        const connection = await sqlConnection.getConnection();
        await connection.beginTransaction();
        try {
            await connection.execute(CREATE_REPORT_STMT, [reportedUUID, new Date()]);
            const [[{id}]] = await connection.query('SELECT LAST_INSERT_ID() AS id');

            for (const { uuid, username, message } of messages) {
                await connection.execute(ADD_CHAT_LOG_STMT, [id, uuid, username, message]);
            }
            
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            await connection.release();
        }
    }

    /**
     * Get a specific report by its id
     * @param {number} id 
     * @returns the report
     */
    async getReport(id) {
        const [[data]] = await sqlConnection.query(GET_REPORT_STMT, [id]);

        return {
            id,
            reportedUUID: data.reported_uuid,
            assignedTo: data.assigned_to,
            createdAt: data.created_at,
            resolvedAt: data.resolved_at
        };
    }

    /**
     * Get the chat log associated with a report
     * Will attempt to fetch it from redis if cached
     * Otherwise it will fetch from the database and cache it to redis
     * @param {number} id report id 
     * @returns chat log
     */
    async getReportChatLog(id) {
        const key = `chatlog:${id}`;
        const exists = await redisConnection('EXISTS', key);

        let messages = [];
        if (exists) {   // Fetch from cache
            await redisConnection('EXPIRE', key, 60 * 30); // reset expiry time
            const messageKeys = await redisConnection('LRANGE', key, 0, -1);
           
            for (const messageKey of messageKeys) {
                await redisConnection('EXPIRE', messageKey, 60 * 30);
                const { id, uuid, username, message } = await redisConnection('HGETALL', messageKey);
                messages.push({
                    id,
                    uuid,
                    username,
                    message
                });
            }
        } else {    // Fetch from database
            messages = (await sqlConnection.query(GET_CHAT_LOGS, [id]))[0].map(({id, uuid, username, message}) => ({
                id,
                uuid,
                username,
                message
            }));

            // try acquiring the cache lock
            const gotLock = await redisConnection('SETNX', `${key}:lock`, 1);
            if (gotLock) {
                // add messages to redis cache
                try {
                    // add all chat keys to an array that links to the chat message
                    for (const { id, uuid, username, message } of messages) {
                        const messageKey = `${key}:${id}`;
                        await redisConnection('HSET', messageKey, 'id', id, 'uuid', uuid, 'username', username, 'message', message);
                        await redisConnection('EXPIRE', messageKey, 60 * 30);
                        
                        await redisConnection('RPUSH', key, messageKey);
                    }
                    await redisConnection('EXPIRE', key, 60 * 30);
                } catch (error) {
                    await redisConnection('DEL', key, ...messages.map(message => `${key}:${message.id}`));
                    throw error;
                } finally {
                    await redisConnection('DEL', `${key}:lock`);
                }
            }
        }

        return messages;
    }

    /**
     * Get reports that have not been resolved sorted by when they were submitted in ascending order
     * @param {number} amount amount of reports to fetch
     * @returns open reports
     */
    async getOpenReports(amount = 10) {
        const reports = (await sqlConnection.query(GET_OPEN_REPORTS_STMT, [amount]))[0]
            .map(report => ({
                id: report.id,
                reportedUUID: report.reported_uuid,
                assignedTo: report.assigned_to,
                createdAt: report.created_at
            }));

        return reports;
    }

    /**
     * Get all reports that are assigned to a user
     * @param {number} assignedTo user id
     * @returns reports assigned
     */
    async getReportsAssignedTo(assignedTo) {
        const reports = (await sqlConnection.query(GET_REPORTS_ASSIGNED_TO_STMT, [userId]))[0]
            .map(report => ({
                assignedTo,
                id: report.id,
                reportedUUID: report.reported_uuid,
                createdAt: report.created_at
            }));

        return reports;
    }

    /**
     * Assign a report to a user
     * @param {number} reportId id of the report
     * @param {number} userId id of the user we are assigning the report to
     */
    async assignReport(reportId, userId) {
        await sqlConnection.execute(ASSIGN_REPORT_STMT, [userId, reportId]);
    }

    /**
     * Complete a report
     * @param {number} id id of the report
     * @param {'reject'|'ban'|'mute'} action report action
     * @param {number} [length] amount of ms the punishment lasts 
     */
    async completeReport(id, action, length) {
        const connection = await sqlConnection.getConnection();
        await connection.beginTransaction();
        try {
            await connection.execute(COMPLETE_REPORT_STMT, [new Date(), id]);

            // Only add a punishment entry if we aren't rejecting the report
            if (action !== 'reject') {
                const isBan = action === 'ban';
                await connection.execute(ADD_PUNISHMENT_STMT, [id, (isBan ? 1 : 0), new Date(), new Date(Date.now() + length)]);
            }
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            await connection.release();
        }
    }

}

const reportModel = new ReportModel();
module.exports = reportModel;