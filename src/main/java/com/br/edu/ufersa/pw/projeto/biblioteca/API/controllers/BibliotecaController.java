package com.br.edu.ufersa.pw.projeto.biblioteca.API.controllers;

import com.br.edu.ufersa.pw.projeto.biblioteca.API.dto.InputBibliotecaDTO;
import com.br.edu.ufersa.pw.projeto.biblioteca.API.dto.ReturnBibliotecaDTO;
import com.br.edu.ufersa.pw.projeto.biblioteca.Service.BibliotecaService;
import com.br.edu.ufersa.pw.projeto.user.Service.UserService;
import com.br.edu.ufersa.pw.projeto.Security.CustomUserDetails; // Importar a classe correta
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
    private final UserService userService;

    // Injeção de Dependências via Construtor
    public BibliotecaController(BibliotecaService bibliotecaService, UserService userService) {
        this.bibliotecaService = bibliotecaService;
        this.userService = userService;
    }

    // --- ENDPOINT 1: ADICIONAR FILME À WATCHLIST (POST) ---
    // POST /api/v1/biblioteca

    @PostMapping
    public ResponseEntity<ReturnBibliotecaDTO> adicionarFilme(
            // ✅ CORREÇÃO APLICADA: Injeta CustomUserDetails, o objeto real no SecurityContext
            @AuthenticationPrincipal CustomUserDetails loggedInUser,
            @Valid @RequestBody InputBibliotecaDTO inputDTO) {

        // Não há necessidade de verificar se loggedInUser é null, pois o filtro de segurança
        // (AuthorizationFilter) garante que o usuário está autenticado antes de chegar aqui.
        // O erro de NPE anterior foi corrigido pela mudança de tipo.

        try {
            // Usa o getId() de CustomUserDetails para obter o ID do usuário logado
            ReturnBibliotecaDTO novoFilme = bibliotecaService.adicionarFilme(loggedInUser.getId(), inputDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(novoFilme);

        } catch (IllegalStateException e) {
            // Captura erro de filme já adicionado (Regra de Negócio: CONFLICT - 409)
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        } catch (Exception e) {
            // ✅ DEBUG: e.printStackTrace() está mantido para capturar o erro real de persistência (500)
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao adicionar filme à biblioteca.");
        }
    }

    // --- ENDPOINT 2: REMOVER FILME DA WATCHLIST (DELETE) ---
    // DELETE /api/v1/biblioteca/{filmId}

    @DeleteMapping("/{filmId}")
    public ResponseEntity<Void> removerFilme(
            // ✅ CORREÇÃO APLICADA
            @AuthenticationPrincipal CustomUserDetails loggedInUser,
            @PathVariable String filmId) {

        boolean removido = bibliotecaService.removerFilme(loggedInUser.getId(), filmId);

        if (removido) {
            return ResponseEntity.noContent().build(); // HTTP 204 No Content para sucesso sem retorno
        } else {
            // Se o filme não foi encontrado na Watchlist do usuário (NOT_FOUND - 404)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Filme não encontrado na sua biblioteca.");
        }
    }

    // --- ENDPOINT 3: BUSCAR WATCHLIST DO USUÁRIO LOGADO (GET) ---
    // GET /api/v1/biblioteca

    @GetMapping
    public ResponseEntity<Page<ReturnBibliotecaDTO>> getMinhaWatchlist(
            // ✅ CORREÇÃO APLICADA
            @AuthenticationPrincipal CustomUserDetails loggedInUser,
            Pageable pageable) {

        Page<ReturnBibliotecaDTO> watchlist = bibliotecaService.getWatchlistPorUsuario(loggedInUser.getId(), pageable);
        return ResponseEntity.ok(watchlist);
    }

    // --- ENDPOINT 4: BUSCAR WATCHLIST DE OUTRO USUÁRIO (GET) ---
    // GET /api/v1/biblioteca/users/{userId}

    @GetMapping("/users/{userId}")
    public ResponseEntity<Page<ReturnBibliotecaDTO>> getWatchlistDeOutroUsuario(
            @PathVariable Long userId,
            Pageable pageable) {

        // Verifica se o usuário existe antes de buscar a lista
        if (userService.findById(userId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado.");
        }

        Page<ReturnBibliotecaDTO> watchlist = bibliotecaService.getWatchlistPorUsuario(userId, pageable);
        return ResponseEntity.ok(watchlist);
    }
}