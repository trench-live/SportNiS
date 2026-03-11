package com.sportnis.entity.profile.details;

import com.sportnis.entity.profile.Profile;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "provider_details")
public class ProviderDetails {

    @Id
    @Column(name = "profile_id", nullable = false)
    private UUID profileId;

    @MapsId
    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private Profile profile;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "qualifications")
    private String qualifications;

    @Column(name = "training_format", length = 120)
    private String trainingFormat;

    @Column(name = "price_from", precision = 12, scale = 2)
    private BigDecimal priceFrom;

    @Column(name = "price_currency", length = 3)
    private String priceCurrency;

    @Column(name = "service_conditions")
    private String serviceConditions;
}

