package com.br.edu.ufersa.pw.projeto.user.API.controllers;

import com.br.edu.ufersa.pw.projeto.Security.CustomUserDetails;
import com.br.edu.ufersa.pw.projeto.livro.API.dto.LivroCapaDTO;
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
import java.util.NoSuchElementException;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService service;

    // JwtTokenProvider removido pois usaremos @AuthenticationPrincipal (mais seguro e limpo)

    @Autowired
    public UserController(UserService service) {
        this.service = service;
    }

    // --- LEITURA ---

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

    // --- CRIAÇÃO E ATUALIZAÇÃO ---

    @PostMapping
    public ResponseEntity<ReturnUserDTO> create(@Valid @RequestBody InputUserDTO user) {
        ReturnUserDTO savedUser = service.save(user);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReturnUserDTO> update(
            @PathVariable Long id,
            @RequestBody InputUserDTO dto,
            @AuthenticationPrincipal CustomUserDetails loggedInUser) {

        if (loggedInUser == null || loggedInUser.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Segurança: Impede que User A edite User B pela URL
        if (!loggedInUser.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        ReturnUserDTO updatedUser = service.update(id, dto);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/me")
    public ResponseEntity<ReturnUserDTO> updateMe(
            @AuthenticationPrincipal CustomUserDetails loggedInUser,
            @RequestBody InputUserDTO dto) {

        if (loggedInUser == null || loggedInUser.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        ReturnUserDTO updatedUser = service.update(loggedInUser.getId(), dto);
        return ResponseEntity.ok(updatedUser);
    }

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

    // --- DELEÇÃO ---

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

    // --- FAVORITOS (Corrigido para usar AuthenticationPrincipal) ---

    @PostMapping("/favoritos/{livroId}")
    public ResponseEntity<String> adicionarFavorito(
            @PathVariable Long livroId,
            @AuthenticationPrincipal CustomUserDetails loggedInUser) {

        try {
            if (loggedInUser == null || loggedInUser.getId() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não autenticado.");
            }

            service.adicionarLivroFavorito(loggedInUser.getId(), livroId);
            return ResponseEntity.ok("Livro adicionado aos favoritos.");
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao adicionar favorito.");
        }
    }

    @DeleteMapping("/favoritos/{livroId}")
    public ResponseEntity<String> removerFavorito(
            @PathVariable Long livroId,
            @AuthenticationPrincipal CustomUserDetails loggedInUser) {

        try {
            if (loggedInUser == null || loggedInUser.getId() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não autenticado.");
            }

            service.removerLivroFavorito(loggedInUser.getId(), livroId);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao remover favorito.");
        }
    }

    @GetMapping("/{userId}/favoritos")
    public ResponseEntity<List<LivroCapaDTO>> listarFavoritos(@PathVariable Long userId) {
        try {
            List<LivroCapaDTO> favoritos = service.listarLivrosFavoritos(userId);
            return ResponseEntity.ok(favoritos);
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao listar favoritos: " + e.getMessage());
        }
    }

    // --- SEGUIR / SEGUIDORES ---

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

    // --- MÉTODOS DE COMPATIBILIDADE / ERROS (Padronizados) ---

    @PatchMapping("/{email}")
    public ResponseEntity<Void> updatePasswordLegacy() {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).build();
    }
}