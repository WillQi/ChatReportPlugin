package io.github.willqi.chatreport.plugin.webapi.data;

import java.util.List;

public class PunishmentResponse {

    private int status;
    private String message;
    private List<Punishment> punishments;


    public int getStatus() {
        return this.status;
    }

    public String getMessage() {
        return this.message;
    }

    public List<Punishment> getPunishments() {
        return this.punishments;
    }

}
