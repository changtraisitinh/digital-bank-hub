package com.hiepnh.transaction_service.adapter.gateway;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiepnh.transaction_service.application.port.out.TransactionOutputPort;
import com.hiepnh.transaction_service.application.usecase.dto.TransactionCreateRequestDTO;
import com.hiepnh.transaction_service.application.usecase.dto.TransactionCreateResponseDTO;
import com.hiepnh.transaction_service.application.usecase.dto.TransactionResponseDTO;
import com.hiepnh.transaction_service.domain.entity.Transaction;
import com.hiepnh.transaction_service.domain.entity.TransactionCreateResponseWrapper;
import com.hiepnh.transaction_service.domain.entity.TransactionResponseWrapper;
import com.hiepnh.transaction_service.infrastructure.config.AppConfig;
import org.apache.tomcat.util.json.JSONFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;

@Component
public class CoreBankingGateway implements TransactionOutputPort {
    private final RestTemplate restTemplate;
    private final AppConfig appConfig;
    private final ObjectMapper objectMapper;

    public CoreBankingGateway(RestTemplate restTemplate, AppConfig appConfig, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.appConfig = appConfig;
        this.objectMapper = objectMapper;
    }

    @Override
    public Transaction createTransaction(TransactionCreateRequestDTO transactionCreateRequestDTO) {
        Logger logger = LoggerFactory.getLogger(CoreBankingGateway.class);

        try {
            String url = UriComponentsBuilder.fromHttpUrl(appConfig.midazBaseUrl() + appConfig.createTransactionPath())
                    .buildAndExpand(appConfig.organizationId(), appConfig.ledgerId())
                    .toUriString();

            logger.info("Fetching transactions from URL: {}", url);

            logger.info("Request body: {}", objectMapper.writeValueAsString(transactionCreateRequestDTO));

            ObjectMapper objectMapper = new ObjectMapper();
            TransactionCreateResponseWrapper responseWrapper = restTemplate.postForObject(url, transactionCreateRequestDTO, TransactionCreateResponseWrapper.class);

            logger.info("Response received: {}", objectMapper.writeValueAsString(responseWrapper));

            Transaction transaction = new Transaction();

            if (responseWrapper != null) {
                transaction.setId(responseWrapper.getId());
                transaction.setDescription(responseWrapper.getDescription());
            } else {
                logger.warn("No transactions found.");
            }


            return transaction;
        } catch (HttpClientErrorException e) {
            logger.error("HTTP error while fetching transactions: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch transactions: " + e.getStatusCode());
        } catch (RestClientException e) {
            logger.error("Error while fetching transactions: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch transactions due to a client error.");
        } catch (Exception e) {
            logger.error("Unexpected error while fetching transactions: {}", e.getMessage());
            throw new RuntimeException("An unexpected error occurred while fetching transactions.");
        }
    }

    @Override
    public List<Transaction> getAllTransactions() {
        Logger logger = LoggerFactory.getLogger(CoreBankingGateway.class);

        try {
            String url = UriComponentsBuilder.fromHttpUrl(appConfig.midazBaseUrl() + appConfig.getListTransactionsPath())
                    .queryParam("page", appConfig.pageNumber())
                    .queryParam("limit", appConfig.pageSize())
                    .buildAndExpand(appConfig.organizationId(), appConfig.ledgerId())
                    .toUriString();

            logger.info("Fetching transactions from URL: {}", url);

            TransactionResponseWrapper responseWrapper = restTemplate.getForObject(url, TransactionResponseWrapper.class);

            logger.info("Response received: {}", responseWrapper);

            return responseWrapper != null ? responseWrapper.getItems() : List.of();
        } catch (HttpClientErrorException e) {
            logger.error("HTTP error while fetching transactions: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch transactions: " + e.getStatusCode());
        } catch (RestClientException e) {
            logger.error("Error while fetching transactions: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch transactions due to a client error.");
        } catch (Exception e) {
            logger.error("Unexpected error while fetching transactions: {}", e.getMessage());
            throw new RuntimeException("An unexpected error occurred while fetching transactions.");
        }
    }
}
