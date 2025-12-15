package com.br.edu.ufersa.pw.projeto.biblioteca.Model.entity;

import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;
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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // --- CORREÇÃO AQUI ---
    // Removida a String livroId duplicada.
    // O objeto Livro agora é o dono da coluna 'livro_id'.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "livro_id", nullable = false)
    private Livro livro;
    // ---------------------

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Estado status = Estado.QUERO_LER;

    @Column(name = "added_at", updatable = false)
    private LocalDateTime addedAt;

    @PrePersist
    protected void onCreate() {
        this.addedAt = LocalDateTime.now();
    }

    public Biblioteca() {}

    // Construtor atualizado para receber o Objeto Livro, não uma String
    public Biblioteca(User user, Livro livro) {
        this.user = user;
        this.livro = livro;
        this.status = Estado.QUERO_LER;
    }

    // Getters e Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Livro getLivro() {
        return livro;
    }

    public void setLivro(Livro livro) {
        this.livro = livro;
    }

    public Estado getStatus() {
        return status;
    }

    public void setStatus(Estado status) {
        this.status = status;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}