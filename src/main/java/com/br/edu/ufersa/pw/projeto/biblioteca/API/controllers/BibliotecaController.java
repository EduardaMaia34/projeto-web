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


    public BibliotecaController(BibliotecaService bibliotecaService, UserService userService) {
        this.bibliotecaService = bibliotecaService;
        this.userService = userService;
    }



    @PostMapping
    public ResponseEntity<ReturnBibliotecaDTO> adicionarLivro(

            @AuthenticationPrincipal CustomUserDetails loggedInUser,
            @Valid @RequestBody InputBibliotecaDTO inputDTO) {


        try {
            // Usa o getId() de CustomUserDetails para obter o ID do usuário logado
            ReturnBibliotecaDTO novoLivro = bibliotecaService.adicionarLivro(loggedInUser.getId(), inputDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(novoLivro);

        } catch (IllegalStateException e) {
            // Captura erro de filme já adicionado (Regra de Negócio: CONFLICT - 409)
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        } catch (Exception e) {
            // ✅ DEBUG: e.printStackTrace() está mantido para capturar o erro real de persistência (500)
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao adicionar filme à biblioteca.");
        }
    }


    @DeleteMapping("/{livroId}")
    public ResponseEntity<Void> removerFilme(

            @AuthenticationPrincipal CustomUserDetails loggedInUser,
            @PathVariable String livroId) {

        boolean removido = bibliotecaService.removerLivro(loggedInUser.getId(), livroId);

        if (removido) {
            return ResponseEntity.noContent().build(); // HTTP 204 No Content para sucesso sem retorno
        } else {
            // Se o filme não foi encontrado na Watchlist do usuário (NOT_FOUND - 404)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Filme não encontrado na sua biblioteca.");
        }
    }


    @GetMapping
    public ResponseEntity<Page<ReturnBibliotecaDTO>> getMinhaWatchlist(

            @AuthenticationPrincipal CustomUserDetails loggedInUser,
            Pageable pageable) {

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
}