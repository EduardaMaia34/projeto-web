package com.br.edu.ufersa.pw.projeto.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.beans.factory.annotation.Qualifier;


@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    // Lista de rotas públicas que o filtro JWT deve IGNORAR
    private static final String[] PUBLIC_URLS = {
            "/login",
            "/register",
            "/css/**",
            "/js/**",
            "/images/**",
            "/webjars/**",
            "/api/v1/auth/**",
            "/api/v1/users",
            "/api/v1/livros",
            "/api/v1/livros/**",
            "/api/v1/reviews",
            "/api/v1/reviews/**",
            // Garante que o método POST de registro seja ignorado
            // O shouldNotFilter padrão não verifica o método, mas a lista de URLs é suficiente.
    };

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    @Qualifier("customUserDetailsService")
    private UserDetailsService userDetailsService;

    @Value("${jwt.secret:MINHACHAVESECRETAFORTE1234567890ABCDEF}")
    private String jwtSecret;

    // --- IMPLEMENTAÇÃO DO shouldNotFilter ---
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();

        // Iteramos pelas URLs públicas para ver se a requisição atual deve ser ignorada
        for (String publicUrl : PUBLIC_URLS) {

            // Usamos AntPathMatcher para suportar curingas (**) e verificar se o path deve ser ignorado.
            // O shouldNotFilter não verifica o método HTTP, apenas o PATH.
            if (pathMatcher.match(publicUrl, path)) {
                // Se a URL bater, o filtro NÃO deve ser executado (retorna true)
                return true;
            }
        }

        // Se a requisição não for para nenhuma das URLs públicas listadas,
        // o filtro DEVE ser executado (retorna false)
        return false;
    }


    // --- IMPLEMENTAÇÃO DO doFilterInternal ---
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (jwt != null && tokenProvider.validateToken(jwt)) {

                String username = tokenProvider.getUsernameFromToken(jwt);

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {

            logger.error("Falha na validação do token JWT ou extração de Roles.", ex);
        }

        filterChain.doFilter(request, response);
    }

    // --- IMPLEMENTAÇÃO DO getJwtFromRequest (Consolidado) ---
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}