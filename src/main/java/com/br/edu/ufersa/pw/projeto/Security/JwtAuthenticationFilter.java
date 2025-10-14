package com.br.edu.ufersa.pw.projeto.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.Arrays;
import java.util.stream.Collectors;

import io.jsonwebtoken.Claims;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.beans.factory.annotation.Qualifier; // Import necessário para o Qualifier


@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    // ✅ CORREÇÃO 1: Injeta o UserDetailsService e usa @Qualifier para resolver o conflito
    @Autowired
    @Qualifier("customUserDetailsService")
    private UserDetailsService userDetailsService;

    @Value("${jwt.secret:MINHACHAVESECRETAFORTE1234567890ABCDEF}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (jwt != null && tokenProvider.validateToken(jwt)) {

                // Obtém o nome de usuário (geralmente o email) para buscar o UserDetails completo
                String username = tokenProvider.getUsernameFromToken(jwt);

                // 🛑 CORREÇÃO 2: Busca o objeto UserDetails (CustomUserDetails) completo do banco
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // ✅ CORREÇÃO 3: Define o objeto UserDetails completo como o Principal
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, // <-- Agora injeta o objeto CustomUserDetails completo
                        null,
                        userDetails.getAuthorities() // Usa as autoridades do objeto UserDetails
                );

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Define a autenticação no contexto de segurança
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            // ✅ DEBUGGING: Mantém a impressão da stack trace para diagnosticar erros de token (Expired, Signature)
            ex.printStackTrace();
            logger.error("Falha na validação do token JWT ou extração de Roles.", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}