package com.br.edu.ufersa.pw.projeto.user.API.controllers;

import com.br.edu.ufersa.pw.projeto.user.Model.entity.Interesse;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.InteresseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/interesses")
@CrossOrigin(origins = "*")
public class InteresseController {

    private final InteresseRepository repository;

    @Autowired
    public InteresseController(InteresseRepository repository) {
        this.repository = repository;
    }

    // --- ESTE ERA O MÉTODO QUE FALTAVA ---
    @PostMapping
    public ResponseEntity<Interesse> criar(@RequestBody Interesse interesse) {
        // Salva o novo interesse no banco
        Interesse salvo = repository.save(interesse);
        return ResponseEntity.ok(salvo);
    }
    // -------------------------------------

    @GetMapping
    public ResponseEntity<List<Interesse>> listAll() {
        List<Interesse> interesses = repository.findAll();
        return ResponseEntity.ok(interesses);
    }
}