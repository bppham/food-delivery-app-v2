package com.example.ptitdelivery.activities;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.widget.Button;
import android.widget.EditText;
import android.widget.RadioButton;
import android.widget.RadioGroup;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.example.ptitdelivery.R;
import com.example.ptitdelivery.model.Requests.ShipperRegisterRequest;
import com.example.ptitdelivery.utils.DialogHelper;
import com.example.ptitdelivery.viewmodel.RegisterViewModel;

public class RegisterActivity extends AppCompatActivity {
    private Button btnReturn, btnRegister;
    private EditText edtFullName, edtEmail, edtPhoneNumber, edtAdress, edtPassword, edtRetypePassword, edtVehicleName, edtVehicleNumber;
    private RegisterViewModel viewModel;
    private RadioGroup radioGroupGender;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_register);

        btnReturn = findViewById(R.id.btn_register_return);
        btnRegister = findViewById(R.id.btn_register);
        edtFullName = findViewById(R.id.edt_register_fullname);
        edtEmail = findViewById(R.id.edt_register_email);
        edtPhoneNumber = findViewById(R.id.edt_register_phonenumber);
        edtAdress = findViewById(R.id.edt_register_address);
        edtPassword = findViewById(R.id.edt_register_password);
        edtRetypePassword = findViewById(R.id.edt_register_retype_password);
        edtVehicleName = findViewById(R.id.edt_register_vehicle_name);
        edtVehicleNumber = findViewById(R.id.edt_register_vehicle_number);
        radioGroupGender = findViewById(R.id.radioGroupGender);

        viewModel = new ViewModelProvider(this).get(RegisterViewModel.class);

        action();
    }

    private void action() {
        btnReturn.setOnClickListener(v -> finish());

        btnRegister.setOnClickListener(v -> {
            String name = edtFullName.getText().toString();
            String email = edtEmail.getText().toString();
            String phoneNumber = edtPhoneNumber.getText().toString();
            String address = edtAdress.getText().toString();
            String password = edtPassword.getText().toString();
            String retypePassword = edtRetypePassword.getText().toString();
            String vehicleName = edtVehicleName.getText().toString();
            String vehicleNumber = edtVehicleNumber.getText().toString();
            String gender = getSelectedGender();

            if (name.isEmpty() || email.isEmpty() || phoneNumber.isEmpty() || password.isEmpty()
                    || vehicleName.isEmpty() || vehicleNumber.isEmpty()) {
                DialogHelper.showErrorDialog(this, "Vui lòng điền đầy đủ thông tin.");
                return;
            }

            if (!password.equals(retypePassword)) {
                DialogHelper.showErrorDialog(this, "Mật khẩu không khớp.");
                return;
            }

            ShipperRegisterRequest request = new ShipperRegisterRequest(
                    name, email, phoneNumber, password, gender, address,vehicleNumber, vehicleName
            );

            // Gọi đăng ký
            viewModel.registerShipper(request);
        });

        // Lắng nghe kết quả đăng ký
        viewModel.getRegisterResponse().observe(this, response -> {
            DialogHelper.showSuccessDialog(this, "Đăng ký thành công!");
            // Hoặc bạn có thể delay 1 chút rồi finish()
            new Handler(Looper.getMainLooper()).postDelayed(() -> finish(), 1500);
        });

        viewModel.getErrorMessage().observe(this, error -> {
            DialogHelper.showErrorDialog(this, error);
        });
    }


    private String getSelectedGender() {
        int selectedGenderId = radioGroupGender.getCheckedRadioButtonId();
        String gender = "other"; // Mặc định là "other"

        if (selectedGenderId != -1) {
            RadioButton selectedRadioButton = findViewById(selectedGenderId);
            // Kiểm tra text của radio button và gán giá trị tương ứng
            if (selectedRadioButton.getText().toString().equalsIgnoreCase("Nam")) {
                gender = "male";
            } else if (selectedRadioButton.getText().toString().equalsIgnoreCase("Nữ")) {
                gender = "female";
            } else {
                gender = "other"; // Nếu là "Khác"
            }
        }

        return gender;
    }
}