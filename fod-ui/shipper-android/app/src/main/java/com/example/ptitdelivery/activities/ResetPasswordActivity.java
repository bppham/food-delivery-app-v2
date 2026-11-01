package com.example.ptitdelivery.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.example.ptitdelivery.R;
import com.example.ptitdelivery.model.Requests.ResetPasswordRequest;
import com.example.ptitdelivery.utils.DialogHelper;
import com.example.ptitdelivery.viewmodel.ResetPasswordViewModel;

public class ResetPasswordActivity extends AppCompatActivity {
    private ResetPasswordViewModel viewModel;
    private EditText edtNewPassword, edtRetypePassword;
    private Button btnConfirm, btnReturn;
    private String email;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_reset_password);
        edtNewPassword = findViewById(R.id.edt_new_password);
        edtRetypePassword = findViewById(R.id.edt_retype_password);
        btnConfirm = findViewById(R.id.btn_reset_password_confirm);
        btnReturn = findViewById(R.id.btn_reset_password_return);
        email = this.getIntent().getStringExtra("email");
        viewModel = new ViewModelProvider(this).get(ResetPasswordViewModel.class);
        action();
        observeModel();
    }

    private void observeModel() {
        viewModel.getResetPasswordResponse().observe(this, response -> {
            if (response.isSuccess()) {
                Intent intent = new Intent(ResetPasswordActivity.this, LoginActivity.class);
                startActivity(intent);
            } else {
                DialogHelper.showErrorDialog(this, response.getMessage());
            }
        });

        viewModel.getErrorMessage().observe(this, error -> {
            DialogHelper.showErrorDialog(this, error);
        });
    }

    private void action(){
        btnConfirm.setOnClickListener(view -> {
            String newPassword = edtNewPassword.getText().toString();
            String retypePassword = edtRetypePassword.getText().toString();
            if (newPassword.isEmpty()) {
                DialogHelper.showErrorDialog(this, "Vui lòng nhập mật khẩu mới.");
                return;
            } else if (newPassword.length() < 6) {
                DialogHelper.showErrorDialog(this, "Mật khẩu phải có ít nhất 6 ký tự.");
                return;

            } else if (!newPassword.equals(retypePassword)) {
                DialogHelper.showErrorDialog(this, "Mật khẩu không khớp.");
                return;
            } else {
                ResetPasswordRequest request = new ResetPasswordRequest(email, newPassword);
                viewModel.resetPassword(request);
            }
        });

        btnReturn.setOnClickListener(v -> {
            Intent intent = new Intent(ResetPasswordActivity.this, LoginActivity.class);
            startActivity(intent);
        });
    }
}