package com.hiepnh.banking_integration.adapter.controller;

import com.hiepnh.banking_integration.application.usecase.dto.CreatePaymentIntentRequest;
import com.hiepnh.banking_integration.application.usecase.dto.CreatePaymentIntentResponse;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments/stripe")
public class StripePaymentController {

    @PostMapping(value = "/create-payment-intent")
    public ResponseEntity<CreatePaymentIntentResponse> createPaymentIntent(@RequestBody CreatePaymentIntentRequest request) {

        String clientSecret = null;

        try {
            // Set your secret key. Remember to switch to your live secret key in production.
            // See your keys here: https://dashboard.stripe.com/apikeys
            Stripe.apiKey = "sk_test_51RR4FeI5sqndwyBEktkcPBHDhrFAk2M0Bagfu06PbPdv0XJb5VF0LA5GZSh4ck2f9rMwj4PnkWpsmvYwxCr3Zxla00Shd8GGsQ";

            PaymentIntentCreateParams params =
                    PaymentIntentCreateParams.builder()
                            .setAmount(Long.parseLong(request.getAmount()))
                            .setCurrency(request.getCurrency())
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            clientSecret = paymentIntent.getClientSecret();

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new CreatePaymentIntentResponse(99, e.getMessage(), clientSecret));
        }

        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(new CreatePaymentIntentResponse(0, "Success", clientSecret));
    }
}
