package com.br.edu.ufersa.pw.projeto.Security;

import com.br.edu.ufersa.pw.projeto.user.API.dto.LoginDTO;
import com.br.edu.ufersa.pw.projeto.user.API.dto.TokenDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<TokenDTO> login(@RequestBody LoginDTO loginDto) {
        // Autentica o usuário com email e senha
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDto.getEmail(),
                        loginDto.getPassword()
                )
        );

        // Gera o token JWT
        String token = jwtTokenProvider.generateToken(authentication);

        return ResponseEntity.ok(new TokenDTO(token));
    }
}
