package com.sportnis.api.auth;

import com.sportnis.api.auth.dto.AuthMeResponse;
import com.sportnis.api.auth.dto.AuthResponse;
import com.sportnis.api.auth.dto.LoginRequest;
import com.sportnis.api.auth.dto.RegisterRequest;
import com.sportnis.security.CurrentUserProvider;
import com.sportnis.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Auth", description = "Регистрация, вход и получение текущего пользователя")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final CurrentUserProvider currentUserProvider;

    public AuthController(AuthService authService, CurrentUserProvider currentUserProvider) {
        this.authService = authService;
        this.currentUserProvider = currentUserProvider;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Регистрация", description = "Создает аккаунт и первый профиль пользователя.")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    @Operation(summary = "Вход", description = "Аутентификация по email/phone и паролю. Возвращает JWT.")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            summary = "Logout",
            description = "Ends client session. In stateless JWT MVP, server-side token blacklist is not used.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public void logout() {
    }

    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            summary = "Delete account",
            description = "Удаляет аккаунт пользователя и связанные профили.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public void deleteMe() {
        authService.deleteMe(currentUserProvider.getCurrentUserId());
    }

    @GetMapping("/me")
    @Operation(
            summary = "Текущий пользователь",
            description = "Возвращает данные пользователя и активного профиля.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public AuthMeResponse me() {
        return authService.me(currentUserProvider.getCurrentUserId());
    }
}
