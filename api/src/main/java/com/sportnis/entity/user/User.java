package com.sportnis.entity.user;

import com.sportnis.entity.common.BaseEntity;
import com.sportnis.entity.enums.AccountStatus;
import com.sportnis.entity.enums.OnboardingStep;
import com.sportnis.entity.enums.SystemRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(name = "email", length = 255, unique = true)
    private String email;

    @Column(name = "phone", length = 32, unique = true)
    private String phone;

    @Column(name = "username", length = 32)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private AccountStatus status = AccountStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "system_role", nullable = false, length = 32)
    private SystemRole systemRole = SystemRole.USER;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Column(name = "active_profile_id")
    private UUID activeProfileId;

    @Enumerated(EnumType.STRING)
    @Column(name = "onboarding_step", nullable = false, length = 32)
    private OnboardingStep onboardingStep = OnboardingStep.REGISTERED;
}


