
package com.jagannathdham.service.impl;

import java.util.Base64;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.jagannathdham.entity.Booking;
import com.jagannathdham.service.EmailService;

import java.time.format.DateTimeFormatter;

@Service
public class EmailServiceImpl implements EmailService {

    private final RestClient restClient;
    private final String sender;
    private final String supportEmail;
    private final String bannerUrl;

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMMM yyyy");

    private static final DateTimeFormatter DATE_TIME_FORMAT =
            DateTimeFormatter.ofPattern("dd MMMM yyyy, hh:mm a");

    public EmailServiceImpl(
            @Value("${sendliberty.api.url}") String apiUrl,
            @Value("${sendliberty.api.key}") String apiKey,
            @Value("${sendliberty.from}") String sender,
            @Value("${support.email}") String supportEmail,
            @Value("${app.email.banner-url:}") String bannerUrl) {

        this.restClient = RestClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + apiKey)
                .defaultHeader(
                        HttpHeaders.CONTENT_TYPE,
                        MediaType.APPLICATION_JSON_VALUE)
                .build();

        this.sender = sender;
        this.supportEmail = supportEmail;
        this.bannerUrl = bannerUrl;
    }

    // REGISTRATION EMAIL
    @Override
    public void sendRegistrationEmail(String email, String fullName) {

        String body = """
                <div style="text-align:center;padding:30px 25px;">
                    <div style="font-size:42px;">🙏</div>

                    <h1 style="color:#5b2c83;font-size:28px;margin:12px 0;">
                        Welcome to Jagannath Dham!
                    </h1>

                    <p style="font-size:16px;color:#555;">
                        Dear <strong>%s</strong>,
                    </p>

                    <p style="font-size:15px;color:#666;line-height:1.8;">
                        Your account has been successfully created.
                        We are delighted to welcome you to Jagannath Dham.
                    </p>

                    <div style="background:#fff5e6;border-radius:12px;
                                padding:20px;margin:25px 0;">
                        <h3 style="color:#a65316;margin-top:0;">
                            Your spiritual journey begins here!
                        </h3>

                        <p style="color:#666;line-height:1.7;margin-bottom:0;">
                            Explore sacred destinations, discover the
                            festivals of Odisha and book your Darshan
                            experience with ease.
                        </p>
                    </div>

                    <p style="color:#7a4b9b;font-size:16px;">
                        May Lord Jagannath bless you and your family.
                    </p>

                    <p style="color:#777;font-size:13px;">
                        Thank you for joining us!
                    </p>
                </div>
                """.formatted(escapeHtml(fullName));

        String html = emailTemplate(
                "Welcome to Jagannath Dham",
                body
        );

        sendEmail(
                email,
                "Welcome to Jagannath Dham 🙏",
                html,
                null
        );
    }

    // BOOKING CONFIRMATION EMAIL
    @Override
    public void sendBookingConfirmation(
            String email,
            String fullName,
            Booking booking,
            byte[] qrImage) {

        String darshanDate = booking.getDarshanSlot()
                .getSlotDate()
                .format(DATE_FORMAT);

        String bookingDate = booking.getBookedAt()
                .format(DATE_TIME_FORMAT);

        String category = booking.getDarshanSlot()
                .getCategory()
                .getType()
                .name();

        String body = """
                <div style="padding:25px;">

                    <div style="text-align:center;">
                        <div style="font-size:45px;">🎉</div>

                        <h1 style="color:#198754;font-size:27px;">
                            Booking Confirmed!
                        </h1>

                        <p style="color:#666;font-size:15px;">
                            Dear <strong>%s</strong>,
                        </p>

                        <p style="color:#666;line-height:1.7;">
                            Your Darshan booking has been successfully
                            confirmed. We look forward to welcoming you.
                        </p>
                    </div>

                    <div style="background:#f0fff5;border:1px solid #b8e8c8;
                                border-radius:12px;padding:20px;
                                margin:25px 0;text-align:center;">

                        <p style="color:#555;margin:0 0 8px;">
                            BOOKING REFERENCE
                        </p>

                        <h2 style="color:#198754;margin:0;font-size:23px;">
                            %s
                        </h2>
                    </div>

                    <h3 style="color:#5b2c83;border-bottom:2px solid #f0e5fa;
                               padding-bottom:10px;">
                        Your Booking Details
                    </h3>

                    <table style="width:100%%;border-collapse:collapse;
                                  font-size:14px;">

                        <tr>
                            <td style="padding:12px 5px;color:#777;">
                                Booking Date
                            </td>
                            <td style="padding:12px 5px;text-align:right;
                                       color:#333;">
                                %s
                            </td>
                        </tr>

                        <tr style="background:#faf7ff;">
                            <td style="padding:12px 5px;color:#777;">
                                Darshan Date
                            </td>
                            <td style="padding:12px 5px;text-align:right;
                                       color:#333;font-weight:bold;">
                                %s
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:12px 5px;color:#777;">
                                Category
                            </td>
                            <td style="padding:12px 5px;text-align:right;
                                       color:#333;">
                                %s
                            </td>
                        </tr>

                        <tr style="background:#faf7ff;">
                            <td style="padding:12px 5px;color:#777;">
                                Visitors
                            </td>
                            <td style="padding:12px 5px;text-align:right;
                                       color:#333;">
                                %d
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:14px 5px;color:#777;
                                       font-weight:bold;">
                                Amount Paid
                            </td>
                            <td style="padding:14px 5px;text-align:right;
                                       color:#198754;font-weight:bold;
                                       font-size:18px;">
                                ₹%s
                            </td>
                        </tr>

                    </table>

                    <div style="background:#fff7e8;border-left:4px solid #e9a23b;
                                padding:16px;margin-top:22px;border-radius:6px;">

                        <h3 style="color:#a65d13;margin-top:0;">
                            Important Instructions
                        </h3>

                        <p style="color:#666;font-size:14px;line-height:1.7;
                                  margin-bottom:0;">
                            Your ticket is valid only on %s.
                            Please present the attached QR ticket at
                            the entry gate on your selected Darshan date.
                        </p>
                    </div>

                    <div style="text-align:center;margin-top:25px;">
                        <p style="color:#198754;font-weight:bold;">
                            Your QR ticket is attached to this email.
                        </p>

                        <p style="color:#777;font-size:14px;">
                            We wish you a peaceful and blessed Darshan.
                        </p>
                    </div>

                </div>
                """.formatted(
                escapeHtml(fullName),
                escapeHtml(booking.getBookingReference()),
                escapeHtml(bookingDate),
                escapeHtml(darshanDate),
                escapeHtml(category),
                booking.getVisitorCount(),
                escapeHtml(booking.getAmount().toString()),
                escapeHtml(darshanDate)
        );

        String html = emailTemplate(
                "Your Darshan Booking is Confirmed",
                body
        );

        String base64Image = Base64.getEncoder()
                .encodeToString(qrImage);

        Map<String, Object> attachment = Map.of(
                "filename", "Darshan-QR.png",
                "content", base64Image,
                "type", "image/png"
        );

        sendEmail(
                email,
                "Jagannath Dham - Booking Confirmed 🙏",
                html,
                List.of(attachment)
        );
    }

    // BOOKING CANCELLATION EMAIL
    @Override
    public void sendBookingCancellation(
            String email,
            String fullName,
            Booking booking) {

        String bookingDate = booking.getBookedAt()
                .format(DATE_TIME_FORMAT);

        String darshanDate = booking.getDarshanSlot()
                .getSlotDate()
                .format(DATE_FORMAT);

        String body = """
                <div style="padding:30px 25px;text-align:center;">

                    <div style="font-size:42px;">⚠️</div>

                    <h1 style="color:#dc3545;">
                        Booking Cancelled
                    </h1>

                    <p style="color:#555;">
                        Dear <strong>%s</strong>,
                    </p>

                    <p style="color:#666;line-height:1.8;">
                        Your Darshan booking has been cancelled successfully.
                    </p>

                    <div style="background:#fff5f5;border:1px solid #f5c2c7;
                                border-radius:12px;padding:20px;
                                margin:25px 0;text-align:left;">

                        <p><strong>Booking Reference:</strong> %s</p>
                        <p><strong>Booking Date:</strong> %s</p>
                        <p><strong>Darshan Date:</strong> %s</p>
                        <p><strong>Visitors:</strong> %d</p>

                    </div>

                    <p style="color:#dc3545;font-size:14px;line-height:1.7;">
                        Please note that cancellation does not automatically
                        result in a refund.
                    </p>

                    <p style="color:#777;margin-top:25px;">
                        We hope to welcome you again.
                    </p>

                </div>
                """.formatted(
                escapeHtml(fullName),
                escapeHtml(booking.getBookingReference()),
                escapeHtml(bookingDate),
                escapeHtml(darshanDate),
                booking.getVisitorCount()
        );

        String html = emailTemplate(
                "Your Booking Has Been Cancelled",
                body
        );

        sendEmail(
                email,
                "Jagannath Dham - Booking Cancelled",
                html,
                null
        );
    }

    // COMMON EMAIL TEMPLATE
    private String emailTemplate(String preheader, String body) {

        String banner;

        if (bannerUrl != null && !bannerUrl.isBlank()) {
            banner = """
                    <img src="%s"
                         alt="Jagannath Dham"
                         style="display:block;width:100%%;max-width:600px;
                                height:auto;border:0;">
                    """.formatted(escapeHtml(bannerUrl));
        } else {
            banner = """
                    <div style="background:#5b2c83;
                                background-image:linear-gradient(135deg,#5b2c83,#a65316);
                                padding:30px 15px;text-align:center;">

                        <div style="font-size:38px;">🛕</div>

                        <h1 style="color:#ffffff;font-size:25px;
                                   margin:10px 0 5px;">
                            Jagannath Dham
                        </h1>

                        <p style="color:#ffe7c2;font-size:13px;margin:0;">
                            Darshan & Odisha Tourism
                        </p>

                    </div>
                    """;
        }

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport"
                          content="width=device-width, initial-scale=1.0">
                    <title>Jagannath Dham</title>
                </head>

                <body style="margin:0;padding:0;background:#f3f1f7;
                             font-family:Arial,Helvetica,sans-serif;">

                    <div style="display:none;max-height:0;overflow:hidden;
                                opacity:0;color:transparent;">
                        %s
                    </div>

                    <table role="presentation" width="100%%"
                           cellpadding="0" cellspacing="0"
                           style="background:#f3f1f7;padding:25px 10px;">

                        <tr>
                            <td align="center">

                                <table role="presentation" width="100%%"
                                       cellpadding="0" cellspacing="0"
                                       style="max-width:600px;background:#ffffff;
                                              border-radius:14px;overflow:hidden;
                                              box-shadow:0 4px 18px rgba(0,0,0,0.08);">

                                    <tr>
                                        <td>
                                            %s
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>
                                            %s
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="background:#f9f5fc;
                                                   padding:22px 15px;
                                                   text-align:center;
                                                   border-top:1px solid #eee5f5;">

                                            <p style="color:#5b2c83;
                                                      font-size:15px;
                                                      font-weight:bold;
                                                      margin:0 0 8px;">
                                                Jagannath Dham
                                            </p>

                                            <p style="color:#888;font-size:12px;
                                                      margin:0 0 8px;">
                                                Darshan & Odisha Tourism
                                            </p>

                                            <p style="color:#999;font-size:11px;
                                                      margin:0;">
                                                With blessings of Lord Jagannath 🙏
                                            </p>

                                        </td>
                                    </tr>

                                </table>

                            </td>
                        </tr>

                    </table>

                </body>
                </html>
                """.formatted(
                escapeHtml(preheader),
                banner,
                body
        );
    }

    // SEND EMAIL
    private void sendEmail(
            String email,
            String subject,
            String html,
            List<Map<String, Object>> attachments) {

        Map<String, Object> request = new java.util.HashMap<>();

        request.put("from", sender);
        request.put("to", email);
        request.put("subject", subject);
        request.put("html", html);

        if (attachments != null) {
            request.put("attachments", attachments);
        }

        restClient.post()
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .toBodilessEntity();
    }

    // HTML ESCAPING
    private String escapeHtml(String value) {

        if (value == null) {
            return "";
        }

        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    // SUPPORT EMAIL
    @Override
    public void sendSupportIssue(String userEmail, String issue) {

        String body = """
                <div style="padding:25px;">
                    <h2 style="color:#5b2c83;">
                        New Support Request
                    </h2>

                    <p><strong>User Email:</strong> %s</p>

                    <h3 style="color:#a65316;">Issue Details</h3>

                    <div style="background:#f8f5fc;padding:18px;
                                border-radius:10px;color:#555;
                                line-height:1.7;">
                        %s
                    </div>
                </div>
                """.formatted(
                escapeHtml(userEmail),
                escapeHtml(issue).replace("\n", "<br>")
        );

        sendEmail(
                supportEmail,
                "Jagannath Dham - New Support Issue",
                emailTemplate("New support request", body),
                null
        );
    }
}
