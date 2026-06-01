package com.example.aiexhibition.hall;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@SuppressWarnings("JpaDataSourceORMInspection")
@Entity
//noinspection JpaDataSourceORMInspection
@Table(name = "HALLS")
public class Hall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "NAME", nullable = false, length = 100)
    private String name;

    @Lob
    @Column(name = "DESCRIPTION")
    private String description;

    protected Hall() {
    }

    public Hall(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }
}

