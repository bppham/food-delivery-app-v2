package com.example.ptitdelivery.activities;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.lifecycle.ViewModelProvider;

import com.example.ptitdelivery.R;
import com.example.ptitdelivery.model.Requests.ChangePasswordRequest;
import com.example.ptitdelivery.model.Responses.ChangePasswordResponse;
import com.example.ptitdelivery.viewmodel.ProfileViewModel;

public class ChangePasswordActivity extends AppCompatActivity {
    private EditText edtOldPassword, edtNewPassword, edtConfirmPassword;
    private Button btnConfirm;
    private ProgressBar progressBar;
    private Toolbar toolbar;
    private ProfileViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_change_password);

        initViews();
        setupToolbar();
        setupViewModel();
        setupActions();
    }

    private void initViews() {
        edtOldPassword = findViewById(R.id.edt_change_password_old_password);
        edtNewPassword = findViewById(R.id.edt_change_password_new_password);
        edtConfirmPassword = findViewById(R.id.edt_change_password_confirm_password);
        btnConfirm = findViewById(R.id.btn_change_password_confirm);
        progressBar = findViewById(R.id.progressBar_change_password);
        toolbar = findViewById(R.id.toolbar_change_password);
    }

    private void setupToolbar() {
        toolbar.setNavigationOnClickListener(v -> finish());
    }

    private void setupViewModel() {
        viewModel = new ViewModelProvider(this).get(ProfileViewModel.class);

        // Quan sát kết quả đổi mật khẩu
        viewModel.getResponseChangePassword().observe(this, response -> {
            if (response != null) {
                Log.d("ChangePasswordActivity", "Response: " + response);
                showToast(response.getMessage());
                if (response.isSuccess()) {
                    finish();
                }
            }
        });

        // Quan sát lỗi
        viewModel.getErrorMessageLiveData().observe(this, error -> {
            if (error != null) showToast("Lỗi: " + error);
        });

        // Quan sát trạng thái loading
        viewModel.getIsLoadingLiveData().observe(this, isLoading -> {
            progressBar.setVisibility(isLoading ? View.VISIBLE : View.GONE);
        });
    }

    private void setupActions() {
        btnConfirm.setOnClickListener(view -> {
            String oldPassword = edtOldPassword.getText().toString().trim();
            String newPassword = edtNewPassword.getText().toString().trim();
            String confirmPassword = edtConfirmPassword.getText().toString().trim();

            // Kiểm tra input
            if (oldPassword.isEmpty() || newPassword.isEmpty() || confirmPassword.isEmpty()) {
                showToast("Vui lòng nhập đầy đủ thông tin.");
                return;
            }

            if (!newPassword.equals(confirmPassword)) {
                showToast("Mật khẩu mới và xác nhận không khớp.");
                return;
            }

            // Gửi request đến ViewModel
            ChangePasswordRequest request = new ChangePasswordRequest(oldPassword, newPassword);
            viewModel.resetPassword(request);
        });
    }

    private void showToast(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }
}
