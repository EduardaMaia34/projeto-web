package com.br.edu.ufersa.pw.projeto.review.API.controllers;

import com.br.edu.ufersa.pw.projeto.review.API.dto.InputReviewDTO;
import com.br.edu.ufersa.pw.projeto.review.API.dto.ReturnReviewDTO;
import com.br.edu.ufersa.pw.projeto.review.Model.entity.Review;
import com.br.edu.ufersa.pw.projeto.review.Service.ReviewService;
import com.br.edu.ufersa.pw.projeto.Security.CustomUserDetails;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Seguindo;
import com.br.edu.ufersa.pw.projeto.user.Service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    @Autowired
    private ReviewService service;

    @Autowired
    private UserService userService;

    @PostMapping("/{livroId}")
    public ResponseEntity<ReturnReviewDTO> criarReview(
            @PathVariable Long livroId,
            @AuthenticationPrincipal CustomUserDetails loggedInUser,
            @RequestBody InputReviewDTO dto) {

        if (loggedInUser == null || loggedInUser.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido ou usuário não autenticado.");
        }

        Long userId = loggedInUser.getId();

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
    @GetMapping("/me")
    public ResponseEntity<List<ReturnReviewDTO>> listarMinhasReviews(@AuthenticationPrincipal CustomUserDetails loggedInUser) {
        if (loggedInUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        Long userId = loggedInUser.getId();

        return ResponseEntity.ok(service.listarPorUsuario(userId));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ReturnReviewDTO> atualizar(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal CustomUserDetails loggedInUser,
            @RequestBody InputReviewDTO dto) {

        Long userId = loggedInUser.getId();
        ReturnReviewDTO updated = service.atualizarReview(reviewId, userId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deletar(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal CustomUserDetails loggedInUser) {

        Long userId = loggedInUser.getId();
        service.deletarReview(reviewId, userId);
        return ResponseEntity.noContent().build();
    }


}