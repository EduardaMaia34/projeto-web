package com.br.edu.ufersa.pw.projeto.user.API.controllers;

import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import com.br.edu.ufersa.pw.projeto.user.Service.SeguindoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/seguir")
public class SeguindoController {

    @Autowired
    private SeguindoService seguindoService;

    @PostMapping("/{seguidorId}/{seguidoId}")
    public String seguir(@PathVariable Long seguidorId, @PathVariable Long seguidoId) {
        return seguindoService.seguir(seguidorId, seguidoId);
    }

    @DeleteMapping("/{seguidorId}/{seguidoId}")
    public String deixarDeSeguir(@PathVariable Long seguidorId, @PathVariable Long seguidoId) {
        return seguindoService.deixarDeSeguir(seguidorId, seguidoId);
    }

    @GetMapping("/{userId}")
    public List<User> listarSeguindo(@PathVariable Long userId) {
        return seguindoService.listarSeguindo(userId);
    }
}
