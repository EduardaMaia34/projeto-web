package com.br.edu.ufersa.pw.projeto.user.API.dto;

import com.br.edu.ufersa.pw.projeto.user.Model.entity.Interesse;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import com.br.edu.ufersa.pw.projeto.livro.API.dto.LivroCapaDTO;

import java.time.LocalDateTime;
import java.util.ArrayList; // Import necessário
import java.util.List;
import java.util.stream.Collectors;

public class ReturnUserDTO {

    private Long id;
    private String email;
    private String nome;
    private String bio;
    private LocalDateTime dataCadastro;
    private String fotoPerfil;

    // --- ALTERAÇÃO 1: Retorna a lista de objetos, não só IDs ---
    private List<Interesse> interesses;
    // -----------------------------------------------------------

    private List<LivroCapaDTO> livrosFavoritos;

    public ReturnUserDTO() {
    }

    public ReturnUserDTO(User user){
        this.id = user.getId();
        this.email = user.getEmail();
        this.nome = user.getNome();
        this.bio = user.getBio();
        this.dataCadastro = user.getDataCadastro();
        this.fotoPerfil = user.getFotoPerfil();

        // --- ALTERAÇÃO 2: Converte o Set<Interesse> do User para List<Interesse> do DTO ---
        if (user.getInteresses() != null) {
            this.interesses = new ArrayList<>(user.getInteresses());
        } else {
            this.interesses = new ArrayList<>();
        }
        // ----------------------------------------------------------------------------------
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

    // --- Getter e Setter atualizados para List<Interesse> ---
    public List<Interesse> getInteresses() { return interesses; }
    public void setInteresses(List<Interesse> interesses) { this.interesses = interesses; }
    // --------------------------------------------------------

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }

    public String getFotoPerfil() { return fotoPerfil; }
    public void setFotoPerfil(String fotoPerfil) { this.fotoPerfil = fotoPerfil; }

    public List<LivroCapaDTO> getLivrosFavoritos() { return livrosFavoritos; }
    public void setLivrosFavoritos(List<LivroCapaDTO> livrosFavoritos) { this.livrosFavoritos = livrosFavoritos; }
}