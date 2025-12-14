package com.br.edu.ufersa.pw.projeto.user.API.dto;

import jakarta.validation.constraints.Email; // Import NOVO
import jakarta.validation.constraints.NotBlank; // Import NOVO
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Objects;

public class InputUserDTO {

    @NotBlank(message = "O email não pode estar vazio.")
    @Email(message = "Digite um email válido.")
    private String email;

    @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres.")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$",
            message = "A senha deve conter pelo menos uma letra e um número.")
    private String senha;

    @NotBlank(message = "O nome é obrigatório.")
    private String nome;

    // CORREÇÃO: Mudado de 'interessesIDs' para 'interessesIds' (Padrão Java/JSON)
    private List<Long> interessesIds;

    private String bio;

    // REMOVIDO: dataCadastro (Isso é gerado pelo servidor, o usuário não envia)

    private String fotoPerfil;

    // --- Getters e Setters ---

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

    // O nome do Getter e Setter deve bater com o nome da variável JSON esperada
    public List<Long> getInteressesIds() {
        return interessesIds;
    }
    public void setInteressesIds(List<Long> interessesIds) {
        this.interessesIds = interessesIds;
    }

    public String getBio() {
        return bio;
    }
    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getFotoPerfil() {
        return fotoPerfil;
    }

    public void setFotoPerfil(String fotoPerfil) {
        this.fotoPerfil = fotoPerfil;
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