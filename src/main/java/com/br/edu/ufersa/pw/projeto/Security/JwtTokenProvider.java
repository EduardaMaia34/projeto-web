package com.br.edu.ufersa.pw.projeto.Security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.io.Decoders; // <-- NEW IMPORT
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret:MINHACHAVESECRETAFORTE1234567890ABCDEF}")
    private String jwtSecret;

    // Tempo de expiração (1 dia)
    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMs;

    // Método auxiliar para criar a chave de assinatura
    private Key getSigningKey() {

        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(Authentication authentication) {
        String username = authentication.getName();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        // Usando o método auxiliar
        Key key = getSigningKey();

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Obtém o nome de usuário a partir do token.
     */
    public String getUsernameFromToken(String token) {
        // Usando o método auxiliar
        Key key = getSigningKey();
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * Valida o token JWT.
     */
    public boolean validateToken(String token) {
        try {
            // Usando o método auxiliar
            Key key = getSigningKey();
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("JWT inválido: " + e.getMessage());
            return false;
        }
    }
}