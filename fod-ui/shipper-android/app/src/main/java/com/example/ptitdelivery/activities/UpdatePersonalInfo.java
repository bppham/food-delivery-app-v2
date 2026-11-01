package com.example.ptitdelivery.activities;

import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.fragment.app.FragmentTransaction;
import androidx.lifecycle.ViewModelProvider;

import com.example.ptitdelivery.R;
import com.example.ptitdelivery.fragments.ProfileFragment;
import com.example.ptitdelivery.model.Requests.ShipperUpdationRequest;
import com.example.ptitdelivery.model.Shipper;
import com.example.ptitdelivery.model.Vehicle;
import com.example.ptitdelivery.viewmodel.ProfileViewModel;

public class UpdatePersonalInfo extends AppCompatActivity {
    private static final String TAG = "UpdatePersonalInfo";
    private EditText edtPhonenumber, edtVehicleName, edtVehicleNumber;
    private RadioGroup radioGroupGender;
    private RadioButton radioMale, radioFemale, radioOther;
    private Button btnConfirm;
    private Toolbar toolbar;
    private ProfileViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_update_personal_info);

        edtPhonenumber = findViewById(R.id.edt_update_phonenumber);
        edtVehicleName = findViewById(R.id.edt_update_vehicle_name);
        edtVehicleNumber = findViewById(R.id.edt_update_vehicle_number);
        radioGroupGender = findViewById(R.id.radioGroupUpdateGender);
        toolbar = findViewById(R.id.toolbar_update_profile);
        btnConfirm = findViewById(R.id.btn_update_copnfirm);
        radioMale = findViewById(R.id.radioMale);
        radioFemale = findViewById(R.id.radioFemale);
        radioOther = findViewById(R.id.radioOther);

        toolbar.setNavigationOnClickListener(v -> {
            finish();
        });

        Shipper shipper = (Shipper) getIntent().getSerializableExtra("shipper");
        if (shipper != null) {
            showInformatioin(shipper);
        } else {
            Log.d(TAG, "onCreate: shipper is null");
        }
        viewModel = new ViewModelProvider(this).get(ProfileViewModel.class);
        action();
    }
    private void showInformatioin(Shipper shipper){
        edtPhonenumber.setText(shipper.getPhonenumber());
        edtVehicleName.setText(shipper.getVehicle().getVehicleType());
        edtVehicleNumber.setText(shipper.getVehicle().getVehicleNumber());

        String gender = shipper.getGender();
        if (gender != null) {
            switch (gender.toLowerCase()) {
                case "male":
                    radioMale.setChecked(true);
                    break;
                case "female":
                    radioFemale.setChecked(true);
                    break;
                case "other":
                    radioOther.setChecked(true);
                    break;
                default:
                    break;
            }
        }
    }

    private void action() {
        viewModel.getIsUpdateSuccess().observe(this, success -> {
            if (success != null && success) {
                Toast.makeText(this, "Cập nhật thành công", Toast.LENGTH_SHORT).show();
                FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
                transaction.replace(R.id.update_info_container, new ProfileFragment());
                transaction.addToBackStack(null);
                transaction.commit();
            } else {
                Toast.makeText(this, "Cập nhật thất bại", Toast.LENGTH_SHORT).show();
            }
        });

        btnConfirm.setOnClickListener(v -> {
            String newPhoneNumber = edtPhonenumber.getText().toString().trim();
            String newVehicleName = edtVehicleName.getText().toString().trim();
            String newVehicleNumber = edtVehicleNumber.getText().toString().trim();

            String newGender = null;
            int selectedGenderId = radioGroupGender.getCheckedRadioButtonId();
            if (selectedGenderId == R.id.radioMale) newGender = "male";
            else if (selectedGenderId == R.id.radioFemale) newGender = "female";
            else if (selectedGenderId == R.id.radioOther) newGender = "other";

            ShipperUpdationRequest updatedShipper = new ShipperUpdationRequest();
            updatedShipper.setPhonenumber(newPhoneNumber);
            updatedShipper.setGender(newGender);

            updatedShipper.setVehicleType(newVehicleName);
            updatedShipper.setVehicleNumber(newVehicleNumber);

            viewModel.updateShipper(updatedShipper);
        });
    }

}