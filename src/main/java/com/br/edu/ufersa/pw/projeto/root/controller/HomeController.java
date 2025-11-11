package com.br.edu.ufersa.pw.projeto.root.controller;

import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;
import com.br.edu.ufersa.pw.projeto.review.Service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class HomeController {

    @Autowired
    private ReviewService reviewService;

    // Unificando o mapeamento: Responde a /api/v1 e /api/v1/home
    @GetMapping({"", "/home"}) // <--- Mapeamento ajustado para aceitar ambos os caminhos
    public ResponseEntity<Map<String, Object>> getHomeInfo() {

        // 1. Otimizado para evitar NullPointerException se reviewService não estiver injetado (embora improvável)
        List<Livro> livrosMaisRevisados = reviewService.encontrarLivrosMaisRevisadosNaSemana();

        // 2. Declaração e inicialização da variável 'response' (corrigindo o erro "Cannot resolve symbol 'response'")
        Map<String, Object> response = new HashMap<>();

        response.put("message", "Bem-vindo ao Bookly");
        response.put("status", "Online");
        response.put("version", "v1.0");

        response.put("top_reviewed_livros_semana", livrosMaisRevisados);

        return ResponseEntity.ok(response);
    }
}