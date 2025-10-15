package com.br.edu.ufersa.pw.projeto.Security;

import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.*;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Qualifier;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/v1/users").permitAll()

                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/livros").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/livros/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/reviews").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/reviews/**").permitAll()
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET, "/feed"
                        ).hasAnyRole("USER", "ADMIN")
                        .requestMatchers(
                                org.springframework.http.HttpMethod.POST, "/api/v1/livros"
                        ).hasRole("ADMIN")
                        .requestMatchers(
                                org.springframework.http.HttpMethod.PUT, "/api/v1/livros/**"
                        ).hasRole("ADMIN")
                        .requestMatchers(
                                org.springframework.http.HttpMethod.DELETE, "/api/v1/livros/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                org.springframework.http.HttpMethod.POST, "/api/v1/reviews/**"
                        ).hasAnyRole("USER", "ADMIN")
                        .requestMatchers(
                                org.springframework.http.HttpMethod.POST, "/api/v1/biblioteca"
                        ).hasAnyRole("USER", "ADMIN")
                        .requestMatchers(
                                org.springframework.http.HttpMethod.PUT, "/api/v1/reviews/**"
                        ).hasAnyRole("USER", "ADMIN")
                        .requestMatchers(
                                org.springframework.http.HttpMethod.DELETE, "/api/v1/reviews/**"
                        ).hasAnyRole("USER", "ADMIN")
                        .requestMatchers(
                                org.springframework.http.HttpMethod.DELETE, "/api/v1/biblioteca/**"
                        ).hasAnyRole("USER", "ADMIN")
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET, "/api/v1/biblioteca/estante"
                        ).hasAnyRole("USER", "ADMIN")
                        .requestMatchers(
                                org.springframework.http.HttpMethod.POST, "/api/v1/users/seguir/**"
                        ).hasAnyRole("USER", "ADMIN")
                        .requestMatchers(
                                org.springframework.http.HttpMethod.DELETE, "/api/v1/users/deixarDeSeguir/**"
                        ).hasAnyRole("USER", "ADMIN")
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET, "/api/v1/users/seguindo"
                        ).hasAnyRole("USER", "ADMIN")
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET, "/api/v1/users/seguidores"
                        ).hasAnyRole("USER", "ADMIN")
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET, "/feed/**"
                        ).hasAnyRole("USER", "ADMIN")


                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(@Qualifier("userService") UserDetailsService userDetailsService) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}