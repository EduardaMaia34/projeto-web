package com.br.edu.ufersa.pw.projeto.livro.Model.entity;

import jakarta.persistence.*;
import java.util.Set;
import java.util.Objects;

@Entity
@Table(name = "tb_estilos")
public class Estilos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nome;

    @ManyToMany(mappedBy = "estilos") // "estilos" é o nome da lista na classe Livro
    private Set<Livro> livros;

    public Estilos(){}

    public Estilos(String nome){
        this.nome = nome;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public Set<Livro> getLivros() { return livros; }
    public void setLivros(Set<Livro> livros) { this.livros = livros; }
}
