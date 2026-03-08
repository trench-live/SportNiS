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
@Table(name = "organization_profile_details")
public class OrganizationProfileDetails {

    @Id
    @Column(name = "profile_id", nullable = false)
    private UUID profileId;

    @MapsId
    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private Profile profile;

    @Column(name = "organization_type", length = 120)
    private String organizationType;

    @Column(name = "legal_name", length = 255)
    private String legalName;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "working_hours")
    private String workingHours;

    @Column(name = "facility_description")
    private String facilityDescription;

    @Column(name = "website", length = 500)
    private String website;
}


