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
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "consumer_details")
public class ConsumerDetails {

    @Id
    @Column(name = "profile_id", nullable = false)
    private UUID profileId;

    @MapsId
    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private Profile profile;

    @Column(name = "birth_year")
    private Integer birthYear;

    @Column(name = "experience_level", length = 120)
    private String experienceLevel;

    @Column(name = "goals")
    private String goals;

    @Column(name = "preferences")
    private String preferences;
}

