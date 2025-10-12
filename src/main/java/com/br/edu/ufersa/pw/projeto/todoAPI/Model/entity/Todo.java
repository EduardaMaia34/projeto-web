package com.br.edu.ufersa.pw.projeto.todoAPI.Model.entity;

import com.br.edu.ufersa.pw.projeto.user.Model.entity.Estado;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name="tb_todos")
public class Todo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="id_user")
    private User user;

    private String item;
    private LocalDate prazo;
    private Estado estado;
    private LocalDate conclusao;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getItem() {
        return item;
    }

    public void setItem(String item) {
        this.item = item;
    }

    public LocalDate getPrazo() {
        return prazo;
    }

    public void setPrazo(LocalDate prazo) {
        this.prazo = prazo;
    }

    public Estado getEstado() {
        return estado;
    }

    public void setEstado(Estado estado) {
        this.estado = estado;
    }

    public LocalDate getConclusao() {
        return conclusao;
    }

    public void setConclusao(LocalDate conclusao) {
        this.conclusao = conclusao;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Todo todo = (Todo) o;
        return Objects.equals(getId(), todo.getId()) && Objects.equals(getUser(), todo.getUser()) && Objects.equals(getItem(), todo.getItem()) && Objects.equals(getPrazo(), todo.getPrazo()) && getEstado() == todo.getEstado() && Objects.equals(getConclusao(), todo.getConclusao());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getId(), getUser(), getItem(), getPrazo(), getEstado(), getConclusao());
    }
}

