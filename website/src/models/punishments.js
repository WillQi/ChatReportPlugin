const { redisConnection, sqlConnection } = require('../utility/database');

const GET_ACTIVE_PUNISHMENTS_STMT = 'SELECT punishments.id, punishments.report_id, punishments.type, punishments.assigned_at, punishments.expires_at FROM punishments INNER JOIN reports ON reports.id=punishments.report_id AND reports.reported_uuid=? AND punishments.expires_at > ?';

class PunishmentModel {

    async getActivePunishmentsByUUID(uuid) {
        const punishmentsKey = `punishments:${uuid}`;
        let punishments = [];

        const existsInCache = await redisConnection('EXISTS', punishmentsKey);
        if (existsInCache) {    
            // fetch from redis cache
            await redisConnection('EXPIRE', punishmentsKey, 60000 * 30);

            const cachedPunishments = await redisConnection('LRANGE', punishmentsKey, 0, -1);
            for (const punishmentId of cachedPunishments) {
                const punishmentData = await redisConnection('HGETALL', punishmentId);
                // Check if cached punishment has expired or not
                if (punishmentData.expiresAt && Date.now() >= parseInt(punishmentData.expiresAt)) {  
                    // Punishment expired
                    await redisConnection('DEL', punishmentId);
                    await redisConnection('LREM', punishmentsKey, 1, punishmentId);
                } else {    
                    // Punishment has not expired
                    await redisConnection('EXPIRE', punishmentId, 60000 * 30);

                    const { reportId, type, expiresAt } = punishmentData;
                    punishments.push({
                        reportId: parseInt(reportId),
                        type: parseInt(type),
                        timeLeft: new Date(parseInt(expiresAt)).getTime() - Date.now()
                    });
                }
            }

            return punishments;
        } else {    
            // fetch from database and add to redis
            const [punishmentsRows] = (await sqlConnection.query(GET_ACTIVE_PUNISHMENTS_STMT, [uuid, new Date()]));

            // try adding to redis cache
            const gotLock = await redisConnection('SETNX', `${punishmentsKey}:lock`, 1);
            if (gotLock) {
                try {
                    // add all punishment keys to an array that links to the punishment data
                    for (const row of punishmentsRows) {
                        const entryKey = `punishment:${row.id}`;
                        await redisConnection('HSET', entryKey, 'reportId', row.report_id, 'type', row.type, 'expiresAt', row.expires_at.getTime(), 'assignedAt', row.assigned_at.getTime());
                        await redisConnection('EXPIRE', entryKey, 60000 * 30);
                        
                        await redisConnection('LPUSH', punishmentsKey, entryKey);
                    }
                    await redisConnection('EXPIRE', punishmentsKey, 60000 * 30);
                } catch (error) {
                    // Remove punishments from redis on error
                    await redisConnection('DEL', punishmentsKey, ...punishments.map(punishment => `punishment:${punishment.id}`));
                    throw error;
                } finally {
                    await redisConnection('DEL', `${punishmentsKey}:lock`);
                }
            }

            punishments = punishmentsRows.map(punishment => {
                const { report_id : reportId, type, expires_at : expiresAt }  = punishment;
                return {
                    reportId,
                    type,
                    timeLeft: expiresAt.getTime() - Date.now()
                };
            });
        }

        return punishments;
    }

}

const punishmentModel = new PunishmentModel();
module.exports = punishmentModel;