package com.br.edu.ufersa.pw.projeto.user.API.controllers;

import com.br.edu.ufersa.pw.projeto.user.API.dto.InputUserDTO;
import com.br.edu.ufersa.pw.projeto.user.API.dto.ReturnUserDTO;
import com.br.edu.ufersa.pw.projeto.user.Service.UserService;
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
}