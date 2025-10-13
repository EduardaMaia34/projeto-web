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
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDto) {
        try {
            // 1. Tenta autenticar o usuário. Se as credenciais estiverem incorretas,
            // uma AuthenticationException (BadCredentialsException) será lançada.
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginDto.getEmail(),
                            loginDto.getPassword()
                    )
            );

            // 2. Se for bem-sucedido, gera o token JWT
            String token = jwtTokenProvider.generateToken(authentication);

            // 3. Retorna o token com status 200 OK
            return ResponseEntity.ok(new TokenDTO(token));

        } catch (AuthenticationException e) {
            // 4. CAPTURA A FALHA DE AUTENTICAÇÃO e retorna 401 Unauthorized.
            // Isso previne que o filtro de segurança retorne o 403 Forbidden incorreto.
            System.err.println("Falha no login para o usuário " + loginDto.getEmail() + ": " + e.getMessage());

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED) // Retorna 401
                    .body("{\"message\": \"Credenciais inválidas. Verifique seu email e senha.\"}");
        }
    }
}
