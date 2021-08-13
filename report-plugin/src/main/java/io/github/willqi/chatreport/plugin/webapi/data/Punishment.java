package io.github.willqi.chatreport.plugin.webapi.data;

import com.google.gson.annotations.SerializedName;

public class Punishment {

    protected int reportId;
    protected int type;

    @SerializedName("timeLeft")
    protected long fetchedTimeLeft;

    private long fetchedAt;

    public Punishment() {
        this.fetchedAt = System.currentTimeMillis();
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

    @Override
    public int hashCode() {
        return (37 * this.type) + (37 * this.reportId);
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof Punishment) {
            Punishment otherPunishment = (Punishment)obj;
            return otherPunishment.getReportId() == this.getReportId();
        }
        return false;
    }

    public enum Type {
        MUTE,
        BAN
    }

}
