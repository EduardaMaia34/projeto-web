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

    @Column(name = "livro_id", nullable = false)
    private String livroId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "livro_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Livro livro;

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

    public Biblioteca(User user, String livroId) {
        this.user = user;
        this.livroId = livroId;
        this.status = Estado.QUERO_LER;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getLivroId() {
        return livroId;
    }

    public Livro getLivro() {
        return livro;
    }

    public Estado getStatus() {
        return status;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setLivroId(String livroId) {
        this.livroId = livroId;
    }

    public void setStatus(Estado status) {
        this.status = status;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}
