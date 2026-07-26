package com.fintax.pro.service;

import com.fintax.pro.dto.TransactionDTO;
import com.fintax.pro.entity.ExportRecord;
import com.fintax.pro.entity.User;
import com.fintax.pro.repository.ExportRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportService {

    @Autowired
    private ExportRecordRepository exportRecordRepository;

    public List<ExportRecord> getExportHistory(User user) {
        return exportRecordRepository.findByUser(user, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @Transactional
    public byte[] exportTransactionsToCsv(User user, List<TransactionDTO> transactions) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            // Write UTF-8 BOM for Microsoft Excel compatibility
            out.write(new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF});

            try (PrintWriter writer = new PrintWriter(new java.io.OutputStreamWriter(out, java.nio.charset.StandardCharsets.UTF_8))) {
                // Write CSV headers
                writer.println("\"Transaction ID\",\"Date\",\"Type\",\"Amount (INR)\",\"Description\",\"Category\",\"Payment Source\",\"Tax Tag\",\"GST Rate (%)\"");

                // Write transaction rows
                DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                for (TransactionDTO t : transactions) {
                    String dateStr = (t.getDate() != null) ? t.getDate().format(dateFormatter) : "";
                    String typeStr = (t.getType() != null) ? t.getType() : "";
                    double amountVal = (t.getAmount() != null) ? t.getAmount().doubleValue() : 0.0;
                    String descStr = (t.getDescription() != null) ? t.getDescription().replace("\"", "\"\"") : "";
                    String catStr = (t.getCategory() != null) ? t.getCategory().replace("\"", "\"\"") : "";
                    String sourceStr = (t.getSource() != null) ? t.getSource() : "";
                    String tagStr = (t.getTag() != null) ? t.getTag() : "";
                    double gstRateVal = (t.getGstRate() != null) ? t.getGstRate().doubleValue() : 0.0;

                    writer.printf("\"%d\",\"%s\",\"%s\",\"%.2f\",\"%s\",\"%s\",\"%s\",\"%s\",\"%.2f\"\n",
                            t.getId() != null ? t.getId() : 0,
                            dateStr,
                            typeStr,
                            amountVal,
                            descStr,
                            catStr,
                            sourceStr,
                            tagStr,
                            gstRateVal
                    );
                }
                writer.flush();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Save export log in DB
        String filename = "fin_transactions_" + System.currentTimeMillis() / 1000 + ".csv";
        LocalDate start = LocalDate.now();
        LocalDate end = LocalDate.now();
        if (transactions != null && !transactions.isEmpty()) {
            LocalDate d1 = transactions.get(0).getDate();
            LocalDate d2 = transactions.get(transactions.size() - 1).getDate();
            if (d1 != null) end = d1;
            if (d2 != null) start = d2;
        }

        ExportRecord record = ExportRecord.builder()
                .user(user)
                .exportType("CSV_EXPORT")
                .filename(filename)
                .periodStart(start)
                .periodEnd(end)
                .build();
        exportRecordRepository.save(record);

        return out.toByteArray();
    }

    @Transactional
    public byte[] generateGstSummaryReport(User user, double gstOutput, double gstInput, double gstPayable) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            // Write UTF-8 BOM for Microsoft Excel compatibility
            out.write(new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF});

            try (PrintWriter writer = new PrintWriter(new java.io.OutputStreamWriter(out, java.nio.charset.StandardCharsets.UTF_8))) {
                writer.println("\"FinTax Pro GST Summary Report\"");
                writer.printf("\"Report Date\",\"%s\"\n\n", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
                writer.println("\"Metric\",\"Amount (INR)\"");
                writer.printf("\"Total GST Output (Collected)\",\"%.2f\"\n", gstOutput);
                writer.printf("\"Total GST Input (Credit)\",\"%.2f\"\n", gstInput);
                writer.printf("\"Net GST Payable to Govt\",\"%.2f\"\n", gstPayable);
                writer.flush();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Save export log in DB
        String filename = "gst_summary_report_" + System.currentTimeMillis() / 1000 + ".csv";
        ExportRecord record = ExportRecord.builder()
                .user(user)
                .exportType("GST_REPORT")
                .filename(filename)
                .periodStart(LocalDate.now().withDayOfMonth(1))
                .periodEnd(LocalDate.now())
                .build();
        exportRecordRepository.save(record);

        return out.toByteArray();
    }
}
