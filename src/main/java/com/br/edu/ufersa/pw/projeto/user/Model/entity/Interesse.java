package com.br.edu.ufersa.pw.projeto.user.Model.entity;
import jakarta.persistence.*;


@Entity
@Table(name = "tb_interesses")
public class Interesse {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String nome;

    public Interesse() {}

    public Interesse(String nome) {
        setNome(nome);
    }

    public Long getId() {
        return id;
    }
    public String getNome() {
        return nome;
    }
    public void setNome(String nome) {
        this.nome = nome;
    }
}
