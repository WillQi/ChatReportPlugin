package io.github.willqi.chatreport.plugin.webapi.data;

import com.google.gson.annotations.SerializedName;

import java.util.UUID;

public class RedisPunishment extends Punishment {

    @SerializedName("uuid")
    protected String uuidStr;


    public UUID getUUID() {
        return UUID.fromString(this.uuidStr);
    }

}
