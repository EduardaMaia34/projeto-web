package com.br.edu.ufersa.pw.projeto.user.API.controllers;

import com.br.edu.ufersa.pw.projeto.Security.CustomUserDetails;
import com.br.edu.ufersa.pw.projeto.user.API.dto.InputUserDTO;
import com.br.edu.ufersa.pw.projeto.user.API.dto.ReturnUserDTO;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Seguindo;
import com.br.edu.ufersa.pw.projeto.user.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService service;

    @Autowired
    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ReturnUserDTO>> list(@RequestParam(required = false) String name) {
        List<ReturnUserDTO> users;
        if (name != null && !name.trim().isEmpty()) {
            users = service.buscarPorNome(name);
        } else {
            users = service.listarTodos();
        }
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/me")
    public ResponseEntity<ReturnUserDTO> getMe(@AuthenticationPrincipal CustomUserDetails loggedInUser) {
        if (loggedInUser == null || loggedInUser.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return service.buscarDTOporId(loggedInUser.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ReturnUserDTO> getUserById(@PathVariable Long userId) {
        return service.buscarDTOporId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ReturnUserDTO> create(@Valid @RequestBody InputUserDTO user) {
        ReturnUserDTO savedUser = service.save(user);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    // --- CORREÇÃO PRINCIPAL AQUI ---
    @PutMapping("/{id}")
    public ResponseEntity<ReturnUserDTO> update(
            @PathVariable Long id, // Agora capturamos o ID da URL
            @RequestBody InputUserDTO dto,
            @AuthenticationPrincipal CustomUserDetails loggedInUser) {

        // 1. Verifica se está logado
        if (loggedInUser == null || loggedInUser.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2. Segurança: Impede que o Usuário A atualize o perfil do Usuário B
        // O ID do token deve ser igual ao ID da URL
        if (!loggedInUser.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        ReturnUserDTO updatedUser = service.update(id, dto);
        return ResponseEntity.ok(updatedUser);
    }
    // -------------------------------

    @PatchMapping("/me/password")
    public ResponseEntity<ReturnUserDTO> updateMyPassword(
            @AuthenticationPrincipal CustomUserDetails loggedInUser,
            @RequestBody InputUserDTO dto) {

        if (loggedInUser == null || loggedInUser.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (dto.getSenha() == null || dto.getSenha().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A nova senha não pode ser vazia.");
        }

        ReturnUserDTO updatedUser = service.updatePasswordByUser(loggedInUser.getId(), dto.getSenha());
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeById(@PathVariable Long userId) {
        try {
            service.deleteById(userId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado ou erro de exclusão.", e);
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> removeMyAccount(@AuthenticationPrincipal CustomUserDetails loggedInUser) {
        if (loggedInUser == null || loggedInUser.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            service.deleteById(loggedInUser.getId());
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao deletar a conta.", e);
        }
    }

    // --- Métodos Sociais (Seguir/Seguidores) ---

    @PostMapping("/seguir/{seguidoId}")
    public ResponseEntity<String> seguirUsuario(
            @PathVariable Long seguidoId,
            @AuthenticationPrincipal CustomUserDetails loggedInUser) {

        if (loggedInUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        service.seguirUsuario(loggedInUser.getId(), seguidoId);
        return ResponseEntity.ok("Agora você está seguindo o usuário de ID " + seguidoId);
    }

    @DeleteMapping("/deixarDeSeguir/{seguidoId}")
    public ResponseEntity<String> deixarDeSeguir(
            @PathVariable Long seguidoId,
            @AuthenticationPrincipal CustomUserDetails loggedInUser) {

        if (loggedInUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        service.deixarDeSeguir(loggedInUser.getId(), seguidoId);
        return ResponseEntity.ok("Você deixou de seguir o usuário de ID " + seguidoId);
    }

    @GetMapping("/seguindo")
    public ResponseEntity<List<Seguindo>> listarSeguindo(@AuthenticationPrincipal CustomUserDetails loggedInUser) {
        if (loggedInUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return ResponseEntity.ok(service.listarSeguindo(loggedInUser.getId()));
    }

    @GetMapping("/seguidores")
    public ResponseEntity<List<Seguindo>> listarSeguidores(@AuthenticationPrincipal CustomUserDetails loggedInUser) {
        if (loggedInUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return ResponseEntity.ok(service.listarSeguidores(loggedInUser.getId()));
    }

    // Métodos legados para evitar erro 405 se chamados incorretamente
    @DeleteMapping
    public ResponseEntity<Void> removeByEmail() {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).build();
    }

    @PatchMapping("/{email}")
    public ResponseEntity<Void> updatePasswordLegacy() {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).build();
    }
}