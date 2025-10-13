package com.br.edu.ufersa.pw.projeto.user.Model.entity;

import com.br.edu.ufersa.pw.projeto.todoAPI.Model.entity.Todo;
import com.br.edu.ufersa.pw.projeto.user.API.dto.InputUserDTO;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority; // Import
import org.springframework.security.core.authority.SimpleGrantedAuthority; // Import
import org.springframework.security.core.userdetails.UserDetails; // Import
import java.time.LocalDateTime;
import java.util.Collection; // Import
import java.util.List;
import java.util.Objects;

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


    @ManyToMany
    @JoinTable(
            name = "tb_usuario_interesses",
            joinColumns = @JoinColumn(name = "usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "interesse_id")
    )
    private List<Interesse> interesses;

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

    // Retorna a senha criptografada (exigido pelo UserDetails)
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

    public List<Interesse> getInteresses() { return interesses; }

    public void setInteresses(List<Interesse> interesses) { this.interesses = interesses; }


    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }



    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getPassword() {

        return this.senha;
    }

    @Override
    public String getUsername() {

        return this.email;
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