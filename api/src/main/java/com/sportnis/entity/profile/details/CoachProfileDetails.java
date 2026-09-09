package com.sportnis.entity.profile.details;

import com.sportnis.entity.profile.Profile;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "coach_profile_details")
public class CoachProfileDetails {

    @Id
    @Column(name = "profile_id", nullable = false)
    private UUID profileId;

    @MapsId
    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private Profile profile;

    @ElementCollection
    @CollectionTable(name = "coach_specializations", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "specialization", nullable = false, length = 120)
    private Set<String> specializations = new HashSet<>();

    @Column(name = "education")
    private String education;

    @Column(name = "certificates")
    private String certificates;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "training_format", length = 120)
    private String trainingFormat;

    @Column(name = "price_from", precision = 12, scale = 2)
    private BigDecimal priceFrom;

    @Column(name = "price_currency", length = 3)
    private String priceCurrency;

    @Column(name = "price_notes")
    private String priceNotes;
}


