package com.br.edu.ufersa.pw.projeto.user.Model.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "seguindo")
public class Seguindo {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne
        @JoinColumn(name = "seguidor_id")
        private User seguidor;

        @ManyToOne
        @JoinColumn(name = "seguido_id")
        private User seguido;

        private LocalDateTime dataInicio; // opcional, se quiser saber desde quando

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getSeguidor() {
        return seguidor;}
    public void setSeguidor(User seguidor) {
        this.seguidor = seguidor;}
    public User getSeguido() {
        return seguido;}
    public void setSeguido(User seguido) {
        this.seguido = seguido;}
    public LocalDateTime getDataInicio() {
        return dataInicio;}
    public void setDataInicio(LocalDateTime dataInicio) {
        this.dataInicio = dataInicio;}

    public Long getSeguidorId(){return seguidor.getId();}
    public Long getSeguidoId(){return seguido.getId();}
    public void setSeguidorId(Long seguidorId) {seguidor.setId(seguidorId);}
    public void setSeguidoId(Long seguidoId) {seguido.setId(seguidoId);}
}


