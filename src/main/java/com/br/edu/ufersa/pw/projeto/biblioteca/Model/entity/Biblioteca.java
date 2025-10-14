package com.br.edu.ufersa.pw.projeto.biblioteca.Model.entity;

import com.br.edu.ufersa.pw.projeto.user.Model.entity.Estado;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_biblioteca",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "livro_id"})
        })
public class Biblioteca {

    // 1. Identificação
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 2. Relações (Chaves Estrangeiras)

    // Relação com o Usuário (Muitos WatchlistEntries para Um Usuário)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;


    @Column(name = "livro_id", nullable = false)
    private String livroId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Estado status = Estado.QUERO_LER;

    // Data e hora em que o filme foi adicionado à lista
    @Column(name = "added_at", updatable = false)
    private LocalDateTime addedAt;

    // Métodos de ciclo de vida do JPA
    @PrePersist
    protected void onCreate() {
        this.addedAt = LocalDateTime.now();
    }

    // ----------------------------------------------------------------------
    // --- Construtores, Getters e Setters (COMPLETOS) ---
    // ----------------------------------------------------------------------

    // Construtor padrão (necessário para JPA)
    public Biblioteca() {}

    // Construtor útil para criar uma nova entrada
    public Biblioteca(User user, String livroId) {
        this.user = user;
        this.livroId = livroId;
        this.status = Estado.QUERO_LER;
    }

    // --- Getters ---

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getLivroId() {
        return livroId;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    // --- Setters ---


    public void setId(Long id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setLivroId(String livroId) {
        this.livroId = livroId;
    }

    public Estado getStatus() { return status; }
    public void setStatus(Estado status) { this.status = status; }
    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}