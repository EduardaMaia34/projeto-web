package com.br.edu.ufersa.pw.projeto.user.API.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

public class InputUserDTO {
    private String email;
    private String senha;
    private String nome;
    private List<Long> interessesIDs;
    private String bio;
    private LocalDateTime dataCadastro;
    private String FotoPerfil;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getNome() {
        return nome;
    }
    public void setNome(String nome) {
        this.nome = nome;
    }

    public List<Long> getInteressesIds() {
        return interessesIDs;
    }
    public void setInteressesIds(List<Long> interessesIDs) {
        this.interessesIDs = interessesIDs;
    }

    public String getBio() {
        return bio;
    }
    public void setBio(String bio) {
        this.bio = bio;
    }

    public LocalDateTime getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(LocalDateTime dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    public String getFotoPerfil() {
        return FotoPerfil;
    }

    public void setFotoPerfil(String fotoPerfil) {
        this.FotoPerfil = fotoPerfil;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        InputUserDTO that = (InputUserDTO) o;
        return Objects.equals(getEmail(), that.getEmail()) && Objects.equals(getSenha(), that.getSenha());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getEmail(), getSenha());
    }
}

