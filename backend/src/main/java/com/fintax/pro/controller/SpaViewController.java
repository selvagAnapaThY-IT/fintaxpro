package com.fintax.pro.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaViewController {

    @GetMapping(value = {"/", "/login", "/signup", "/forgot-password", "/dashboard", "/transactions", "/analytics", "/tax-vault", "/exports", "/settings"})
    public String forwardToSpa() {
        return "forward:/index.html";
    }
}
