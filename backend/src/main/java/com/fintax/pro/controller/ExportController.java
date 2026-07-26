package com.fintax.pro.controller;

import com.fintax.pro.dto.TaxSummaryDTO;
import com.fintax.pro.dto.TransactionDTO;
import com.fintax.pro.entity.ExportRecord;
import com.fintax.pro.entity.User;
import com.fintax.pro.service.AuthService;
import com.fintax.pro.service.ExportService;
import com.fintax.pro.service.TaxService;
import com.fintax.pro.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/exports")
public class ExportController {

    @Autowired
    private ExportService exportService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private TaxService taxService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<List<ExportRecord>> getExports() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getUserByEmail(email);

        List<ExportRecord> history = exportService.getExportHistory(user);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/csv")
    public ResponseEntity<byte[]> downloadTransactionsCsv() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getUserByEmail(email);

        List<TransactionDTO> list = transactionService.getAllTransactions(user);
        byte[] csvBytes = exportService.exportTransactionsToCsv(user, list);

        String filename = "fin_transactions_" + System.currentTimeMillis() / 1000 + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }

    @PostMapping("/gst")
    public ResponseEntity<byte[]> downloadGstReport() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getUserByEmail(email);

        TaxSummaryDTO taxSummary = taxService.getTaxSummary(user);
        byte[] csvBytes = exportService.generateGstSummaryReport(
                user,
                taxSummary.getGstOutput().doubleValue(),
                taxSummary.getGstInput().doubleValue(),
                taxSummary.getGstPayable().doubleValue()
        );

        String filename = "gst_report_" + System.currentTimeMillis() / 1000 + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}
