package com.br.edu.ufersa.pw.projeto.user.API.dto;

import com.br.edu.ufersa.pw.projeto.user.Model.entity.Interesse;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import com.br.edu.ufersa.pw.projeto.livro.API.dto.LivroCapaDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class ReturnUserDTO {

    private Long id;
    private String email;
    private String nome;
    private List<Long> interessesIds;
    private String bio;
    private LocalDateTime dataCadastro;
    private String fotoPerfil;

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

        this.interessesIds = user.getInteresses() != null
                ? user.getInteresses().stream()
                .map(Interesse::getId)
                .collect(Collectors.toList())
                : null;
    }

    public ReturnUserDTO(User user, List<LivroCapaDTO> livrosFavoritos){
        this(user);

        this.livrosFavoritos = livrosFavoritos;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public List<Long> getInteressesIds() { return interessesIds; }
    public void setInteressesIds(List<Long> interessesIds) { this.interessesIds = interessesIds; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }

    public String getFotoPerfil() { return fotoPerfil; }
    public void setFotoPerfil(String fotoPerfil) { this.fotoPerfil = fotoPerfil; }


    public List<LivroCapaDTO> getLivrosFavoritos() {
        return livrosFavoritos;
    }

    public void setLivrosFavoritos(List<LivroCapaDTO> livrosFavoritos) {
        this.livrosFavoritos = livrosFavoritos;
    }
}