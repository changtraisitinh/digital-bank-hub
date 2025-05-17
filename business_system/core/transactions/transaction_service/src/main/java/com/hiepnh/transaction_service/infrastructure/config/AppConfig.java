package com.hiepnh.transaction_service.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Value("${midaz.url}")
    private String midazBaseUrl;

    @Value("${midaz.transaction.get_list_transactions.path}")
    private String getListTransactionsPath;

    @Value("${midaz.transaction.create_transaction.path}")
    private String createTransactionPath;

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
    public String getListTransactionsPath() {
        return getListTransactionsPath;
    }

    @Bean
    public String createTransactionPath() {
        return createTransactionPath;
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