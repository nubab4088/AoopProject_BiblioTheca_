package com.bibliotheca.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.Customizer;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults()) // Allow CORS mapping from your controller
            .csrf(csrf -> csrf.disable())    // Disable CSRF so Vercel frontend can POST data
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**").permitAll() // Allow all public API requests (register, login, books)
                .anyRequest().authenticated()
            );
            
        return http.build();
    }
}