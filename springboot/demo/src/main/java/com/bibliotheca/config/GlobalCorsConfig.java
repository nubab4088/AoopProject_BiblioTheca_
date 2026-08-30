package com.bibliotheca.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import java.util.List;

@Configuration
public class GlobalCorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Explicitly define allowed origins instead of using wildcards
        config.setAllowedOrigins(List.of(
            "https://aoop-project-biblio-theca-fgqesxbic-nusrat-bably.vercel.app",
            "http://localhost:5173"
        )); 
        
        config.addAllowedHeader("*");
        config.addAllowedMethod("*"); 
        
        // Required for frontend applications that send authorization headers or cookies
        config.setAllowCredentials(true); 
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}