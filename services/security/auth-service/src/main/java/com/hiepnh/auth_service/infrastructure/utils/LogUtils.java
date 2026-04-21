package com.hiepnh.auth_service.infrastructure.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.event.Level;

public class LogUtils {
    private static final String INFO_PATTERN = "[{}] - {}";
    private static final String ERROR_PATTERN = "[{}] - Error: {} - Message: {}";

    public static void log(Class<?> clazz, Level level, String action, String message) {
        Logger logger = LoggerFactory.getLogger(clazz);

        switch (level) {
            case INFO -> logger.info(INFO_PATTERN, action, message);
            case WARN -> logger.warn(INFO_PATTERN, action, message);
            case ERROR -> logger.error(INFO_PATTERN, action, message);
            case DEBUG -> logger.debug(INFO_PATTERN, action, message);
            case TRACE -> logger.trace(INFO_PATTERN, action, message);
        }
    }

    public static void logError(Class<?> clazz, String action, String error, String message) {
        Logger logger = LoggerFactory.getLogger(clazz);
        logger.error(ERROR_PATTERN, action, error, message);
    }

    public static void logError(Class<?> clazz, String action, String error, Exception ex) {
        Logger logger = LoggerFactory.getLogger(clazz);
        logger.error(ERROR_PATTERN, action, error, ex.getMessage(), ex);
    }
}