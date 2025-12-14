package com.br.edu.ufersa.pw.projeto.user.Model.entity;

import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;
import com.br.edu.ufersa.pw.projeto.todoAPI.Model.entity.Todo;
import com.br.edu.ufersa.pw.projeto.user.API.dto.InputUserDTO;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.*; // Importado java.util.* para incluir Set e HashSet

@Entity
@Table(name = "tb_usuarios")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String senha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "foto_perfil", length = 500)
    private String fotoPerfil;

    @Column(length = 500)
    private String bio;

    @Column(name = "data_cadastro", nullable = false, updatable = false)
    private LocalDateTime dataCadastro;

    @Column(name = "nome", unique = true, nullable = false, length = 500)
    private String nome;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Todo> todoList;

    @OneToMany(mappedBy = "seguidor", cascade = CascadeType.ALL)
    private List<Seguindo> seguindo;

    @OneToMany(mappedBy = "seguido", cascade = CascadeType.ALL)
    private List<Seguindo> seguidores;

    // --- ALTERAÇÃO PRINCIPAL AQUI ---
    @ManyToMany(fetch = FetchType.EAGER) // Carrega os interesses junto com o User
    @JoinTable(
            name = "tb_usuario_interesses",
            joinColumns = @JoinColumn(name = "usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "interesse_id")
    )
    private Set<Interesse> interesses = new HashSet<>();
    // Usamos Set para evitar duplicatas e HashSet para iniciar vazio
    // -------------------------------

    @ManyToMany
    @JoinTable(
            name = "tb_usuario_favoritos",
            joinColumns = @JoinColumn(name = "usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "livro_id")
    )
    private List<Livro> livrosFavoritos;

    public User() {
        this.dataCadastro = LocalDateTime.now();
    }

    public User(InputUserDTO dto) {
        this.email = dto.getEmail();
        this.senha = dto.getSenha();
        this.nome = dto.getNome();
        this.fotoPerfil = dto.getFotoPerfil();
        this.bio = dto.getBio();
        this.dataCadastro = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getFotoPerfil() { return fotoPerfil; }
    public void setFotoPerfil(String fotoPerfil) { this.fotoPerfil = fotoPerfil; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }

    public List<Todo> getTodoList() { return todoList; }
    public void setTodoList(List<Todo> todoList) { this.todoList = todoList; }

    // --- GETTER E SETTER ATUALIZADOS PARA 'SET' ---
    public Set<Interesse> getInteresses() { return interesses; }
    public void setInteresses(Set<Interesse> interesses) { this.interesses = interesses; }
    // ----------------------------------------------

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getPassword() { return this.senha; }

    @Override
    public String getUsername() { return this.email; }

    public List<Livro> getLivrosFavoritos() {
        if (livrosFavoritos == null) {
            livrosFavoritos = new java.util.ArrayList<>();
        }
        return livrosFavoritos;
    }

    public void setLivrosFavoritos(List<Livro> livrosFavoritos) {
        this.livrosFavoritos = livrosFavoritos;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id) &&
                Objects.equals(email, user.email);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, email);
    }
}