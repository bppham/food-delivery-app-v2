package com.example.ptitdelivery.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.example.ptitdelivery.R;
import com.example.ptitdelivery.model.Requests.ForgetPasswordRequest;
import com.example.ptitdelivery.utils.DialogHelper;
import com.example.ptitdelivery.viewmodel.ForgetPasswordViewModel;

public class ForgotPasswordActivity extends AppCompatActivity {
    private static final String TAG = "ForgotPasswordActivity";
    private Button btnForgetPasswordNext, btnReturn;
    private EditText edtEmail;
    private ForgetPasswordViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_forgot_password);

        btnForgetPasswordNext = findViewById(R.id.btn_forget_password_next);
        btnReturn = findViewById(R.id.btn_forget_password_return);
        edtEmail = findViewById(R.id.edt_forget_password_email);
        viewModel = new ViewModelProvider(this).get(ForgetPasswordViewModel.class);
        observeViewModel();
        action();
    }
    private void observeViewModel() {
        viewModel.getForgetPasswordResponse().observe(this, response -> {
            if (response.isSuccess()) {
                // Thành công -> sang màn hình nhập OTP
                Intent intent = new Intent(ForgotPasswordActivity.this, VerifyCodeActivity.class);
                intent.putExtra("email", edtEmail.getText().toString()); // Truyền email nếu cần
                startActivity(intent);
            } else {
                // Backend trả về status lỗi
                DialogHelper.showErrorDialog(this, response.getMessage());
            }
        });

        viewModel.getErrorMessage().observe(this, error -> {
            DialogHelper.showErrorDialog(this, error);
        });
    }

    private void action(){
        btnForgetPasswordNext.setOnClickListener(view -> {
            String email = edtEmail.getText().toString();
            if (email.isEmpty()) {
                DialogHelper.showErrorDialog(this, "Vui lòng nhập email.");
                return;
            }

            ForgetPasswordRequest request = new ForgetPasswordRequest(email);
            viewModel.forgetPassword(request);

        });

        btnReturn.setOnClickListener(v -> {
            finish();
        });
    }
}