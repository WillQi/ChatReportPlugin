package io.github.willqi.chatreport.plugin.webapi.data;

import com.google.gson.annotations.SerializedName;

public class Punishment {

    private int id;
    private int reportId;
    private int type;

    @SerializedName("timeLeft")
    private long fetchedTimeLeft;

    private long fetchedAt;

    public Punishment() {
        this.fetchedAt = System.currentTimeMillis();
    }


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
        return Math.max(0, (this.fetchedAt + this.fetchedTimeLeft) - System.currentTimeMillis());
    }

    public boolean isActive() {
        return this.getTimeLeft() > 0;
    }

    public enum Type {
        MUTE,
        BAN
    }

}
