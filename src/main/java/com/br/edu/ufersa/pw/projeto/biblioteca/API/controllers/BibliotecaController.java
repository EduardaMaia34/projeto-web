package com.br.edu.ufersa.pw.projeto.biblioteca.API.controllers;

import com.br.edu.ufersa.pw.projeto.biblioteca.API.dto.InputBibliotecaDTO;
import com.br.edu.ufersa.pw.projeto.biblioteca.API.dto.ReturnBibliotecaDTO;
import com.br.edu.ufersa.pw.projeto.biblioteca.Service.BibliotecaService;
import com.br.edu.ufersa.pw.projeto.user.API.dto.InputUpdateStatusDTO;
import com.br.edu.ufersa.pw.projeto.user.Service.UserService;
import com.br.edu.ufersa.pw.projeto.Security.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/biblioteca")
public class BibliotecaController {

    private final BibliotecaService bibliotecaService;
    private final UserService userService;

    public BibliotecaController(BibliotecaService bibliotecaService, UserService userService) {
        this.bibliotecaService = bibliotecaService;
        this.userService = userService;
    }


    @PostMapping
    public ResponseEntity<ReturnBibliotecaDTO> adicionarLivro(

            @AuthenticationPrincipal CustomUserDetails loggedInUser,
            @Valid @RequestBody InputBibliotecaDTO inputDTO) {

        if (loggedInUser == null || loggedInUser.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        try {

            ReturnBibliotecaDTO novoLivro = bibliotecaService.adicionarLivro(loggedInUser.getId(), inputDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(novoLivro);

        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao adicionar filme à biblioteca.");
        }
    }


    @DeleteMapping("/{livroId}")
    public ResponseEntity<Void> removerLivro(

            @AuthenticationPrincipal CustomUserDetails loggedInUser,
            @PathVariable String livroId) {

        if (loggedInUser == null || loggedInUser.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        boolean removido = bibliotecaService.removerLivro(loggedInUser.getId(), livroId);

        if (removido) {
            return ResponseEntity.noContent().build();
        } else {

            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Livro não encontrado na sua biblioteca.");
        }
    }


    @GetMapping
    public ResponseEntity<Page<ReturnBibliotecaDTO>> getMinhaWatchlist(

            @AuthenticationPrincipal CustomUserDetails loggedInUser,
            Pageable pageable) {

        if (loggedInUser == null || loggedInUser.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        Page<ReturnBibliotecaDTO> watchlist = bibliotecaService.getWatchlistPorUsuario(loggedInUser.getId(), pageable);
        return ResponseEntity.ok(watchlist);
    }


    @GetMapping("/users/{userId}")
    public ResponseEntity<Page<ReturnBibliotecaDTO>> getWatchlistDeOutroUsuario(
            @PathVariable Long userId,
            Pageable pageable) {


        if (userService.findById(userId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado.");
        }

        Page<ReturnBibliotecaDTO> watchlist = bibliotecaService.getWatchlistPorUsuario(userId, pageable);
        return ResponseEntity.ok(watchlist);
    }

    @GetMapping("/estante/users/{userId}")
    public ResponseEntity<Page<ReturnBibliotecaDTO>> getEstanteComReviewDeOutroUsuario(
            @PathVariable Long userId,
            Pageable pageable) {

        if (userService.findById(userId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado.");
        }

        Page<ReturnBibliotecaDTO> estante = bibliotecaService.getEstanteComReview(userId, pageable);
        return ResponseEntity.ok(estante);
    }

    @GetMapping("/estante")
    public ResponseEntity<Page<ReturnBibliotecaDTO>> getEstanteComReview(
            @AuthenticationPrincipal CustomUserDetails loggedInUser,
            Pageable pageable) {

        if (loggedInUser == null || loggedInUser.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        Long userId = loggedInUser.getId();

        Page<ReturnBibliotecaDTO> estante = bibliotecaService.getEstanteComReview(userId, pageable);
        return ResponseEntity.ok(estante);
    }

    @PutMapping("/{livroId}/status")
    public ResponseEntity<ReturnBibliotecaDTO> updateLivroStatus(
            @AuthenticationPrincipal CustomUserDetails loggedInUser,
            @PathVariable String livroId,
            @Valid @RequestBody InputUpdateStatusDTO inputDTO) {

        if (loggedInUser == null || loggedInUser.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        try {
            ReturnBibliotecaDTO updatedLivro = bibliotecaService.updateLivroStatus(
                    loggedInUser.getId(),
                    livroId,
                    inputDTO.getStatus()
            );

            return ResponseEntity.ok(updatedLivro);

        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao atualizar o status do livro.");
        }
    }
}