package com.hiepnh.account_service.domain.entity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Account {
    private String id;
    private String name;
    private String alias;
    private String assetCode;
    private String type;
    private Status status;

    public static class Status {
        private String code;
        private String description;
    }
}