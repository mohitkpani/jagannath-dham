
package com.jagannathdham.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jagannathdham.dto.BookingRequest;
import com.jagannathdham.dto.BookingResponse;
import com.jagannathdham.entity.Booking;
import com.jagannathdham.entity.DarshanSlot;
import com.jagannathdham.entity.PaymentOrder;
import com.jagannathdham.entity.User;
import com.jagannathdham.enums.BookingStatus;
import com.jagannathdham.enums.PaymentStatus;
import com.jagannathdham.exception.BadRequestException;
import com.jagannathdham.exception.ResourceNotFoundException;
import com.jagannathdham.repository.BookingRepository;
import com.jagannathdham.repository.DarshanSlotRepository;
import com.jagannathdham.repository.PaymentOrderRepository;
import com.jagannathdham.repository.UserRepository;
import com.jagannathdham.service.BookingCancellationEvent;
import com.jagannathdham.service.BookingConfirmationEvent;
import com.jagannathdham.service.BookingService;
import com.jagannathdham.service.QrTicketService;
import com.jagannathdham.service.RazorpayService;
import com.razorpay.Order;
import com.razorpay.Payment;

@Service
public class BookingServiceImpl implements BookingService {

        private final BookingRepository bookingRepository;
        private final PaymentOrderRepository paymentOrderRepository;
        private final DarshanSlotRepository darshanSlotRepository;
        private final UserRepository userRepository;
        private final RazorpayService razorpayService;
        private final QrTicketService qrTicketService;
        private final ApplicationEventPublisher eventPublisher;

        @Value("${razorpay.key.id}")
        private String razorpayKeyId;

        public BookingServiceImpl(
                        BookingRepository bookingRepository,
                        PaymentOrderRepository paymentOrderRepository,
                        DarshanSlotRepository darshanSlotRepository,
                        UserRepository userRepository,
                        RazorpayService razorpayService,
                        QrTicketService qrTicketService,
                        ApplicationEventPublisher eventPublisher) {

                this.bookingRepository = bookingRepository;
                this.paymentOrderRepository = paymentOrderRepository;
                this.darshanSlotRepository = darshanSlotRepository;
                this.userRepository = userRepository;
                this.razorpayService = razorpayService;
                this.qrTicketService = qrTicketService;
                this.eventPublisher = eventPublisher;
        }

        // CREATE RAZORPAY ORDER AND RESERVE CAPACITY

        @Override
        @Transactional
        public JSONObject createBookingOrder(
                        BookingRequest request, String userEmail) {

                User user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                DarshanSlot slot = darshanSlotRepository
                                .findByIdForUpdate(request.darshanSlotId())
                                .orElseThrow(() -> new RuntimeException("Darshan slot not found"));

                if (!Boolean.TRUE.equals(slot.getActive())) {
                        throw new BadRequestException("Darshan slot is inactive");
                }

                if (slot.getSlotDate().isBefore(LocalDate.now())) {
                        throw new BadRequestException(
                                        "Cannot book a past darshan date");
                }

                if (!Boolean.TRUE.equals(slot.getCategory().getActive())) {
                        throw new BadRequestException(
                                        "Darshan category is inactive");
                }

                int visitors = request.visitorCount();

                if (visitors <= 0) {
                        throw new BadRequestException(
                                        "Visitor count must be greater than zero");
                }

                int availableCapacity = slot.getTotalCapacity() - slot.getBookedCount();

                if (visitors > availableCapacity) {
                        throw new BadRequestException(
                                        "Insufficient visitor capacity");
                }

                BigDecimal amount = slot.getCategory().getFee()
                                .multiply(BigDecimal.valueOf(visitors));

                // Handle FREE Darshan without Razorpay
                if (amount.compareTo(BigDecimal.ZERO) == 0) {

                        // Reserve visitor capacity
                        slot.setBookedCount(slot.getBookedCount() + visitors);
                        darshanSlotRepository.save(slot);

                        // Create confirmed booking
                        Booking booking = new Booking();
                        booking.setUser(user);
                        booking.setDarshanSlot(slot);

                        String bookingReference = "JD-"
                                        + UUID.randomUUID()
                                                        .toString()
                                                        .replace("-", "")
                                                        .substring(0, 16)
                                                        .toUpperCase();

                        booking.setBookingReference(bookingReference);
                        booking.setVisitorCount(visitors);
                        booking.setAmount(amount);
                        booking.setBookingStatus(BookingStatus.CONFIRMED);
                        booking.setPaymentStatus(PaymentStatus.SUCCESS);

                        // No Razorpay IDs for FREE bookings
                        booking.setRazorpayOrderId(null);
                        booking.setRazorpayPaymentId(null);

                        Booking savedBooking = bookingRepository.save(booking);

                        // Generate and save QR ticket
                        String qrToken = qrTicketService.createTicket(savedBooking);
                        byte[] qrImage = qrTicketService.generateQrImage(qrToken);

                        // Send booking confirmation email
                        eventPublisher.publishEvent(
                                        new BookingConfirmationEvent(
                                                        savedBooking.getUser().getEmail(),
                                                        savedBooking.getUser().getFullName(),
                                                        savedBooking,
                                                        qrImage));

                        // Return FREE booking confirmation
                        JSONObject response = new JSONObject();
                        response.put("bookingConfirmed", true);
                        response.put("bookingId", savedBooking.getId());
                        response.put("bookingReference", bookingReference);
                        response.put("amount", 0);
                        response.put("paymentStatus", "SUCCESS");
                        response.put("bookingStatus", "CONFIRMED");

                        return response;
                }

                String receipt = "JD-" + UUID.randomUUID()
                                .toString()
                                .replace("-", "")
                                .substring(0, 20);

                Order razorpayOrder = razorpayService.createOrder(amount, receipt);

                Object orderIdValue = razorpayOrder.get("id");

                String razorpayOrderId = orderIdValue.toString();

                // Reserve capacity
                slot.setBookedCount(slot.getBookedCount() + visitors);

                // Save payment order
                PaymentOrder paymentOrder = new PaymentOrder();

                paymentOrder.setUser(user);
                paymentOrder.setDarshanSlot(slot);
                paymentOrder.setRazorpayOrderId(razorpayOrderId);
                paymentOrder.setVisitorCount(visitors);
                paymentOrder.setAmount(amount);
                paymentOrder.setPaymentStatus(PaymentStatus.PENDING);
                paymentOrder.setExpiresAt(
                                LocalDateTime.now().plusMinutes(10));
                paymentOrder.setReservationActive(true);

                paymentOrderRepository.save(paymentOrder);

                // Prepare response
                JSONObject response = new JSONObject();

                Object amountValue = razorpayOrder.get("amount");
                int orderAmount = Integer.parseInt(amountValue.toString());

                Object currencyValue = razorpayOrder.get("currency");

                response.put("keyId", razorpayKeyId);
                response.put("orderId", razorpayOrderId);
                response.put("amount", orderAmount);
                response.put("currency", currencyValue.toString());
                response.put("visitorCount", visitors);
                response.put("expiresAt", paymentOrder.getExpiresAt().toString());
                return response;

        }

        // VERIFY PAYMENT AND CREATE BOOKING

        @Override
        @Transactional
        public Booking verifyBookingPayment(String orderId, String paymentId, String signature, String userEmail) {

                if (!razorpayService.verifyPayment(
                                orderId, paymentId, signature)) {
                        throw new BadRequestException(
                                        "Invalid Razorpay payment signature");
                }

                PaymentOrder paymentOrder = paymentOrderRepository
                                .findByRazorpayOrderIdForUpdate(orderId)
                                .orElseThrow(() -> new RuntimeException("Payment order not found"));

                if (!paymentOrder.getUser().getEmail().equals(userEmail)) {
                        throw new BadRequestException(
                                        "Unauthorized payment verification");
                }

                if (!razorpayService.verifyCapturedPayment(
                                orderId,
                                paymentId,
                                paymentOrder.getAmount())) {

                        throw new BadRequestException(
                                        "Payment is not captured or payment details do not match");
                }

                Optional<Booking> existingBooking = bookingRepository.findByRazorpayOrderId(orderId);

                if (existingBooking.isPresent()) {

                        Booking existing = existingBooking.get();

                        if (!existing.getRazorpayPaymentId().equals(paymentId)) {
                                throw new BadRequestException(
                                                "Payment ID does not match the existing booking");
                        }

                        return existing;
                }

                if (paymentOrder.getPaymentStatus() != PaymentStatus.PENDING) {
                        throw new BadRequestException(
                                        "Payment order is not pending");
                }

                if (!Boolean.TRUE.equals(
                                paymentOrder.getReservationActive())) {
                        throw new BadRequestException(
                                        "Payment reservation is no longer active");
                }

                if (paymentOrder.getExpiresAt() == null
                                || !paymentOrder.getExpiresAt()
                                                .isAfter(LocalDateTime.now())) {
                        throw new BadRequestException(
                                        "Payment reservation has expired");
                }

                // Create confirmed booking
                Booking booking = new Booking();

                booking.setUser(paymentOrder.getUser());
                booking.setDarshanSlot(paymentOrder.getDarshanSlot());

                String bookingReference = "JD-"
                                + UUID.randomUUID()
                                                .toString()
                                                .replace("-", "")
                                                .substring(0, 16)
                                                .toUpperCase();

                booking.setBookingReference(bookingReference);
                booking.setVisitorCount(paymentOrder.getVisitorCount());
                booking.setAmount(paymentOrder.getAmount());
                booking.setBookingStatus(BookingStatus.CONFIRMED);
                booking.setPaymentStatus(PaymentStatus.SUCCESS);
                booking.setRazorpayOrderId(orderId);
                booking.setRazorpayPaymentId(paymentId);

                Booking savedBooking = bookingRepository.save(booking);

                // Generate a unique QR ticket for the confirmed booking.
                String qrToken = qrTicketService.createTicket(savedBooking);

                // Generate the QR image.
                byte[] qrImage = qrTicketService.generateQrImage(qrToken);

                eventPublisher.publishEvent(
                                new BookingConfirmationEvent(
                                                savedBooking.getUser().getEmail(),
                                                savedBooking.getUser().getFullName(),
                                                savedBooking,
                                                qrImage));

                paymentOrder.setPaymentStatus(PaymentStatus.SUCCESS);
                paymentOrder.setReservationActive(false);

                paymentOrderRepository.save(paymentOrder);

                return savedBooking;
        }

        // GET ALL BOOKINGS

        @Override
        public List<Booking> getAllBookings() {
                return bookingRepository.findAll();
        }

        // GET BOOKING BY ID

        @Override
        public Optional<Booking> getBookingById(Long id) {

                Optional<Booking> booking = bookingRepository.findById(id);

                if (booking.isEmpty()) {
                        return Optional.empty();
                }

                String currentUserEmail = org.springframework.security.core.context.SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getName();

                if (!booking.get().getUser().getEmail().equals(currentUserEmail)) {
                        return Optional.empty();
                }

                return booking;
        }

        // GET BOOKING BY REFERENCE

        @Override
        public Optional<Booking> getBookingByReference(
                        String bookingReference) {

                Optional<Booking> booking = bookingRepository.findByBookingReference(bookingReference);

                if (booking.isEmpty()) {
                        return Optional.empty();
                }

                String currentUserEmail = org.springframework.security.core.context.SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getName();

                if (!booking.get().getUser().getEmail()
                                .equals(currentUserEmail)) {
                        return Optional.empty();
                }

                return booking;
        }

        // GET BOOKINGS BY USER

        @Override
        public List<Booking> getBookingsByUser(Long userId) {
                return bookingRepository.findByUserId(userId);
        }

        // CANCEL BOOKING - NO REFUND

        @Override
        @Transactional
        public Booking cancelBooking(Long id) {

                // Lock and fetch booking
                Booking booking = bookingRepository
                                .findByIdForUpdate(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

                // Get logged-in user
                var authentication = org.springframework.security.core.context.SecurityContextHolder
                                .getContext()
                                .getAuthentication();

                String currentUserEmail = authentication.getName();

                boolean isAdmin = authentication.getAuthorities()
                                .stream()
                                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

                // Allow only booking owner or admin
                if (!isAdmin && !booking.getUser().getEmail()
                                .equals(currentUserEmail)) {

                        throw new BadRequestException(
                                        "You are not allowed to cancel this booking");
                }

                // Only confirmed bookings can be cancelled
                if (booking.getBookingStatus() != BookingStatus.CONFIRMED) {
                        throw new BadRequestException(
                                        "Only confirmed bookings can be cancelled");
                }

                // Prevent cancellation if QR ticket has already been used
                qrTicketService.ensureTicketNotUsed(booking.getId());

                // Lock the associated darshan slot
                DarshanSlot slot = darshanSlotRepository
                                .findByIdForUpdate(booking.getDarshanSlot().getId())
                                .orElseThrow(() -> new ResourceNotFoundException("Darshan slot not found"));

                // Release reserved visitor capacity
                int remainingCount = slot.getBookedCount() - booking.getVisitorCount();

                if (remainingCount < 0) {
                        throw new IllegalStateException(
                                        "Booking capacity calculation error");
                }

                slot.setBookedCount(remainingCount);

                // Mark booking as cancelled
                booking.setBookingStatus(BookingStatus.CANCELLED);

                // Save both changes
                darshanSlotRepository.save(slot);

                Booking savedBooking = bookingRepository.save(booking);

                // Deactivate QR ticket
                qrTicketService.deactivateTicket(savedBooking.getId());

                // Send cancellation notification
                eventPublisher.publishEvent(
                                new BookingCancellationEvent(
                                                savedBooking.getUser().getEmail(),
                                                savedBooking.getUser().getFullName(),
                                                savedBooking));

                return savedBooking;
        }

        // EXPIRED RESERVATION PROCESSING
        // Do not release capacity based only on local expiry.
        // Razorpay payment status must first be reconciled.

        @Override
        @Transactional
        public void releaseExpiredReservations() {

                LocalDateTime currentTime = LocalDateTime.now();

                List<PaymentOrder> expiredOrders = paymentOrderRepository
                                .findByReservationActiveTrueAndExpiresAtBefore(currentTime);

                for (PaymentOrder paymentOrder : expiredOrders) {

                        PaymentOrder lockedOrder = paymentOrderRepository
                                        .findByRazorpayOrderIdForUpdate(
                                                        paymentOrder.getRazorpayOrderId())
                                        .orElse(null);

                        if (lockedOrder == null
                                        || !Boolean.TRUE.equals(lockedOrder.getReservationActive())
                                        || lockedOrder.getPaymentStatus() != PaymentStatus.PENDING) {
                                continue;
                        }

                        // Fetch payment details from Razorpay.
                        // If the API call fails, the exception is propagated.
                        // The reservation will remain active for the next scheduler run.
                        List<Payment> payments = razorpayService.fetchPaymentsForOrder(
                                        lockedOrder.getRazorpayOrderId());

                        // Case 1: No payment attempts were made.
                        if (payments == null || payments.isEmpty()) {

                                releaseReservation(lockedOrder);

                                continue;
                        }

                        boolean allPaymentsFailed = true;

                        for (Payment payment : payments) {

                                Object statusValue = payment.get("status");

                                if (statusValue == null) {
                                        allPaymentsFailed = false;
                                        continue;
                                }

                                String status = statusValue.toString();

                                // Case 2: Payment was captured.
                                if ("captured".equalsIgnoreCase(status)) {

                                        Object paymentIdValue = payment.get("id");

                                        if (paymentIdValue != null) {

                                                reconcileCapturedPayment(
                                                                lockedOrder.getRazorpayOrderId(),
                                                                paymentIdValue.toString());
                                        }

                                        allPaymentsFailed = false;
                                        break;
                                }

                                // Keep reservation for authorized, created or unknown statuses.
                                if (!"failed".equalsIgnoreCase(status)) {
                                        allPaymentsFailed = false;
                                }
                        }

                        // Release only when every payment attempt has failed.
                        if (allPaymentsFailed) {

                                releaseReservation(lockedOrder);
                        }
                }
        }

        // Releases reserved visitor capacity exactly once.
        private void releaseReservation(PaymentOrder paymentOrder) {

                DarshanSlot slot = darshanSlotRepository
                                .findByIdForUpdate(paymentOrder.getDarshanSlot().getId())
                                .orElseThrow(() -> new ResourceNotFoundException("Darshan slot not found"));

                int remainingCount = slot.getBookedCount() - paymentOrder.getVisitorCount();

                if (remainingCount < 0) {
                        throw new IllegalStateException(
                                        "Reserved capacity count cannot become negative");
                }

                slot.setBookedCount(remainingCount);

                paymentOrder.setPaymentStatus(PaymentStatus.FAILED);
                paymentOrder.setReservationActive(false);

                darshanSlotRepository.save(slot);
                paymentOrderRepository.save(paymentOrder);
        }

        @Override
        @Transactional
        public Booking reconcileCapturedPayment(String orderId, String paymentId) {

                PaymentOrder paymentOrder = paymentOrderRepository
                                .findByRazorpayOrderIdForUpdate(orderId)
                                .orElseThrow(() -> new ResourceNotFoundException("Payment order not found"));

                // Check whether a booking already exists for this order.
                Optional<Booking> existingBooking = bookingRepository.findByRazorpayOrderId(orderId);

                if (existingBooking.isPresent()) {
                        Booking existing = existingBooking.get();

                        if (!existing.getRazorpayPaymentId().equals(paymentId)) {
                                throw new BadRequestException(
                                                "Payment ID does not match the existing booking");
                        }

                        return existing;
                }

                // The reservation must still be active.
                if (!Boolean.TRUE.equals(paymentOrder.getReservationActive())
                                || paymentOrder.getPaymentStatus() != PaymentStatus.PENDING) {
                        throw new BadRequestException(
                                        "Payment reservation is no longer active");
                }

                // Verify the actual captured payment with Razorpay.
                if (!razorpayService.verifyCapturedPayment(
                                orderId, paymentId, paymentOrder.getAmount())) {
                        throw new BadRequestException(
                                        "Captured payment verification failed");
                }

                // Create the confirmed booking.
                Booking booking = new Booking();
                booking.setUser(paymentOrder.getUser());
                booking.setDarshanSlot(paymentOrder.getDarshanSlot());

                String bookingReference = "JD-" + UUID.randomUUID()
                                .toString().replace("-", "")
                                .substring(0, 16).toUpperCase();

                booking.setBookingReference(bookingReference);
                booking.setVisitorCount(paymentOrder.getVisitorCount());
                booking.setAmount(paymentOrder.getAmount());
                booking.setBookingStatus(BookingStatus.CONFIRMED);
                booking.setPaymentStatus(PaymentStatus.SUCCESS);
                booking.setRazorpayOrderId(orderId);
                booking.setRazorpayPaymentId(paymentId);

                Booking savedBooking = bookingRepository.save(booking);

                // Generate a unique QR ticket for the confirmed booking.
                String qrToken = qrTicketService.createTicket(savedBooking);

                // Generate the QR image.
                byte[] qrImage = qrTicketService.generateQrImage(qrToken);

                eventPublisher.publishEvent(
                                new BookingConfirmationEvent(
                                                savedBooking.getUser().getEmail(),
                                                savedBooking.getUser().getFullName(),
                                                savedBooking,
                                                qrImage));

                // Convert the active reservation into a successful booking.
                paymentOrder.setPaymentStatus(PaymentStatus.SUCCESS);
                paymentOrder.setReservationActive(false);

                paymentOrderRepository.save(paymentOrder);

                return savedBooking;
        }

        @Override
        public List<BookingResponse> getBookingsByUserEmail(String email) {

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                return bookingRepository.findByUserId(user.getId())
                                .stream()
                                .map(booking -> new BookingResponse(
                                                booking.getId(),
                                                booking.getBookingReference(),
                                                booking.getUser().getId(),
                                                booking.getUser().getFullName(),
                                                booking.getDarshanSlot().getId(),
                                                booking.getDarshanSlot().getCategory().getType().name(),
                                                booking.getDarshanSlot().getSlotDate(),
                                                booking.getVisitorCount(),
                                                booking.getAmount(),
                                                booking.getBookingStatus().name(),
                                                booking.getPaymentStatus().name(),
                                                qrTicketService.isTicketUsed(booking.getId()),
                                                booking.getBookedAt()))
                                .toList();
        }
}
