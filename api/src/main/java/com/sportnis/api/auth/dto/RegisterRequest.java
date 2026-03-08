package com.sportnis.api.auth.dto;

import com.sportnis.entity.enums.ProfileType;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterRequest(
        @Email(message = "Invalid email")
        String email,
        String phone,
        @NotBlank(message = "Password is required")
        String password,
        @NotNull(message = "Profile type is required")
        ProfileType profileType,
        @NotBlank(message = "Display name is required")
        String displayName
) {
    @AssertTrue(message = "Email or phone is required")
    public boolean hasEmailOrPhone() {
        return (email != null && !email.isBlank()) || (phone != null && !phone.isBlank());
    }
}

