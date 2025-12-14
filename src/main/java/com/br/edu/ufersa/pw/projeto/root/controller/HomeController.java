package com.br.edu.ufersa.pw.projeto.root.controller;

import com.br.edu.ufersa.pw.projeto.livro.API.dto.ReturnLivroDTO;
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

    @GetMapping({"", "/home"})
    public ResponseEntity<Map<String, Object>> getHomeInfo() {

        List<ReturnLivroDTO> livrosMaisRevisados =
                reviewService.encontrarLivrosMaisRevisadosNaSemana()
                        .stream()
                        .map(ReturnLivroDTO::new)
                        .toList();

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Bem-vindo ao Bookly");
        response.put("top_reviewed_livros_semana", livrosMaisRevisados);

        return ResponseEntity.ok(response);
    }
}