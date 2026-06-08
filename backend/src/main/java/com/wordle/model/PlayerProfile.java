package com.wordle.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

@Entity
public class PlayerProfile extends PanacheEntity {

    @Column(unique = true, nullable = false)
    public String username;

    @Column(name = "high_score")
    public int highScore = 0;

    @Column(name = "max_score")
    public int maxScore = 0;

    @Column(name = "current_streak")
    public int currentStreak = 0;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    public User user;

    /**
     * Custom finder query: gets a PlayerProfile by username.
     * In Panache, the first parameter is the field name, and the second is the value.
     */
    public static PlayerProfile findByUsername(String username) {
        return find("username", username).firstResult();
    }
}
