package com.hiepnh.account_service.adapter.gateway;

import com.hiepnh.account_service.application.port.out.AccountOutputPort;
import com.hiepnh.account_service.domain.entity.Account;
import com.hiepnh.account_service.domain.entity.AccountResponseWrapper;
import com.hiepnh.account_service.infrastructure.config.AppConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@Component
public class CoreBankingGateway implements AccountOutputPort {

    private final RestTemplate restTemplate;
    private final AppConfig appConfig;

    public CoreBankingGateway(RestTemplate restTemplate, AppConfig appConfig) {
        this.restTemplate = restTemplate;
        this.appConfig = appConfig;
    }

    @Override
    public Account fetchAccountDetails(String accountId) {
        // Simulated call to a core banking system
        return null;
    }

    public List<Account> fetchAccounts() {
        Logger logger = LoggerFactory.getLogger(CoreBankingGateway.class);

        try {
            String url = UriComponentsBuilder.fromHttpUrl(appConfig.midazBaseUrl() + appConfig.getListAccountsPath())
                    .queryParam("page", appConfig.pageNumber())
                    .queryParam("limit", appConfig.pageSize())
                    .buildAndExpand(appConfig.organizationId(), appConfig.ledgerId())
                    .toUriString();

            logger.info("Fetching accounts from URL: {}", url);

            AccountResponseWrapper responseWrapper = restTemplate.getForObject(url, AccountResponseWrapper.class);

            logger.info("Response received: {}", responseWrapper);

            return responseWrapper != null ? responseWrapper.getItems() : List.of();
        } catch (HttpClientErrorException e) {
            logger.error("HTTP error while fetching accounts: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch accounts: " + e.getStatusCode());
        } catch (RestClientException e) {
            logger.error("Error while fetching accounts: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch accounts due to a client error.");
        } catch (Exception e) {
            logger.error("Unexpected error while fetching accounts: {}", e.getMessage());
            throw new RuntimeException("An unexpected error occurred while fetching accounts.");
        }
    }
}