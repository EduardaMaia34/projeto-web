package com.br.edu.ufersa.pw.projeto.livro.API.controllers;

import com.br.edu.ufersa.pw.projeto.livro.API.dto.InputLivroDTO;
import com.br.edu.ufersa.pw.projeto.livro.API.dto.ReturnLivroDTO;
import com.br.edu.ufersa.pw.projeto.livro.Service.LivroService;
import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/livros")
public class LivroController {

    private final LivroService service;

    @Autowired
    public LivroController(LivroService service){
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ReturnLivroDTO>> list(
            @RequestParam(required = false) String termo) {

        if (termo == null || termo.trim().isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<ReturnLivroDTO> response = service.buscarPorTermo(termo)
                .stream()
                .map(service::toReturnLivroDTO)
                .toList();

        return ResponseEntity.ok(response);
    }


    @GetMapping("/{id}")
    public ResponseEntity<ReturnLivroDTO> getById(@PathVariable Long id) {
        try {
            ReturnLivroDTO dto = service.getDetalhesLivro(id);
            return ResponseEntity.ok(dto);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody InputLivroDTO livroDTO){
        try {
            Livro livroSalvo = service.criarLivroComInteresses(livroDTO);
            return new ResponseEntity<>(service.toReturnLivroDTO(livroSalvo), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody InputLivroDTO livroDTO) {
        try {
            Livro livroAtualizado = service.atualizarLivroComInteresses(id, livroDTO);

            return ResponseEntity.ok(service.toReturnLivroDTO(livroAtualizado));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao atualizar livro.");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeById(@PathVariable Long id) {
        try {
            service.deletarLivro(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}