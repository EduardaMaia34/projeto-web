package com.br.edu.ufersa.pw.projeto.livro.Model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Set;
import java.util.HashSet;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Interesse;


@Entity
@Table(name="tb_livro")
public class Livro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false)
    private String autor;

    @Column(nullable = false, length = 1024)
    private String descricao;


    @Column(name = "data_criacao", updatable = false)
    private LocalDateTime dataCriacao;

    @ManyToMany(cascade = {
            CascadeType.PERSIST,
            CascadeType.MERGE
    })
    @JoinTable(name = "tb_livro_interesse",
            joinColumns = @JoinColumn(name = "livro_id"),
            inverseJoinColumns = @JoinColumn(name = "interesse_id"))
    private Set<Interesse> interesses = new HashSet<>();

    //construtores
    public Livro(){
    }
    public Livro(String titulo, String autor, String descricao){
        this.titulo = titulo;
        this.autor=autor;
        this.descricao=descricao;
    }

    //getters e setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getAutor() {
        return autor;
    }

    public void setAutor(String autor) {
        this.autor = autor;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

   public Set<Interesse> getInteresses() {
        return interesses;
   }
   public void setInteresses(Set<Interesse> interesses) {
        this.interesses = interesses;
   }

    // --- MÉTODOS DE CICLO DE VIDA ---

    // Define a data de criação automaticamente antes de persistir
    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
    }

    // --- EQUALS E HASHCODE (CRUCIAIS PARA ENTIDADES JPA) ---

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        // Compara classes e garante que o ID não é nulo antes de tentar comparar
        if (o == null || getClass() != o.getClass() || id == null) return false;
        Livro livro = (Livro) o;
        return Objects.equals(id, livro.id);
    }

    @Override
    public int hashCode() {
        // Usa o ID para gerar o código hash, garantindo unicidade
        return Objects.hash(id);
    }

    // --- TOSTRING (Útil para logs) ---

    @Override
    public String toString() {
        return "Livro{" +
                "id=" + id +
                ", titulo='" + titulo + '\'' +
                ", autor='" + autor + '\'' +
                ", dataCriacao=" + dataCriacao +
                '}';
    }
}