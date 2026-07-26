package com.fintax.pro.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtils {

    @Value("${fintax.jwt.secret:9a67471ec63910c850d995968532470c14b886291a2b8e390c5f212217c24467}")
    private String jwtSecret;

    @Value("${fintax.jwt.expiration-ms:86400000}") // 24 hours
    private long jwtExpirationMs;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(userDetails, 0);
    }

    public String generateToken(UserDetails userDetails, int tokenVersion) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("tv", tokenVersion);
        return doGenerateToken(claims, userDetails.getUsername());
    }

    public Integer getTokenVersionFromToken(String token) {
        try {
            final Claims claims = getAllClaimsFromToken(token);
            Object tv = claims.get("tv");
            return tv != null ? Integer.parseInt(tv.toString()) : 0;
        } catch (Exception e) {
            return null;
        }
    }

    private String doGenerateToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        return validateToken(token, userDetails, 0);
    }

    public Boolean validateToken(String token, UserDetails userDetails, int currentTokenVersion) {
        try {
            final String username = getUsernameFromToken(token);
            Integer tokenTv = getTokenVersionFromToken(token);
            boolean versionValid = (tokenTv == null || tokenTv == currentTokenVersion);
            return (username.equals(userDetails.getUsername()) && !isTokenExpired(token) && versionValid);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
