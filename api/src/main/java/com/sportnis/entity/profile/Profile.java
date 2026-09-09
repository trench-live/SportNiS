package com.sportnis.entity.profile;

import com.sportnis.entity.common.BaseEntity;
import com.sportnis.entity.enums.MarketSide;
import com.sportnis.entity.enums.ProfileType;
import com.sportnis.entity.user.User;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "profiles")
public class Profile extends BaseEntity {

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "market_side", nullable = false, length = 32)
    private MarketSide marketSide;

    @Enumerated(EnumType.STRING)
    @Column(name = "profile_type", nullable = false, length = 32)
    private ProfileType profileType;

    @Column(name = "display_name", nullable = false, length = 255)
    private String displayName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "city", length = 120)
    private String city;

    @Column(name = "about")
    private String about;

    @ElementCollection
    @CollectionTable(name = "profile_sports", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "sport", nullable = false, length = 80)
    private Set<String> sportsTags = new HashSet<>();

    @Column(name = "is_public", nullable = false)
    private boolean isPublic = true;

    @Column(name = "is_email_public", nullable = false)
    private boolean isEmailPublic = false;

    @Column(name = "is_phone_public", nullable = false)
    private boolean isPhonePublic = false;
}


