package io.github.willqi.chatreport.plugin.utils;

import org.bukkit.ChatColor;

public class TextUtils {

    public static final ChatColor DEFAULT_HEADER_COLOR = ChatColor.BLUE;
    public static final ChatColor DEFAULT_MESSAGE_COLOR = ChatColor.GRAY;

    public static String formatMessage(String header, String message) {
        return formatMessage(header, DEFAULT_HEADER_COLOR, message, DEFAULT_MESSAGE_COLOR);
    }

    public static String formatMessage(String header, String message, ChatColor messageColor) {
        return formatMessage(header, DEFAULT_HEADER_COLOR, message, messageColor);
    }

    public static String formatMessage(String header, ChatColor headerColor, String message, ChatColor messageColor) {
        return String.format("%s%s> %s%s", headerColor.toString(), header, messageColor.toString(), message);
    }

}
