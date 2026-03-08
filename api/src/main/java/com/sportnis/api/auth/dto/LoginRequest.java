package com.sportnis.api.auth.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @Email(message = "Invalid email")
        String email,
        String phone,
        @NotBlank(message = "Password is required")
        String password
) {
    @AssertTrue(message = "Email or phone is required")
    public boolean hasEmailOrPhone() {
        return (email != null && !email.isBlank()) || (phone != null && !phone.isBlank());
    }
}

