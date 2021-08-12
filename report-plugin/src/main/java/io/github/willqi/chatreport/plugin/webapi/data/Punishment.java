package io.github.willqi.chatreport.plugin.webapi.data;

public class Punishment {

    private int id;
    private int reportId;
    private int type;
    private long timeLeft;


    public int getId() {
        return this.id;
    }

    public int getReportId() {
        return this.reportId;
    }

    public Type getType() {
        return Type.values()[this.type];
    }

    public long getTimeLeft() {
        return this.timeLeft;
    }

    public enum Type {
        MUTE,
        BAN
    }

}
