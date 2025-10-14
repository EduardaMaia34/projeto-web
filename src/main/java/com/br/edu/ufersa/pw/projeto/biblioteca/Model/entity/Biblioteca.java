package com.br.edu.ufersa.pw.projeto.biblioteca.Model.entity;

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

    // ID do Filme. Usaremos String para o ID do serviço externo (ex: TMDb)
    @Column(name = "livro_id", nullable = false)
    private String livroId;

    // 3. Rastreamento (Metadados da Inclusão)

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

    // O Setter para o ID é útil em algumas situações (ex: testes),
    // embora o valor seja gerenciado pelo DB.
    public void setId(Long id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setLivroId(String livroId) {
        this.livroId = livroId;
    }

    // O Setter para addedAt é geralmente omitido ou privado devido ao @PrePersist,
    // mas pode ser mantido para flexibilidade.
    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}