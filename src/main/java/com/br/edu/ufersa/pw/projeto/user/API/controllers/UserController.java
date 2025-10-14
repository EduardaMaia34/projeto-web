package com.br.edu.ufersa.pw.projeto.user.API.controllers;

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
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PostMapping()
    public ResponseEntity<ReturnUserDTO> create(@Valid @RequestBody InputUserDTO user){
        ResponseEntity<ReturnUserDTO> response = new
                ResponseEntity<ReturnUserDTO>(service.save(user), HttpStatus.OK);
        return response;
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity removeById(@PathVariable Long userId)
    {   return null; }

    @DeleteMapping()
    public ResponseEntity<InputUserDTO> removeByEmail(@RequestBody InputUserDTO user)
    {return null;}

    @PutMapping()
    public ResponseEntity<ReturnUserDTO> update (@RequestBody  InputUserDTO todo)
    {return null;}

    @PatchMapping("/{email}")
    public ResponseEntity<ReturnUserDTO> updatePassword (@PathVariable String email)
    {return null;}


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
