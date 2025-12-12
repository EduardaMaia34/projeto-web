package com.br.edu.ufersa.pw.projeto.user.API.controllers;

import com.br.edu.ufersa.pw.projeto.Security.CustomUserDetails;
import com.br.edu.ufersa.pw.projeto.Security.JwtTokenProvider;
import com.br.edu.ufersa.pw.projeto.user.API.dto.InputUserDTO;
import com.br.edu.ufersa.pw.projeto.user.API.dto.ReturnUserDTO;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Seguindo;
import com.br.edu.ufersa.pw.projeto.user.Service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    UserService service;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    public UserController(UserService service){
        this.service = service;
    }


    @GetMapping()
    public ResponseEntity<List<ReturnUserDTO>> list(
            @RequestParam(required = false) String name) {

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

        // Assumindo que o Service tem um método para buscar o DTO por ID
        Optional<ReturnUserDTO> userDTO = service.buscarDTOporId(loggedInUser.getId());

        return userDTO.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @GetMapping("/{userId}")
    public ResponseEntity<ReturnUserDTO> getUserById(@PathVariable Long userId) {

        // Assumindo que o Service tem um método para buscar o DTO por ID
        Optional<ReturnUserDTO> userDTO = service.buscarDTOporId(userId);

        return userDTO.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @PostMapping()
    public ResponseEntity<ReturnUserDTO> create(@Valid @RequestBody InputUserDTO user){
        ResponseEntity<ReturnUserDTO> response = new
                ResponseEntity<ReturnUserDTO>(service.save(user), HttpStatus.OK);
        return response;
    }


    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeById(@PathVariable Long userId) {
        try {
            service.deleteById(userId);
            return ResponseEntity.noContent().build(); // 204 No Content
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
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao deletar a conta.", e);
        }
    }

    @DeleteMapping()
    public ResponseEntity<InputUserDTO> removeByEmail(@RequestBody InputUserDTO user)
    { return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).build(); }

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
            @RequestBody InputUserDTO dto) { // Usa DTO apenas para extrair a nova senha

        if (loggedInUser == null || loggedInUser.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (dto.getSenha() == null || dto.getSenha().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A nova senha não pode ser vazia.");
        }

        ReturnUserDTO updatedUser = service.updatePasswordByUser(loggedInUser.getId(), dto.getSenha());
        return ResponseEntity.ok(updatedUser);
    }

    @PatchMapping("/{email}")
    public ResponseEntity<ReturnUserDTO> updatePassword (@PathVariable String email)
    { return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).build(); }


    @PostMapping("/seguir/{seguidoId}")
    public String seguirUsuario(@PathVariable Long seguidoId, HttpServletRequest request) {
        Long seguidorId = jwtTokenProvider.getUserIdFromToken(jwtTokenProvider.resolveToken(request));
        service.seguirUsuario(seguidorId, seguidoId);
        return "Agora você está seguindo o usuário de ID " + seguidoId;
    }

    @DeleteMapping("/deixarDeSeguir/{seguidoId}")
    public String deixarDeSeguir(@PathVariable Long seguidoId, HttpServletRequest request) {
        Long seguidorId = jwtTokenProvider.getUserIdFromToken(jwtTokenProvider.resolveToken(request));
        service.deixarDeSeguir(seguidorId, seguidoId);
        return "Você deixou de seguir o usuário de ID " + seguidoId;
    }

    @GetMapping("/seguindo")
    public List<Seguindo> listarSeguindo(HttpServletRequest request) {
        Long userId = jwtTokenProvider.getUserIdFromToken(jwtTokenProvider.resolveToken(request));
        return service.listarSeguindo(userId);
    }

    @GetMapping("/seguidores")
    public List<Seguindo> listarSeguidores(HttpServletRequest request) {
        Long userId = jwtTokenProvider.getUserIdFromToken(jwtTokenProvider.resolveToken(request));
        return service.listarSeguidores(userId);
    }
}