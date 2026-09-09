package com.sportnis.service;

import com.sportnis.api.auth.dto.AuthMeResponse;
import com.sportnis.api.auth.dto.AuthResponse;
import com.sportnis.api.auth.dto.LoginRequest;
import com.sportnis.api.auth.dto.RegisterRequest;
import com.sportnis.entity.enums.AccountStatus;
import com.sportnis.entity.enums.MarketSide;
import com.sportnis.entity.enums.ProfileType;
import com.sportnis.entity.profile.Profile;
import com.sportnis.entity.user.User;
import com.sportnis.repository.profile.ProfileRepository;
import com.sportnis.repository.user.UserRepository;
import com.sportnis.security.JwtService;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            ProfileRepository profileRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        String normalizedPhone = normalizePhone(request.phone());

        if (normalizedEmail != null && userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }
        if (normalizedPhone != null && userRepository.existsByPhone(normalizedPhone)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone is already registered");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPhone(normalizedPhone);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setStatus(AccountStatus.ACTIVE);
        user = userRepository.save(user);

        Profile profile = new Profile();
        profile.setUser(user);
        profile.setProfileType(request.profileType());
        profile.setMarketSide(resolveMarketSide(request.profileType()));
        profile.setDisplayName(request.displayName().trim());
        profile = profileRepository.save(profile);

        String token = jwtService.generateToken(user.getId());
        return new AuthResponse(token, user.getId(), profile.getId(), profile.getProfileType(), profile.getMarketSide());
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        String normalizedPhone = normalizePhone(request.phone());

        User user = findUserByCredentials(normalizedEmail, normalizedPhone);
        if (user.getStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is not active");
        }
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        Profile profile = profileRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        String token = jwtService.generateToken(user.getId());
        return new AuthResponse(token, user.getId(), profile.getId(), profile.getProfileType(), profile.getMarketSide());
    }

    @Transactional(readOnly = true)
    public AuthMeResponse me(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Profile profile = profileRepository.findByUser_Id(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        return new AuthMeResponse(
                user.getId(),
                user.getEmail(),
                user.getPhone(),
                user.getStatus(),
                user.getSystemRole(),
                profile.getId(),
                profile.getProfileType(),
                profile.getMarketSide()
        );
    }

    private User findUserByCredentials(String email, String phone) {
        if (email != null) {
            return userRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        }
        return userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
    }

    private MarketSide resolveMarketSide(ProfileType profileType) {
        return switch (profileType) {
            case ATHLETE -> MarketSide.CONSUMER;
            case COACH, ORGANIZATION -> MarketSide.PROVIDER;
        };
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return null;
        }
        return phone.trim();
    }
}

