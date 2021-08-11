const { sqlConnection, redisConnection } = require('../utility/database');


const CREATE_REPORT_STMT = 'INSERT INTO reports (reported_uuid, created_at) VALUES (?, ?)';
const GET_REPORT_STMT = 'SELECT reported_uuid, assigned_to, created_at, resolved_at FROM reports WHERE id=?';
const GET_OPEN_REPORTS_STMT = 'SELECT id, reported_uuid, assigned_to, created_at FROM reports WHERE resolved_at=NULL ORDER BY created_at ASC LIMIT ?';
const GET_REPORTS_ASSIGNED_TO_STMT = 'SELECT id, reported_uuid, created_at FROM reports WHERE assigned_to=? AND resolved_at=NULL ORDER BY created_at DESC';
const ASSIGN_REPORT_STMT = 'UPDATE reports SET assigned_to=? WHERE id=?';
const COMPLETE_REPORT_STMT = 'UPDATE reports SET resolved_at=? WHERE id=?';

const ADD_CHAT_LOG_STMT = 'INSERT INTO chat_logs (report_id, uuid, username, message) VALUES (?, ?, ?, ?)';
const GET_CHAT_LOGS = 'SELECT id, uuid, username, message FROM chat_logs WHERE report_id=? ORDER BY id ASC';

class ReportModel {

    async createReport(reportedUUID, messages) {
        const connection = await sqlConnection.getConnection();
        await connection.beginTransaction();
        await connection.execute(CREATE_REPORT_STMT, [reportedUUID, new Date()]);
        const [[{id}]] = await connection.query('SELECT LAST_INSERT_ID() AS id');

        try {
            for (const { uuid, username, message } of messages) {
                await connection.execute(ADD_CHAT_LOG_STMT, [id, uuid, username, message]);
            }
            
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        }
        connection.release();
    }

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
                    for (const { id, uuid, username, message } of messages) {
                        const messageKey = `${key}:${id}`;
                        await redisConnection('HSET', messageKey, 'id', id, 'uuid', uuid, 'username', username, 'message', message);
                        await redisConnection('EXPIRE', messageKey, 60 * 30);
                        
                        await redisConnection('RPUSH', key, messageKey);
                    }
                    await redisConnection('EXPIRE', key, 60 * 30);
                } catch (error) {
                    await redisConnection('DEL', key, `${key}:lock`, ...messages.map(message => `${key}:${message.id}`));
                    throw error;
                }
                await redisConnection('DEL', `${key}:lock`);
            }
        }

        return messages;
    }

    async getOpenReports(amount = 10) {
        const reports = (await sqlConnection.query(GET_OPEN_REPORTS_STMT, [amount]))
            .map(report => ({
                id: report.id,
                reportedUUID: report.reported_uuid,
                assignedTo: data.assigned_to,
                createdAt: data.created_at
            }));

        return reports;
    }

    async getReportsAssignedTo(assignedTo) {
        const reports = (await sqlConnection.query(GET_REPORTS_ASSIGNED_TO_STMT, [userId]))
            .map(report => ({
                assignedTo,
                id: report.id,
                reportedUUID: report.reported_uuid,
                createdAt: data.created_at
            }));

        return reports;
    }

    async assignReport(reportId, userId) {
        await sqlConnection.execute(ASSIGN_REPORT_STMT, [userId, reportId]);
    }

    async completeReport(id) {
        await sqlConnection.execute(COMPLETE_REPORT_STMT, [new Date(), id]);
    }

}

const reportModel = new ReportModel();
module.exports = reportModel;