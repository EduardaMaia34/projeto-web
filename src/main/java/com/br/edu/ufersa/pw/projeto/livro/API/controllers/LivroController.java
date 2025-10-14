package com.br.edu.ufersa.pw.projeto.livro.API.controllers;

import com.br.edu.ufersa.pw.projeto.livro.API.dto.InputLivroDTO;
import com.br.edu.ufersa.pw.projeto.livro.API.dto.ReturnLivroDTO;
import com.br.edu.ufersa.pw.projeto.livro.Service.LivroService;
import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Interesse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/livros")
public class LivroController {

    private final LivroService service;

    @Autowired
    public LivroController(LivroService service){
        this.service = service;
    }


    @GetMapping()
    public ResponseEntity<List<ReturnLivroDTO>> list(
            @RequestParam(required = false) String titulo) {

        List<Livro> livros;

        if (titulo != null && !titulo.trim().isEmpty()) {
            livros = service.buscarPorTitulo(titulo);
        } else {
            livros = service.buscarTodos();
        }

        List<ReturnLivroDTO> responseDTOs = livros.stream()
                .map(this::toReturnDTO)
                .collect(Collectors.toList());

        return new ResponseEntity<>(responseDTOs, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReturnLivroDTO> getById(@PathVariable Long id) {
        Optional<Livro> livro = service.buscarPorId(id);

        return livro.map(this::toReturnDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @PostMapping()
    public ResponseEntity<ReturnLivroDTO> create(@Valid @RequestBody InputLivroDTO livroDTO){
        try {

            Livro livroSalvo = service.criarLivroComInteresses(livroDTO);

            return new ResponseEntity<>(toReturnDTO(livroSalvo), HttpStatus.CREATED);

        } catch (IllegalArgumentException e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity removeById(@PathVariable Long id) {
        try {
            service.deletarLivro(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // ----------------------------------------------------------------------
    // PUT: Atualizar livro completo - CORRIGIDO para usar o DTO
    // ----------------------------------------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<ReturnLivroDTO> update (@PathVariable Long id, @Valid @RequestBody InputLivroDTO livroDTO) {
        // Verifica se o livro a ser atualizado existe
        if (service.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            // CORREÇÃO ESSENCIAL: Chama o método que recebe o ID e o DTO para atualização
            Livro resultado = service.atualizarLivroComInteresses(id, livroDTO);

            return new ResponseEntity<>(toReturnDTO(resultado), HttpStatus.OK);

        } catch (IllegalArgumentException e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }


    // ----------------------------------------------------------------------
    // MÉTODOS DE MAPEAMENTO (DTO <-> ENTITY)
    // ----------------------------------------------------------------------

    // Mapeia InputLivroDTO para Livro Entity - MÉTODO REMOVIDO/INUTILIZADO
    private Livro toEntity(InputLivroDTO dto) {
        Livro livro = new Livro(dto.getTitulo(), dto.getAutor(), dto.getDescricao());
        return livro;
    }

    // Mapeia Livro Entity para ReturnLivroDTO
    private ReturnLivroDTO toReturnDTO(Livro livro) {
        ReturnLivroDTO dto = new ReturnLivroDTO();
        dto.setId(livro.getId());
        dto.setTitulo(livro.getTitulo());
        dto.setAutor(livro.getAutor());
        dto.setDescricao(livro.getDescricao());

        // CORREÇÃO: Mapeamento de Data de Criação
        dto.setDataCriacao(livro.getDataCriacao());

        // CORREÇÃO: Mapeamento dos Interesses (Entidades para Nomes)
        Set<Interesse> interesses = livro.getInteresses();
        if (interesses != null && !interesses.isEmpty()) {
            Set<String> nomesInteresses = interesses.stream()
                    .map(Interesse::getNome)
                    .collect(Collectors.toSet());
            dto.setInteresses(nomesInteresses);
        } else {
            dto.setInteresses(Set.of());
        }

        return dto;
    }
}
