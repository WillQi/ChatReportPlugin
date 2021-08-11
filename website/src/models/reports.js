const { sqlConnection } = require('../utility/database');

const CREATE_REPORT_STMT = 'INSERT INTO reports (reported_uuid) VALUES (?, ?)';
const GET_REPORT_STMT = 'SELECT reported_uuid, assigned_to, created_at, resolved_at FROM reports WHERE id=?';
const GET_OPEN_REPORTS_STMT = 'SELECT id, reported_uuid, assigned_to, created_at FROM reports WHERE resolved_at=NULL ORDER BY created_at ASC LIMIT ?';
const GET_REPORTS_ASSIGNED_TO_STMT = 'SELECT id, reported_uuid, created_at FROM reports WHERE assigned_to=? AND resolved_at=NULL ORDER BY created_at DESC';
const ASSIGN_REPORT_STMT = 'UPDATE reports SET assigned_to=? WHERE id=?';
const COMPLETE_REPORT_STMT = 'UPDATE reports SET resolved_at=? WHERE id=?';

class ReportModel {

    async createReport(reportedUUID) {
        await sqlConnection.execute(CREATE_REPORT_STMT, [reportedUUID]);
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
        await sqlConnection.execute(COMPLETE_REPORT_STMT, [Date.now(), id]);
    }

}

const reportModel = new ReportModel();
module.exports = reportModel;