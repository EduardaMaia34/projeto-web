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
import java.util.Arrays;
import java.util.Collection;
import java.util.stream.Collectors;

// Importações JWT e Security necessárias:
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.beans.factory.annotation.Value;


@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    // O UserDetailsService não é mais necessário neste filtro (mas mantemos o import).
    // @Autowired
    // private UserDetailsService userDetailsService;

    @Value("${jwt.secret:MINHACHAVESECRETAFORTE1234567890ABCDEF}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            // 1. Tenta obter o token
            String jwt = getJwtFromRequest(request);

            if (jwt != null && tokenProvider.validateToken(jwt)) {

                // 2. Extrai o username (email)
                String username = tokenProvider.getUsernameFromToken(jwt);

                // 3. Obtém os Claims para ler as Roles diretamente do Token
                // Note: O JwtTokenProvider precisa de um getter para o SigningKey.
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(tokenProvider.getSigningKey())
                        .build()
                        .parseClaimsJws(jwt)
                        .getBody();

                // 4. Extrai a String de Roles
                String rolesString = claims.get("roles", String.class);

                // 5. Converte a String de Roles em uma Collection de Authorities
                Collection<SimpleGrantedAuthority> authorities = Arrays.stream(rolesString.split(","))
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

                // 6. Cria o objeto de Autenticação com as Authorities extraídas do token
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        authorities // <-- ESSENCIAL: Permissões lidas do token
                );

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 7. Define a autenticação no contexto de segurança do Spring
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            // Se o token for inválido, expirado ou a extração falhar, a autenticação não será definida.
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
