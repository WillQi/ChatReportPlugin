package io.github.willqi.chatreport.plugin.webapi.data;

import java.util.Set;

public class PunishmentResponse {

    protected int status;
    protected String message;
    protected Set<Punishment> punishments;


    public int getStatus() {
        return this.status;
    }

    public String getMessage() {
        return this.message;
    }

    public Set<Punishment> getPunishments() {
        return this.punishments;
    }

}
