package com.example.ptitdelivery.activities;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.ViewModel;
import androidx.lifecycle.ViewModelProvider;

import com.example.ptitdelivery.R;
import com.example.ptitdelivery.network.retrofit.AuthRetrofitFactory;
import com.example.ptitdelivery.repositories.AuthRepository;
import com.example.ptitdelivery.viewmodel.LoginViewModel;

public class LoginActivity extends AppCompatActivity {
    private Button btnLogin, btnFingerprint;
    private EditText edtLoginEmail, edtLoginPassword;
    private TextView tvRegister, tvForgotPassword;
    private LoginViewModel loginViewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_login);


        AuthRepository repository = new AuthRepository();
        btnLogin = findViewById(R.id.btnLogin);
        btnFingerprint = findViewById(R.id.btnLoginWithFingerprint);
        edtLoginEmail = findViewById(R.id.edtLoginEmail);
        edtLoginPassword = findViewById(R.id.edtLoginPassword);
        tvRegister = findViewById(R.id.tv_register);
        tvForgotPassword = findViewById(R.id.tvForgotPassword);

        loginViewModel = new ViewModelProvider(this, new ViewModelProvider.Factory() {
            @NonNull
            @Override
            public <T extends ViewModel> T create(@NonNull Class<T> modelClass) {
                return (T) new LoginViewModel(repository);
            }
        }).get(LoginViewModel.class);

        observeLogin();
        action();
        maybeLoginWithFingerprint();
    }
    private void observeLogin() {
        loginViewModel.getLoginResponse().observe(this, loginResponse -> {
            Log.d("DEBUG_LOGIN", "LoginResponse: token=" + loginResponse.getData().getToken()
                    + ", id=" + loginResponse.getData().get_id()  + ", refreshToken=" + loginResponse.getData().getRefreshToken());
            SharedPreferences sharedPreferences = getSharedPreferences("UserPrefs", MODE_PRIVATE);
            SharedPreferences.Editor editor = sharedPreferences.edit();
            editor.clear();
            editor.putString("token", "Bearer " + loginResponse.getData().getToken());
            editor.putString("id", loginResponse.getData().get_id());
            editor.putString("refreshToken", loginResponse.getData().getRefreshToken());
            editor.apply();
            AuthRetrofitFactory.init("Bearer " + loginResponse.getData().getToken());
            Intent intent = new Intent(LoginActivity.this, MainActivity.class);
            intent.putExtra("TOKEN",loginResponse.getData().getToken());
            startActivity(intent);
            finish();
        });

        loginViewModel.getLoginError().observe(this, error -> {
            Toast.makeText(LoginActivity.this, "Error: " + error, Toast.LENGTH_SHORT).show();
        });
    }
    public void action() {
        btnLogin.setOnClickListener(view -> {
            String email = edtLoginEmail.getText().toString();
            String password = edtLoginPassword.getText().toString();
            Log.d("DEBUG_LOGIN 2", email
                    + ", pass=" + password);
            loginViewModel.login(email, password);
        });

        tvRegister.setOnClickListener(view -> {
            Intent intent = new Intent(LoginActivity.this, RegisterActivity.class);
            startActivity(intent);
        });

        tvForgotPassword.setOnClickListener(view -> {
            Intent intent = new Intent(LoginActivity.this, ForgotPasswordActivity.class);
            startActivity(intent);
        });
        btnFingerprint.setOnClickListener(v -> {
            SharedPreferences prefs = getSharedPreferences("UserPrefs", MODE_PRIVATE);
            String id = prefs.getString("id", null);
            String token = prefs.getString("token", null);

            if (id != null && token != null) {
                boolean isEnabled = prefs.getBoolean("fingerprint_enabled_" + id, false);
                if (isEnabled) {
                    showFingerprintDialog(token);
                } else {
                    Toast.makeText(this, "Bạn chưa thiết lập đăng nhập bằng vân tay", Toast.LENGTH_SHORT).show();
                }
            } else {
                Toast.makeText(this, "Bạn chưa đăng nhập để lưu thông tin vân tay", Toast.LENGTH_SHORT).show();
            }
        });
    }
    private void maybeLoginWithFingerprint() {
        SharedPreferences sharedPreferences = getSharedPreferences("UserPrefs", MODE_PRIVATE);
        String savedToken = sharedPreferences.getString("token", null);
        String userId = sharedPreferences.getString("id", null);
        boolean isFingerprintEnabled = false;

        if (userId != null) {
            isFingerprintEnabled = sharedPreferences.getBoolean("fingerprint_enabled_" + userId, false);
        }

        Log.d("DEBUG_FP", "usserId = " + userId);
        Log.d("DEBUG_FP", "savedToken = " + savedToken);
        Log.d("DEBUG_FP", "isFingerprintEnabled = " + isFingerprintEnabled);

        if (savedToken != null && userId != null && isFingerprintEnabled) {
            showFingerprintDialog(savedToken);
        }
    }


    private void showFingerprintDialog(String savedToken) {
        BiometricPrompt.PromptInfo promptInfo = new BiometricPrompt.PromptInfo.Builder()
                .setTitle("Xác thực vân tay")
                .setSubtitle("Đăng nhập bằng vân tay đã lưu")
                .setNegativeButtonText("Huỷ")
                .build();

        BiometricPrompt biometricPrompt = new BiometricPrompt(this,
                ContextCompat.getMainExecutor(this),
                new BiometricPrompt.AuthenticationCallback() {
                    @Override
                    public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
                        super.onAuthenticationSucceeded(result);
                        Intent intent = new Intent(LoginActivity.this, MainActivity.class);
                        intent.putExtra("TOKEN", savedToken.replace("Bearer ", ""));
                        AuthRetrofitFactory.init(savedToken);
                        startActivity(intent);
                        finish();
                    }

                    @Override
                    public void onAuthenticationFailed() {
                        super.onAuthenticationFailed();
                        Toast.makeText(LoginActivity.this, "Xác thực thất bại!", Toast.LENGTH_SHORT).show();
                    }

                    @Override
                    public void onAuthenticationError(int errorCode, @NonNull CharSequence errString) {
                        super.onAuthenticationError(errorCode, errString);
                        Toast.makeText(LoginActivity.this, "Lỗi: " + errString, Toast.LENGTH_SHORT).show();
                    }
                });

        biometricPrompt.authenticate(promptInfo);
    }
};