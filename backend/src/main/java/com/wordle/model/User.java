package com.wordle.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User extends PanacheEntity {

    @Column(unique = true, nullable = false)
    public String username;

    @Column(nullable = false)
    public String passwordHash;

    public LocalDateTime createdAt = LocalDateTime.now();

    @OneToOne(mappedBy = "user")
    public PlayerProfile profile;

    public static User findByUsername(String username) {
        if (username == null) return null;
        return find("LOWER(username)", username.toLowerCase()).firstResult();
    }
}
