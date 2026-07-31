package com.sportnis.api.auth.dto;

import com.sportnis.entity.enums.ProfileType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterRequest(
        @Email(message = "Invalid email")
        @Schema(description = "Email пользователя (или phone).", example = "user@example.com")
        String email,
        @Schema(description = "Телефон пользователя (или email).", example = "+79990001122")
        String phone,
        @NotBlank(message = "Password is required")
        @Schema(description = "Пароль.", example = "Passw0rd!")
        String password,
        @NotNull(message = "Profile type is required")
        @Schema(description = "Тип первого профиля.", example = "CONSUMER")
        ProfileType profileType
) {
    @AssertTrue(message = "Email or phone is required")
    public boolean hasEmailOrPhone() {
        return (email != null && !email.isBlank()) || (phone != null && !phone.isBlank());
    }
}

