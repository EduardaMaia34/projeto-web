package com.br.edu.ufersa.pw.projeto.biblioteca.API.controllers;

import com.br.edu.ufersa.pw.projeto.biblioteca.API.dto.InputBibliotecaDTO;
import com.br.edu.ufersa.pw.projeto.biblioteca.API.dto.ReturnBibliotecaDTO;
import com.br.edu.ufersa.pw.projeto.biblioteca.Service.BibliotecaService;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import com.br.edu.ufersa.pw.projeto.user.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/biblioteca")
public class BibliotecaController {

    private final BibliotecaService bibliotecaService;
    private final UserService userService; // Assumindo que você precisa do serviço de usuário

    // Injeção de Dependências via Construtor
    public BibliotecaController(BibliotecaService bibliotecaService, UserService userService) {
        this.bibliotecaService = bibliotecaService;
        this.userService = userService;
    }

    // --- ENDPOINT 1: ADICIONAR FILME À WATCHLIST (POST) ---
    // POST /api/v1/biblioteca

    @PostMapping
    public ResponseEntity<ReturnBibliotecaDTO> adicionarFilme(
            // @AuthenticationPrincipal pega o objeto User (ou a entidade de segurança) do Spring Security
            @AuthenticationPrincipal User loggedInUser,
            @Valid @RequestBody InputBibliotecaDTO inputDTO) {

        if (loggedInUser == null) {
            // Em uma configuração real do Spring Security, isso é improvável,
            // mas é uma boa verificação de segurança.
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        try {
            ReturnBibliotecaDTO novoFilme = bibliotecaService.adicionarFilme(loggedInUser.getId(), inputDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(novoFilme);
        } catch (IllegalStateException e) {
            // Captura erro de filme já adicionado (Regra de Negócio)
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        } catch (Exception e) {
            // Captura outros erros de serviço
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao adicionar filme à biblioteca.");
        }
    }

    // --- ENDPOINT 2: REMOVER FILME DA WATCHLIST (DELETE) ---
    // DELETE /api/v1/biblioteca/{filmId}

    @DeleteMapping("/{filmId}")
    public ResponseEntity<Void> removerFilme(
            @AuthenticationPrincipal User loggedInUser,
            @PathVariable String filmId) {

        if (loggedInUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        boolean removido = bibliotecaService.removerFilme(loggedInUser.getId(), filmId);

        if (removido) {
            return ResponseEntity.noContent().build(); // HTTP 204 No Content para sucesso sem retorno
        } else {
            // Se o filme não foi encontrado na Watchlist do usuário
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Filme não encontrado na sua biblioteca.");
        }
    }

    // --- ENDPOINT 3: BUSCAR WATCHLIST DO USUÁRIO LOGADO (GET) ---
    // GET /api/v1/biblioteca

    @GetMapping
    public ResponseEntity<Page<ReturnBibliotecaDTO>> getMinhaWatchlist(
            @AuthenticationPrincipal User loggedInUser,
            // Pageable permite passar parâmetros como ?page=0&size=10&sort=addedAt,desc
            Pageable pageable) {

        if (loggedInUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        Page<ReturnBibliotecaDTO> watchlist = bibliotecaService.getWatchlistPorUsuario(loggedInUser.getId(), pageable);
        return ResponseEntity.ok(watchlist);
    }

    // --- ENDPOINT 4: BUSCAR WATCHLIST DE OUTRO USUÁRIO (GET) ---
    // GET /api/v1/biblioteca/users/{userId}

    @GetMapping("/users/{userId}")
    public ResponseEntity<Page<ReturnBibliotecaDTO>> getWatchlistDeOutroUsuario(
            @PathVariable Long userId,
            Pageable pageable) {

        // Em um sistema real, aqui você faria verificações de privacidade (se o perfil é público/privado)

        // Verifica se o usuário existe antes de buscar a lista
        if (userService.findById(userId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado.");
        }

        Page<ReturnBibliotecaDTO> watchlist = bibliotecaService.getWatchlistPorUsuario(userId, pageable);
        return ResponseEntity.ok(watchlist);
    }
}