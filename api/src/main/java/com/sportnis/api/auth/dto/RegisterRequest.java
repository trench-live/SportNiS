package com.sportnis.api.auth.dto;

import com.sportnis.entity.enums.ProfileType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record RegisterRequest(
        @Email(message = "Invalid email")
        @Schema(description = "Email пользователя (или phone).", example = "user@example.com")
        String email,
        @Schema(description = "Телефон пользователя (или email).", example = "+79990001122")
        String phone,
        @NotBlank(message = "Password is required")
        @Schema(description = "Пароль.", example = "Passw0rd!")
        String password,
        @NotBlank(message = "Username is required")
        @Pattern(
                regexp = "^[A-Za-z0-9._]{3,32}$",
                message = "Username must be 3-32 chars and contain only letters, digits, dot or underscore"
        )
        @Schema(description = "Логин пользователя (уникальный).", example = "alex.runner")
        String username,
        @NotNull(message = "Profile type is required")
        @Schema(description = "Тип первого профиля.", example = "CONSUMER")
        ProfileType profileType
) {
    @AssertTrue(message = "Email or phone is required")
    public boolean hasEmailOrPhone() {
        return (email != null && !email.isBlank()) || (phone != null && !phone.isBlank());
    }
}

