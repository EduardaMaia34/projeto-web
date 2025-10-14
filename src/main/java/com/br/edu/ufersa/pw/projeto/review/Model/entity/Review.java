package com.br.edu.ufersa.pw.projeto.review.Model.entity;


import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name= "tb_reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "review", nullable = true, length = 2048)
    private String review;

    @Column(name= "nota", nullable = true)
    private double nota;

    @Column(name= "data", nullable = false)
    private LocalDateTime data = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name="user_id", nullable=false)
    private User user;

    @ManyToOne
    @JoinColumn(name="livro_id", nullable=false)
    private Livro livro;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReview() { return review; }
    public void setReview(String review) { this.review = review; }

    public double getNota() { return nota; }
    public void setNota(double nota) { this.nota = nota; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Livro getLivro() { return livro; }
    public void setLivro(Livro livro) { this.livro = livro; }

    public LocalDateTime getData() { return data; }
    public void setData(LocalDateTime data) { this.data = data; }
}
