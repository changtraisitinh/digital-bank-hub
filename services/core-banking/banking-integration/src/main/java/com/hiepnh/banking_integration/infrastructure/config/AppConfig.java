package com.hiepnh.banking_integration.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Value("${midaz.url}")
    private String midazBaseUrl;

    @Value("${midaz.account.get_list_accounts.path}")
    private String getListAccountsPath;

    @Value("${midaz.page_size}")
    private int pageSize;

    @Value("${midaz.page_number}")
    private int pageNumber;

    @Value("${midaz.organization_id}")
    private String organizationId;

    @Value("${midaz.ledger_id}")
    private String ledgerId;

    @Bean
    public String midazBaseUrl() {
        return midazBaseUrl;
    }

    @Bean
    public String getListAccountsPath() {
        return getListAccountsPath;
    }

    @Bean
    public int pageSize() {
        return pageSize;
    }

    @Bean
    public int pageNumber() {
        return pageNumber;
    }

    @Bean
    public String organizationId() {
        return organizationId;
    }

    @Bean
    public String ledgerId() {
        return ledgerId;
    }
}
