package com.br.edu.ufersa.pw.projeto.user.API.dto;

import com.br.edu.ufersa.pw.projeto.user.Model.entity.Interesse;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import com.br.edu.ufersa.pw.projeto.livro.API.dto.LivroCapaDTO;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ReturnUserDTO {

    private Long id;
    private String email;
    private String nome;
    private String bio;
    private LocalDateTime dataCadastro;
    private String fotoPerfil;
    private List<Interesse> interesses;
    private List<LivroCapaDTO> livrosFavoritos;

    private String role;

    public ReturnUserDTO() {
    }

    public ReturnUserDTO(User user){
        this.id = user.getId();
        this.email = user.getEmail();
        this.nome = user.getNome();
        this.bio = user.getBio();
        this.dataCadastro = user.getDataCadastro();
        this.fotoPerfil = user.getFotoPerfil();

        if (user.getInteresses() != null) {
            this.interesses = new ArrayList<>(user.getInteresses());
        } else {
            this.interesses = new ArrayList<>();
        }

        // --- NOVA LÓGICA DE MAPEAMENTO ---
        // Pega o Enum (ROLE_ADMIN) e transforma em String "ROLE_ADMIN"
        if (user.getRole() != null) {
            this.role = user.getRole().toString();
        }
        // ---------------------------------
    }

    public ReturnUserDTO(User user, List<LivroCapaDTO> livrosFavoritos){
        this(user);
        this.livrosFavoritos = livrosFavoritos;
    }

    // Getters e Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public List<Interesse> getInteresses() { return interesses; }
    public void setInteresses(List<Interesse> interesses) { this.interesses = interesses; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }

    public String getFotoPerfil() { return fotoPerfil; }
    public void setFotoPerfil(String fotoPerfil) { this.fotoPerfil = fotoPerfil; }

    public List<LivroCapaDTO> getLivrosFavoritos() { return livrosFavoritos; }
    public void setLivrosFavoritos(List<LivroCapaDTO> livrosFavoritos) { this.livrosFavoritos = livrosFavoritos; }

    // --- GETTER E SETTER DO ROLE ---
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    // -------------------------------
}