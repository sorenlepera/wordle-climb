package com.wordle.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

@Entity
public class CachedWord extends PanacheEntity {

    @Column(unique = true, nullable = false)
    public String word;

    public static CachedWord findByWord(String word) {
        return find("word", word).firstResult();
    }
}
