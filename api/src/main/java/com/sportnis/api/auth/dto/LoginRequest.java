package com.sportnis.api.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @Email(message = "Invalid email")
        @Schema(description = "Email пользователя (или phone).", example = "user@example.com")
        String email,
        @Schema(description = "Телефон пользователя (или email).", example = "+79990001122")
        String phone,
        @NotBlank(message = "Password is required")
        @Schema(description = "Пароль.", example = "Passw0rd!")
        String password
) {
    @AssertTrue(message = "Email or phone is required")
    public boolean hasEmailOrPhone() {
        return (email != null && !email.isBlank()) || (phone != null && !phone.isBlank());
    }
}
