package com.br.edu.ufersa.pw.projeto.Security;

import com.br.edu.ufersa.pw.projeto.user.API.dto.LoginDTO;
import com.br.edu.ufersa.pw.projeto.user.API.dto.TokenDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus; // Novo Import
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException; // Novo Import
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDto) {
        try {

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginDto.getEmail(),
                            loginDto.getPassword()
                    )
            );

            String token = jwtTokenProvider.generateToken(authentication);

            return ResponseEntity.ok(new TokenDTO(token));

        } catch (AuthenticationException e) {

            System.err.println("Falha no login para o usuário " + loginDto.getEmail() + ": " + e.getMessage());

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED) // Retorna 401
                    .body("{\"message\": \"Credenciais inválidas. Verifique seu email e senha.\"}");
        }
    }
}
