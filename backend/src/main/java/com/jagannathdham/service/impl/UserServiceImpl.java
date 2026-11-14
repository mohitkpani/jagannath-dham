
package com.jagannathdham.service.impl;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.jagannathdham.dto.AdminUserCreateRequest;
import com.jagannathdham.dto.UserRegistrationResponse;
import com.jagannathdham.entity.User;
import com.jagannathdham.exception.BadRequestException;
import com.jagannathdham.repository.UserRepository;
import com.jagannathdham.service.CloudinaryService;
import com.jagannathdham.service.EmailService;
import com.jagannathdham.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final CloudinaryService cloudinaryService;

    public UserServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            CloudinaryService cloudinaryService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.cloudinaryService = cloudinaryService;
    }

    @Override
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByPhone(String phone) {
        return userRepository.existsByPhone(phone);
    }

    @Override
    public User registerUser(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        if (user.getPhone() != null
                && userRepository.existsByPhone(user.getPhone())) {
            throw new BadRequestException("Phone number is already registered");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Save user first
        User savedUser = userRepository.save(user);

        // Send welcome email without interrupting registration
        try {
            emailService.sendRegistrationEmail(
                    savedUser.getEmail(),
                    savedUser.getFullName()
            );
        } catch (RuntimeException e) {
            System.err.println(
                    "Welcome email could not be sent: " + e.getMessage()
            );
        }

        return savedUser;
    }

    @Override
    public User authenticateUser(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new BadRequestException("Invalid email or password"));

        if (!user.getActive()) {
            throw new BadRequestException("Your account is inactive");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        return user;
    }

    @Override
    public User updateProfile(String email, String fullName, String phone) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new BadRequestException("User not found"));

        // Check whether another user already uses this phone number
        if (phone != null && !phone.isBlank()
                && userRepository.existsByPhoneAndIdNot(phone, user.getId())) {
            throw new BadRequestException(
                    "Phone number is already registered"
            );
        }

        user.setFullName(fullName);
        user.setPhone(phone);

        return userRepository.save(user);
    }

    @Override
    public User changePassword(
            String email,
            String currentPassword,
            String newPassword,
            String confirmPassword) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new BadRequestException("User not found"));
        // Verify current password
        if (!passwordEncoder.matches(
                currentPassword, user.getPassword())) {
            throw new BadRequestException(
                    "Current password is incorrect"
            );
        }
        // Check new password confirmation
        if (!newPassword.equals(confirmPassword)) {
            throw new BadRequestException(
                    "New passwords do not match"
            );
        }
        // Prevent reusing the current password
        if (passwordEncoder.matches(
                newPassword, user.getPassword())) {
            throw new BadRequestException(
                    "New password must be different from current password"
            );
        }
        // Encrypt and save the new password
        user.setPassword(passwordEncoder.encode(newPassword));

        return userRepository.save(user);
    }
    

@Override
public UserRegistrationResponse createStaffUser(
        AdminUserCreateRequest request) {

    if (userRepository.existsByEmail(request.email())) {
        throw new BadRequestException("Email is already registered");
    }

    if (request.phone() != null && !request.phone().isBlank()
            && userRepository.existsByPhone(request.phone())) {
        throw new BadRequestException("Phone number is already registered");
    }

    User user = new User();

    user.setFullName(request.fullName());
    user.setEmail(request.email());
    user.setPassword(passwordEncoder.encode(request.password()));
    user.setPhone(request.phone());
    user.setRole("STAFF");
    user.setActive(true);

    User savedUser = userRepository.save(user);

    return new UserRegistrationResponse(
            savedUser.getId(),
            savedUser.getFullName(),
            savedUser.getEmail(),
            savedUser.getPhone(),
            savedUser.getRole()
    );
}

@Override
public User uploadProfileImage(String email, MultipartFile file) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BadRequestException("User not found"));

    // Upload the new image first
    Map<String, String> image =
            cloudinaryService.uploadProfileImage(file);

    String oldPublicId = user.getProfileImagePublicId();

    // Update user record
    user.setProfileImageUrl(image.get("url"));
    user.setProfileImagePublicId(image.get("publicId"));

    User savedUser = userRepository.save(user);

    // Delete previous image after successful database save
    if (oldPublicId != null && !oldPublicId.isBlank()) {
        try {
            cloudinaryService.deleteProfileImage(oldPublicId);
        } catch (RuntimeException e) {
            System.err.println(
                    "Old profile image cleanup failed: " + e.getMessage()
            );
        }
    }

    return savedUser;
}

@Override
public User removeProfileImage(String email) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BadRequestException("User not found"));

    String publicId = user.getProfileImagePublicId();

    user.setProfileImageUrl(null);
    user.setProfileImagePublicId(null);

    User savedUser = userRepository.save(user);

    if (publicId != null && !publicId.isBlank()) {
        cloudinaryService.deleteProfileImage(publicId);
    }

    return savedUser;
}

@Override
public List<User> getAllUsers() {
    return userRepository.findAll();
}

}
