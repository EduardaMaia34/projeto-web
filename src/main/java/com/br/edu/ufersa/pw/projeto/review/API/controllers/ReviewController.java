package com.br.edu.ufersa.pw.projeto.review.API.controllers;

import com.br.edu.ufersa.pw.projeto.review.API.dto.InputReviewDTO;
import com.br.edu.ufersa.pw.projeto.review.API.dto.ReturnReviewDTO;
import com.br.edu.ufersa.pw.projeto.review.Service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    @Autowired
    private ReviewService service;

    @PostMapping("/{livroId}")
    public ResponseEntity<ReturnReviewDTO> criarReview(
            @PathVariable Long livroId,
            // INJEÇÃO CORRIGIDA: Injeta como String para evitar erro de conversão automática
            @AuthenticationPrincipal String userIdStr,
            @RequestBody InputReviewDTO dto) {

        if (userIdStr == null || userIdStr.isEmpty() || userIdStr.equals("anonymousUser")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido ou usuário não autenticado.");
        }

        Long userId;
        try {
            userId = Long.valueOf(userIdStr);
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "ID do usuário no token é inválido.");
        }

        ReturnReviewDTO review = service.criarReview(userId, livroId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    @GetMapping("/livro/{livroId}")
    public ResponseEntity<List<ReturnReviewDTO>> listarPorLivro(@PathVariable Long livroId) {
        return ResponseEntity.ok(service.listarPorLivro(livroId));
    }

    @GetMapping("/usuario/{userId}")
    public ResponseEntity<List<ReturnReviewDTO>> listarPorUsuario(@PathVariable Long userId) {
        return ResponseEntity.ok(service.listarPorUsuario(userId));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ReturnReviewDTO> atualizar(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal String userIdStr,
            @RequestBody InputReviewDTO dto) {

        Long userId = Long.valueOf(userIdStr);
        ReturnReviewDTO updated = service.atualizarReview(reviewId, userId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deletar(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal String userIdStr) {

        Long userId = Long.valueOf(userIdStr);
        service.deletarReview(reviewId, userId);
        return ResponseEntity.noContent().build();
    }
}
