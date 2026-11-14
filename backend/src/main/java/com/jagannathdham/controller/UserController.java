
package com.jagannathdham.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.jagannathdham.dto.AdminUserCreateRequest;
import com.jagannathdham.dto.ChangePasswordRequest;
import com.jagannathdham.dto.UserLoginRequest;
import com.jagannathdham.dto.UserLoginResponse;
import com.jagannathdham.dto.UserProfileResponse;
import com.jagannathdham.dto.UserProfileUpdateRequest;
import com.jagannathdham.dto.UserRegistrationRequest;
import com.jagannathdham.dto.UserRegistrationResponse;
import com.jagannathdham.entity.User;
import com.jagannathdham.exception.ResourceNotFoundException;
import com.jagannathdham.security.JwtService;
import com.jagannathdham.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.MediaType;

import java.util.List;
import com.jagannathdham.dto.AdminUserResponse;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    public UserController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserRegistrationResponse> registerUser(
            @Valid @RequestBody UserRegistrationRequest request) {

        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPassword(request.password());
        user.setPhone(request.phone());

        User savedUser = userService.registerUser(user);

        UserRegistrationResponse response = new UserRegistrationResponse(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getRole()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponse> loginUser(
            @Valid @RequestBody UserLoginRequest request) {

        User user = userService.authenticateUser(
                request.email(), request.password()
        );

        String token = jwtService.generateToken(user.getEmail());
        UserLoginResponse response = new UserLoginResponse(
                token,
                "Bearer",
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userService.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserProfileResponse response = new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getCreatedAt(),
                user.getProfileImageUrl()
        );

        return ResponseEntity.ok(response);
    }
    

    @PutMapping("/profile")
    	public ResponseEntity<UserProfileResponse> updateUserProfile(
        @Valid @RequestBody UserProfileUpdateRequest request,
        Authentication authentication) {

    	String email = authentication.getName();

    	User user = userService.updateProfile(
            email,
            request.fullName(),
            request.phone()
    			);

    	UserProfileResponse response = new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getCreatedAt(),
                user.getProfileImageUrl()
        );


    	return ResponseEntity.ok(response);
}
    	

    	@PutMapping("/change-password")
    	public ResponseEntity<String> changePassword(
        @Valid @RequestBody ChangePasswordRequest request,
        Authentication authentication) {

    String email = authentication.getName();

    userService.changePassword(
            email,
            request.currentPassword(),
            request.newPassword(),
            request.confirmPassword()
    );

    return ResponseEntity.ok("Password changed successfully");
}
    	

    	@PostMapping("/admin/staff")
    	public ResponseEntity<UserRegistrationResponse> createStaff(
    			@Valid @RequestBody AdminUserCreateRequest request) {

    		UserRegistrationResponse response = userService.createStaffUser(request);

    		return ResponseEntity.status(HttpStatus.CREATED)
            .body(response);
}
    	
    	@PostMapping(
    		    value = "/profile/photo",
    		    consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    		)
    		public ResponseEntity<UserProfileResponse> uploadProfilePhoto(
    		        @RequestParam("file") MultipartFile file,
    		        Authentication authentication) {

    		    User user = userService.uploadProfileImage(
    		            authentication.getName(), file);

    		    UserProfileResponse response = new UserProfileResponse(
    		            user.getId(),
    		            user.getFullName(),
    		            user.getEmail(),
    		            user.getPhone(),
    		            user.getRole(),
    		            user.getCreatedAt(),
    		            user.getProfileImageUrl()
    		    );

    		    return ResponseEntity.ok(response);
    		}

    		@DeleteMapping("/profile/photo")
    		public ResponseEntity<UserProfileResponse> removeProfilePhoto(
    		        Authentication authentication) {

    		    User user = userService.removeProfileImage(
    		            authentication.getName());

    		    UserProfileResponse response = new UserProfileResponse(
    		            user.getId(),
    		            user.getFullName(),
    		            user.getEmail(),
    		            user.getPhone(),
    		            user.getRole(),
    		            user.getCreatedAt(),
    		            user.getProfileImageUrl()
    		    );

    		    return ResponseEntity.ok(response);
    		}
    		

@GetMapping("/admin/all")
public ResponseEntity<List<AdminUserResponse>> getAllUsers() {

    List<AdminUserResponse> users = userService.getAllUsers()
            .stream()
            .map(user -> new AdminUserResponse(
                    user.getId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getPhone(),
                    user.getRole(),
                    user.getActive(),
                    user.getCreatedAt(),
                    user.getProfileImageUrl()
            ))
            .toList();

    return ResponseEntity.ok(users);
}

    		
    	



}
