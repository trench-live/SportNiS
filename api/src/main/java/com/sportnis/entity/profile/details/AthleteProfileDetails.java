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
@Table(name = "athlete_profile_details")
public class AthleteProfileDetails {

    @Id
    @Column(name = "profile_id", nullable = false)
    private UUID profileId;

    @MapsId
    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private Profile profile;

    @Column(name = "birth_year")
    private Integer birthYear;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "sport_rank", length = 120)
    private String sportRank;

    @Column(name = "competitive_achievements")
    private String competitiveAchievements;

    @Column(name = "sports_goals")
    private String sportsGoals;

    @Column(name = "resume_markdown")
    private String resumeMarkdown;
}


