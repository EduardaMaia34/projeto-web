package com.br.edu.ufersa.pw.projeto.user.Model.entity;


import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;
import jakarta.persistence.*;

@Entity
@Table(name = "tb_usuario_livros")
public class User_Livro {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne
        @JoinColumn(name = "usuario_id", nullable = false)
        private User user;

        @ManyToOne
        @JoinColumn(name = "livro_id", nullable = false)
        private Livro livro;

        @Enumerated(EnumType.STRING)
        private Estado estado; // enum: QUERO_LER, LENDO, LIDO
    }


